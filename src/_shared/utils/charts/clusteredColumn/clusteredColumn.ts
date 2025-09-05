import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";

export type ClusteredColumnDatum = Record<string, string | number>;

export interface ClusteredColumnSeriesConfig {
  valueField: string;
  name?: string;
  color?: am5.Color | string; // 문자열(hex)도 허용
  showValueLabel?: boolean;
}

export interface ClusteredColumnOptions {
  hideLogo?: boolean;
  categoryField?: string; // 기본 year
  showLegend?: boolean;
  series?: ClusteredColumnSeriesConfig[];
  numberFormat?: string;
  tooltipText?: string; // 기본 "{name}, {categoryX}:{valueY}"
  leftPadding?: number; // 차트 왼쪽 여백 (기본 16)
  centerHorizontally?: boolean; // 차트 플롯을 수평 가운데 정렬
  topPadding?: number; // 차트 상단 여백 (기본 12) - 상단 잘림 방지
  /** 작은 화면에서 레이블이 자동 생략되는 것을 막고 모두 표시 */
  showAllCategories?: boolean;
  /** x축 레이블 회전 (예: -45) */
  xLabelRotation?: number;
  /** 시리즈 색상 팔레트 (지정 시 내부 기본 팔레트 대체) */
  colors?: (string | number)[];
  /** 막대(컬럼) 너비 퍼센트 (0~100). 기본 90 (기존 동작). 더 좁게 하려면 40~70 권장 */
  columnWidthPercent?: number;
  /** 막대 상단 모서리 둥글기(px). 기본 4 */
  columnCornerRadius?: number;
  /** 해당 폭(px) 이하일 때 범례 숨김 (기본 1024). 0 또는 음수로 설정 시 항상 표시 */
  hideLegendBelowWidth?: number;
}

