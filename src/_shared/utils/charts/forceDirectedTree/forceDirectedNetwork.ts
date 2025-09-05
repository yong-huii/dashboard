import * as am4core from "@amcharts/amcharts4/core";
import * as am4plugins_forceDirected from "@amcharts/amcharts4/plugins/forceDirected";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

export interface ForceNetworkNode {
  name: string;
  value?: number;
  children?: ForceNetworkNode[];
  linkWith?: string[];
}

export interface ForceDirectedNetworkOptions {
  fontSize?: number; // 노드 폰트 크기
  linkWithStrength?: number; // 링크 강도
  hideLogo?: boolean; // amCharts 로고 제거(라이선스 필요)
  colors?: string[]; // 사용자 지정 색상 팔레트
  wrapColors?: boolean; // 팔레트 순환 (기본 true)
  randomizeColorOrder?: boolean; // 최초 1회 색상 랜덤 셔플
}

/**
 * amCharts4 Force Directed Network 차트 생성 함수
 * @param rootId 차트가 렌더링될 DOM id
 * @param data ForceNetworkNode 데이터
 * @param options ForceDirectedNetworkOptions
 * @returns chart 인스턴스
 */
export function forceDirectedNetwork(
  rootId: string,
  data: ForceNetworkNode | ForceNetworkNode[] = { name: "", children: [] },
  options: ForceDirectedNetworkOptions = {
    fontSize: 11,
    linkWithStrength: 0,
    hideLogo: true,
  },
) {
  am4core.useTheme(am4themes_animated);

  const {
    fontSize = 11,
    linkWithStrength = 0,
    hideLogo = true,
    colors,
    wrapColors = true,
    randomizeColorOrder = false,
  } = options || {};

  const chart = am4core.create(
    rootId,
    am4plugins_forceDirected.ForceDirectedTree,
  );

  if (hideLogo && chart.logo) {
    chart.logo.disabled = true;
  }

  const networkSeries = chart.series.push(
    new am4plugins_forceDirected.ForceDirectedSeries(),
  );
  networkSeries.dataFields.linkWith = "linkWith";
  networkSeries.dataFields.name = "name";
  networkSeries.dataFields.id = "name";
  networkSeries.dataFields.value = "value";
  networkSeries.dataFields.children = "children";

  networkSeries.nodes.template.label.text = "{name}";
  networkSeries.fontSize = fontSize ?? 12;
  networkSeries.linkWithStrength = linkWithStrength ?? 0;

  // 색상 팔레트 적용
  if (colors && colors.length) {
    const colorSet = new am4core.ColorSet();
    const list = colors.slice();
    if (randomizeColorOrder) {
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
    }
    colorSet.list = list.map(c => am4core.color(c));
    (colorSet as any).wrap = wrapColors !== false; // 기본 true
    networkSeries.colors = colorSet;
  }

  const nodeTemplate = networkSeries.nodes.template;
  nodeTemplate.tooltipText = "{name}";
  nodeTemplate.fillOpacity = 1;
  nodeTemplate.label.hideOversized = true;
  nodeTemplate.label.truncate = true;

  const linkTemplate = networkSeries.links.template;
  linkTemplate.strokeWidth = 1;
  const linkHoverState = linkTemplate.states.create("hover");
  linkHoverState.properties.strokeOpacity = 1;
  linkHoverState.properties.strokeWidth = 2;

  nodeTemplate.events.on("over", function (event: any) {
    const dataItem = event.target.dataItem;
    dataItem.childLinks.each(function (link: any) {
      link.isHover = true;
    });
  });

  nodeTemplate.events.on("out", function (event: any) {
    const dataItem = event.target.dataItem;
    dataItem.childLinks.each(function (link: any) {
      link.isHover = false;
    });
  });

  // 여러 root 지원: data가 배열이면 그대로, 아니면 배열로 감싸기
  if (Array.isArray(data)) {
    networkSeries.data = data;
  } else {
    networkSeries.data = [data];
  }

  return chart;
}
