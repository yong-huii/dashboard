/* stackBar 패턴 참고: 함수 형태로 변환 */
import * as am5 from "@amcharts/amcharts5";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

export interface ForceNode {
  name: string;
  value?: number;
  children?: ForceNode[];
  linkWith?: string[];
}

// 추가 옵션: hideLogo -> 정식 라이선스가 있는 경우 로고 제거
export interface ForceDirectedTreeOptions {
  hideLogo?: boolean; // true 시 amCharts 로고 dispose (라이선스 필요)
}

export function forceDirectedTree(
  rootId: string,
  data = [],
  options: ForceDirectedTreeOptions = { hideLogo: true },
) {
  const root = am5.Root.new(rootId);
  root.setThemes([am5themes_Animated.new(root)]);

  // 로고 처리: hideLogo 옵션이 true이면 제거 (라이선스 필요). 아니면 기존 위치 하단 우측 고정
  if (options.hideLogo) {
    // 정식 라이선스가 없는 상태에서 제거는 약관 위반이 될 수 있음
    root._logo?.dispose();
  } else {
    root._logo?.setAll({
      x: am5.p100,
      y: am5.p100,
      centerX: am5.p100,
      centerY: am5.p100,
      paddingRight: 10,
      paddingBottom: 10,
    });
  }

  const container = root.container.children.push(
    am5.Container.new(root, {
      width: am5.percent(100),
      height: am5.percent(100),
      layout: root.verticalLayout,
    }),
  );

  const series = container.children.push(
    am5hierarchy.ForceDirected.new(root, {
      singleBranchOnly: false,
      downDepth: 2,
      topDepth: 1,
      initialDepth: 1,
      valueField: "value",
      categoryField: "name",
      childDataField: "children",
      idField: "name",
      linkWithField: "linkWith",
      manyBodyStrength: -10,
      centerStrength: 0.8,
    }),
  );

  series.set(
    "colors",
    am5.ColorSet.new(root, {
      colors: [
        am5.color("#4A80D6"),
        am5.color("#5459AC"),
        am5.color("#648DB3"),
        am5.color("#B2D8CE"),
      ],
      reuse: true,
    }),
  );

  // 노드(라벨) 글씨 색상을 gray-100(#F3F4F6)으로 지정
  series.labels.template.setAll({ fill: am5.color("#F3F4F6") });

  series.links.template.set("strength", 0.5);
  series.data.setAll([data]);
  series.set("selectedDataItem", series.dataItems[0]);
  series.appear(1000, 100);

  return root;
}