export function clusteredColumn(
  rootId: string,
  data: ClusteredColumnDatum[] = [],
  options: ClusteredColumnOptions = {},
) {
  const {
    hideLogo = true,
    showLegend = true,
    series: seriesOption,
    numberFormat = "#.#s",
    categoryField: categoryFieldOption,
    tooltipText = "{name}, {categoryX}:{valueY}",
    showAllCategories = false,
    xLabelRotation,
    colors,
    columnWidthPercent = 90,
    columnCornerRadius = 4,
    hideLegendBelowWidth = 1024,
  } = options;

  const categoryField = categoryFieldOption || "year";

  // 기존 root 제거
  const existingRoot = (am5 as any).registry.rootElements.find(
    (r: am5.Root) => r.dom.id === rootId,
  );
  if (existingRoot) existingRoot.dispose();

  const root = am5.Root.new(rootId);
  root.setThemes([am5themes_Animated.new(root)]);
  if (hideLogo) root._logo?.dispose();

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 10,
      paddingBottom: 0,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout,
    }),
  );

  // 사용자 지정 팔레트 적용 (시리즈에 개별 색 지정 안 했을 때 fallback)
  if (colors && colors.length) {
    const palette = chart.get("colors");
    palette?.set(
      "colors",
      colors.map(c => am5.color(c as any)),
    );
  }

  chart.getNumberFormatter().set("numberFormat", numberFormat);
  // 반응형 폰트 사이즈 설정
  const DEFAULT_FONT_SIZE = 12; // 기본 (lg 초과)
  const SMALL_FONT_SIZE = 10; // lg 이하
  const LG_BREAKPOINT = 1024; // Tailwind 기본 lg (요구 사항: lg 이하일 때 10px)

  let currentFontSize = DEFAULT_FONT_SIZE;

  const computeFontSize = () => {
    if (typeof window === "undefined") return DEFAULT_FONT_SIZE;
    return window.innerWidth <= LG_BREAKPOINT
      ? SMALL_FONT_SIZE
      : DEFAULT_FONT_SIZE;
  };

  currentFontSize = computeFontSize();

  // legend
  let legend: am5.Legend | undefined;
  if (showLegend) {
    legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
      }),
    );
    // 텍스트 스타일
    legend.labels.template.setAll({
      fontSize: currentFontSize,
      fill: am5.color("#9DA2B0"),
      wrap: false,
      oversizedBehavior: "truncate",
    } as any);
    legend.valueLabels?.template?.setAll?.({
      fontSize: currentFontSize,
      fill: am5.color("#9DA2B0"),
    });
    legend.markerRectangles?.template.setAll({
      width: 12, // 원하는 너비
      height: 12, // 원하는 높이
      dy: 3.5,
    });
  }

  // 카테고리 축(X)
  const xRenderer = am5xy.AxisRendererX.new(root, {
    cellStartLocation: 0.1,
    cellEndLocation: 0.9,
    minorGridEnabled: true,
  });
  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField,
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {}),
    }),
  );
  xRenderer.grid.template.setAll({ location: 1, stroke: am5.color("#D2D3D4") });
  // x축 레이블 스타일
  xRenderer.labels.template.setAll({
    fontSize: currentFontSize,
    fill: am5.color("#9DA2B0"),
  });

  // 모든 카테고리 강제 표시 (간격 제한 완화)
  if (showAllCategories) {
    xRenderer.setAll({ minGridDistance: 1 });
  }

  // 레이블 회전 옵션
  if (typeof xLabelRotation === "number") {
    xRenderer.labels.template.setAll({
      rotation: xLabelRotation,
      centerY: am5.p50,
      dy: 4,
    });
  }
  xAxis.data.setAll(data);

  // 값 축(Y)
  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 }),
    }),
  );
  // 상하 여백 제거 목적: 기본 extraMin/extraMax(여유 공간) 0으로
  yAxis.setAll({ extraMin: 0, extraMax: 0 });
  const yRenderer = yAxis.get("renderer") as am5xy.AxisRendererY;
  yRenderer.labels.template.setAll({
    fontSize: currentFontSize,
    fontWeight: "500",
    paddingRight: 10,
    fill: am5.color("#9DA2B0"),
  });
  yRenderer.grid.template.setAll({ stroke: am5.color("#D2D3D4") });

  // 시리즈 자동 추론
  let autoSeries: ClusteredColumnSeriesConfig[] = [];
  if (!seriesOption || seriesOption.length === 0) {
    const first = data[0] || {};
    autoSeries = Object.keys(first)
      .filter(k => k !== categoryField && typeof first[k] === "number")
      .map(k => ({ valueField: k, name: k }));
  }
  const finalSeries =
    seriesOption && seriesOption.length > 0 ? seriesOption : autoSeries;

  // (이미 상단 선언)

  function makeSeries(cfg: ClusteredColumnSeriesConfig, index: number) {
    const { valueField, name = valueField, color, showValueLabel = true } = cfg;

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name,
        xAxis,
        yAxis,
        valueYField: valueField,
        categoryXField: categoryField,
      }),
    );

    series.columns.template.setAll({
      tooltipText,
      width: am5.percent(Math.max(1, Math.min(100, columnWidthPercent))),
      tooltipY: 0,
      strokeOpacity: 0,
      cornerRadiusTL: columnCornerRadius,
      cornerRadiusTR: columnCornerRadius,
    });

    if (color) {
      const resolved = typeof color === "string" ? am5.color(color) : color;
      series.setAll({ fill: resolved, stroke: resolved });
    } else if (colors && colors[index]) {
      const auto = am5.color(colors[index] as any);
      series.setAll({ fill: auto, stroke: auto });
    }

    series.data.setAll(data);
    series.appear();

    if (showValueLabel) {
      series.bullets.push(() =>
        am5.Bullet.new(root, {
          locationY: 0,
          sprite: am5.Label.new(root, {
            text: "{valueY}",
            fill: root.interfaceColors.get("alternativeText"),
            centerY: 0,
            centerX: am5.p50,
            populateText: true,
            fontSize: currentFontSize,
          }),
        }),
      );
    }

    legend?.data.push(series);
    return series;
  }

  finalSeries.forEach((cfg, idx) => makeSeries(cfg, idx));

  // 반응형 폰트 적용 함수
  const applyFontSizes = () => {
    // 이미 root/차트가 dispose 되었으면 아무 것도 하지 않음
    if ((root as any)._disposed) return;
    try {
      const newSize = computeFontSize();
      if (newSize === currentFontSize) return;
      currentFontSize = newSize;

      // 축 레이블 (템플릿이 dispose 되었는지 확인)
      if (!(xRenderer.labels.template as any)._disposed)
        xRenderer.labels.template.setAll({ fontSize: currentFontSize });
      if (!(yRenderer.labels.template as any)._disposed)
        yRenderer.labels.template.setAll({ fontSize: currentFontSize });

      // 범례
      if (legend && !(legend.labels.template as any)._disposed) {
        legend.labels.template.setAll({ fontSize: currentFontSize });
        legend.valueLabels?.template.setAll({ fontSize: currentFontSize });
      }

      // 시리즈 value bullets
      chart.series.each(series => {
        if ((series as any)._disposed) return;
        (series as any).bullets?.each?.((b: any) => {
          const sprite = b.get?.("sprite");
          if (sprite && !(sprite as any)._disposed) {
            sprite.setAll?.({ fontSize: currentFontSize });
          }
        });
      });
    } catch (e) {
      // 조용히 무시 (dispose race condition 방어)
      // console.debug('applyFontSizes skipped after dispose', e);
    }
  };

  // 범례 가시성 적용 함수
  const applyLegendVisibility = () => {
    if (!legend) return;
    if (hideLegendBelowWidth && hideLegendBelowWidth > 0) {
      const shouldHide =
        typeof window !== "undefined" &&
        window.innerWidth <= hideLegendBelowWidth;
      legend.set("visible", !shouldHide);
      legend.set("forceHidden", shouldHide);
    } else {
      legend.set("visible", true);
      legend.set("forceHidden", false);
    }
  };

  // 초기 한 번 (혹시 화면 크기에 따라 기본과 다를 수 있으므로)
  applyFontSizes();
  applyLegendVisibility();

  // 리사이즈 이벤트
  const resizeHandler = () => {
    applyFontSizes();
    applyLegendVisibility();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("resize", resizeHandler);
  }

  // dispose 시 리스너 제거 (am5 root disposers 사용)
  (root as any)._disposers.push({
    dispose: () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", resizeHandler);
      }
    },
  });

  // 축 제목(라벨) 색상 통일 (필요시 확장)
  xAxis.children.each(child => {
    if (child instanceof am5.Label)
      child.setAll({ fill: am5.color("#9DA2B0") });
  });
  yAxis.children.each(child => {
    if (child instanceof am5.Label)
      child.setAll({ fill: am5.color("#9DA2B0") });
  });

  chart.appear(1000, 100);
  return root;
}
