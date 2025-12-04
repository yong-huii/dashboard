import * as am4core from "@amcharts/amcharts4/core";
import * as am4plugins_forceDirected from "@amcharts/amcharts4/plugins/forceDirected";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

type ChartData = {
  name: string;
  value: number;
  linkWith: string[];
  children: { name: string; value: number }[];
};

interface ForceDirectedOptions {
  colors?: string[];
  fontSize?: number;
}

export default function forceDirectedNetwork2(
  id: string,
  data: ChartData[],
  options: ForceDirectedOptions = {},
) {
  // 테마 적용
  am4core.useTheme(am4themes_animated);

  // 기존 차트가 있으면 제거

  const chartDiv = document.getElementById(id);
  if (!chartDiv) return;
  const chartDivAny = chartDiv as any;
  if (chartDivAny.amChart) {
    chartDivAny.amChart.dispose();
    chartDivAny.amChart = null;
  }

  // 차트 생성
  const chart = am4core.create(id, am4plugins_forceDirected.ForceDirectedTree);

  // 워터마크(logo) 제거
  chart.logo.disabled = true;
  chart.padding(40, 20, 20, 20);
  chartDivAny.amChart = chart;

  // 시리즈 생성
  const networkSeries = chart.series.push(
    new am4plugins_forceDirected.ForceDirectedSeries(),
  );
  networkSeries.dataFields.linkWith = "linkWith";
  networkSeries.dataFields.name = "name";
  networkSeries.dataFields.id = "name";
  networkSeries.dataFields.value = "value";
  networkSeries.dataFields.children = "children";

  networkSeries.nodes.template.label.text = "{name}";
  networkSeries.fontSize =
    typeof options.fontSize === "number" ? options.fontSize : 11;
  networkSeries.linkWithStrength = 0;

  networkSeries.minRadius = 10 * 0.7;
  networkSeries.maxRadius = 80 * 0.7;

  // 노드 템플릿
  const nodeTemplate = networkSeries.nodes.template;
  nodeTemplate.tooltipText = "{name}: {value}";
  nodeTemplate.tooltip = new am4core.Tooltip();
  nodeTemplate.tooltip.label.fontSize =
    typeof options.fontSize === "number" ? options.fontSize : 11;
  nodeTemplate.fillOpacity = 1;
  nodeTemplate.label.hideOversized = true;
  nodeTemplate.label.truncate = true;
  // color propertyFields로 palette 순서대로 색상 적용
  nodeTemplate.propertyFields.fill = "color";

  // 색상 팔레트 적용 (am4core.ColorSet 활용, 순서대로 적용)
  if (options.colors && options.colors.length > 0) {
    const colorSet = new am4core.ColorSet();
    colorSet.list = options.colors.map(c => am4core.color(c));
    (colorSet as any).wrap = true;
    networkSeries.colors = colorSet;
  }

  // 링크 템플릿
  const linkTemplate = networkSeries.links.template;
  linkTemplate.strokeWidth = 1;
  const linkHoverState = linkTemplate.states.create("hover");
  linkHoverState.properties.strokeOpacity = 1;
  linkHoverState.properties.strokeWidth = 2;

  // 노드 hover 이벤트
  nodeTemplate.events.on("over", function (event) {
    const dataItem = event.target.dataItem;
    dataItem.childLinks.each(function (link: any) {
      link.isHover = true;
    });
  });
  nodeTemplate.events.on("out", function (event) {
    const dataItem = event.target.dataItem;
    dataItem.childLinks.each(function (link: any) {
      link.isHover = false;
    });
  });

  // 데이터 적용
  networkSeries.data = data;

  // 차트 반환 (차트 객체 필요시)
  return chart;
}
