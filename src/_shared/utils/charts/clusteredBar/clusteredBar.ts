import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";

/** 단일 행 객체 타입 (카테고리 + 여러 value 필드) */
export type ClusteredBarDatum = Record<string, string | number>;

export interface ClusteredBarSeriesConfig {
  /** 데이터 value 필드명 */
  valueField: string;
  /** 범례 및 툴팁 표기명 (미지정시 valueField 사용) */
  name?: string;
  /** 시리즈 색상 */
  color?: am5.Color;
  /** 막대 내부 value 라벨 표시 여부 (기본 true) */
  showValueLabel?: boolean;
  /** 막대 내부 시리즈명 라벨 표시 여부 (기본 false) */
  showNameLabel?: boolean;
}

export interface ClusteredBarOptions {
  /** amCharts 로고 제거 (정식 라이선스 필요) */
  hideLogo?: boolean;
  /** y축 카테고리 필드명 (기본 'year') */
  categoryField?: string;
  /** 차트 높이/레이아웃 상 추가 legend 표시 (기본 true) */
  showLegend?: boolean;
  /** 시리즈 설정 (없으면 데이터 첫 행의 숫자형 key 자동 추출) */
  series?: ClusteredBarSeriesConfig[];
  /** numberFormat (기본 '#.#s') */
  numberFormat?: string;
  /** xAxis 최소값 (기본 0) */
  minValue?: number;
  /** xAxis 최대값 (자동계산 없을 때는 데이터 최대값 + padding 사용) */
  maxValue?: number;
  /** 공통 툴팁 텍스트 (기본 "[bold]{name}[/]\n{categoryY}: {valueX}") */
  tooltipText?: string;
  /** 막대 오른쪽 끝 둥글기(px) 기본 4 */
  barCornerRadius?: number;
  /** 해당 폭(px) 이하일 때 범례 숨김 (기본 1024). 0 또는 음수로 두면 항상 표시 */
  hideLegendBelowWidth?: number;
}

/** forceDirectedTree / stackBar 패턴과 동일한 함수형 생성자 */
export function clusteredBar(
  rootId: string,
  data: ClusteredBarDatum[] = [],
  options: ClusteredBarOptions = {},
) {
  const {
    hideLogo = true,
    showLegend = true,
    series: seriesOption,
    numberFormat = "#.#s",
    minValue = 0,
    maxValue: maxValueOption,
    tooltipText = "[bold]{name}[/]\n{categoryY}: {valueX}",
    barCornerRadius = 4,
    hideLegendBelowWidth = 1024,
  } = options;

  // categoryField 결정: options에 지정되어 있으면 그대로, 없으면 데이터에 'word' 키가 있으면 'word',
  // 아니면 기존 기본인 'year'를 사용합니다.
  const categoryField =
    options.categoryField ??
    (data[0] && typeof data[0] === "object" && "word" in data[0]
      ? "word"
      : "year");

  // 디버깅용 로그는 finalMax 계산 후에 출력합니다 (참조 오류 방지)
  // x축 최대값 결정: 옵션에 maxValue가 주어지면 그 값을 사용, 아니면 데이터에서 숫자형 value 필드를 추출하여 최대값 + padding(20)
  let computedMax = minValue;
  try {
    const firstRow = data[0] || {};
    const candidateFields: string[] =
      seriesOption && seriesOption.length > 0
        ? seriesOption.map(s => s.valueField)
        : Object.keys(firstRow).filter(
            k =>
              k !== categoryField && typeof (firstRow as any)[k] === "number",
          );
    if (candidateFields.length > 0 && data.length > 0) {
      let maxVal = Number.NEGATIVE_INFINITY;
      for (const row of data) {
        for (const f of candidateFields) {
          const v = Number((row as any)[f]);
          if (!Number.isNaN(v) && v > maxVal) maxVal = v;
        }
      }
      if (maxVal !== Number.NEGATIVE_INFINITY) computedMax = maxVal;
    }
  } catch (e) {
    // ignore and fallback to minValue
  }
  const finalMax =
    typeof maxValueOption === "number" ? maxValueOption : computedMax + 5;

  // 동일 id 재생성 시 기존 root 제거 (hot reload 대응)
  const existingRoot = (am5 as any).registry.rootElements.find(
    (r: am5.Root) => r.dom.id === rootId,
  );
  if (existingRoot) existingRoot.dispose();

  const root = am5.Root.new(rootId);
  root.setThemes([am5themes_Animated.new(root)]);

  if (hideLogo) {
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

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout,
      paddingLeft: 0,
      paddingRight: 10,
      // 상하 여백 축소
      paddingTop: 0,
      paddingBottom: 0,
    }),
  );

  chart.getNumberFormatter().set("numberFormat", numberFormat);

  // 전역 텍스트 크기(픽셀) 기본/초기값 (리사이즈 핸들러로 동적 조정)
  let FONT_SIZE =
    typeof window !== "undefined" && window.innerWidth < 1024 ? 10 : 12;

  const yAxis = chart.yAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField,
      renderer: am5xy.AxisRendererY.new(root, {
        inversed: true,
        // 막대 위/아래 공간 축소 (기존 0.1/0.9)
        cellStartLocation: 0.05,
        cellEndLocation: 0.95,
        minorGridEnabled: true,
        minGridDistance: 8,
      }),
    }),
  );
  yAxis.data.setAll(data);
  // y축 레이블 크기/굵기 통일
  (yAxis.get("renderer") as am5xy.AxisRendererY)?.labels?.template?.setAll?.({
    fontSize: FONT_SIZE,
    fontWeight: "500",
    paddingRight: 10, // y축 레이블 오른쪽 마진 추가
    fill: am5.color("#9DA2B0"), // y축 글자 색상
  });
  // y축 눈금선 색상 변경
  (yAxis.get("renderer") as am5xy.AxisRendererY)?.grid?.template?.setAll?.({
    stroke: am5.color("#D2D3D4"),
  });

  const xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererX.new(root, {
        strokeOpacity: 0.1,
        minGridDistance: 50,
      }),
      min: minValue,
      max: finalMax,
    }),
  );
  // x축 레이블 크기 통일
  (xAxis.get("renderer") as am5xy.AxisRendererX)?.labels?.template?.setAll?.({
    fontSize: FONT_SIZE,
    fill: am5.color("#9DA2B0"), // x축 글자 색상
  });

  // x축, y축 축 제목(예: frequency) 색상 변경
  xAxis.children.each(child => {
    if (child instanceof am5.Label) {
      child.setAll({ fill: am5.color("#9DA2B0") });
    }
  });
  yAxis.children.each(child => {
    if (child instanceof am5.Label) {
      child.setAll({ fill: am5.color("#9DA2B0") });
    }
  });
  // x축 눈금선 색상 변경
  (xAxis.get("renderer") as am5xy.AxisRendererX)?.grid?.template?.setAll?.({
    stroke: am5.color("#D2D3D4"),
  });

  // 시리즈 자동 추론: 첫 데이터에서 categoryField 제외 숫자형 key
  let autoSeries: ClusteredBarSeriesConfig[] = [];
  if (!seriesOption || seriesOption.length === 0) {
    const first = data[0] || {};
    autoSeries = Object.keys(first)
      .filter(k => k !== categoryField && typeof first[k] === "number")
      .map(k => ({ valueField: k, name: k }));
  }
  const finalSeries =
    seriesOption && seriesOption.length > 0 ? seriesOption : autoSeries;

  function createSeries(cfg: ClusteredBarSeriesConfig) {
    const {
      valueField,
      name = valueField,
      color,
      showValueLabel = true,
      showNameLabel = false,
    } = cfg;
    const tt = am5.Tooltip.new(root, {
      pointerOrientation: "horizontal",
      labelText: tooltipText,
    });
    tt.label.setAll({ fontSize: FONT_SIZE });

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name,
        xAxis,
        yAxis,
        valueXField: valueField,
        categoryYField: categoryField,
        sequencedInterpolation: true,
        tooltip: tt,
      }),
    );

    series.columns.template.setAll({
      height: am5.p100,
      strokeOpacity: 0,
      // 수평 막대: 오른쪽 끝 두 모서리만 라운드 처리
      cornerRadiusTR: barCornerRadius,
      cornerRadiusBR: barCornerRadius,
    });

    // 사용자 시리즈 색상이 지정된 경우 그대로 사용
    if (color) {
      series.setAll({ fill: color, stroke: color });
    } else {
      // 팔레트 순환 (카테고리/데이터 인덱스 기반)
      const PALETTE = ["#7EC2E1"].map(c => am5.color(c));
      const len = PALETTE.length;

      // legend 마커(시리즈 대표 색)는 첫 팔레트 색(주황)으로 고정
      series.setAll({ fill: PALETTE[0], stroke: PALETTE[0] });

      // dataItems 인덱스 계산 함수
      function itemIndex(di: any) {
        // amCharts5에서 series.dataItems.list 배열 위치 사용
        return series.dataItems.indexOf(di);
      }

      series.columns.template.adapters.add("fill", (fill, target) => {
        const di: any = target.dataItem;
        if (!di) return fill;
        const idx = itemIndex(di);
        if (idx >= 0) return PALETTE[idx % len];
        return fill;
      });
      series.columns.template.adapters.add("stroke", (stroke, target) => {
        const di: any = target.dataItem;
        if (!di) return stroke;
        const idx = itemIndex(di);
        if (idx >= 0) return PALETTE[idx % len];
        return stroke;
      });
    }

    if (showValueLabel) {
      series.bullets.push(() =>
        am5.Bullet.new(root, {
          locationX: 1,
          locationY: 0.5,
          sprite: am5.Label.new(root, {
            centerY: am5.p50,
            text: "{valueX}",
            populateText: true,
            fontSize: FONT_SIZE,
            fill: am5.color("#9DA2B0"),
          }),
        }),
      );
    }
    if (showNameLabel) {
      series.bullets.push(() =>
        am5.Bullet.new(root, {
          locationX: 1,
          locationY: 0.5,
          sprite: am5.Label.new(root, {
            centerX: am5.p100,
            centerY: am5.p50,
            text: "{name}",
            fill: am5.color(0xffffff),
            populateText: true,
            fontSize: FONT_SIZE,
          }),
        }),
      );
    }

    series.data.setAll(data);
    series.appear();
    return series;
  }

  finalSeries.forEach(createSeries);

  let legend: am5.Legend | undefined;
  if (showLegend) {
    legend = chart.children.push(
      am5.Legend.new(root, { centerX: am5.p50, x: am5.p50 }),
    );
    // legend labels 크기 통일
    legend.labels.template.setAll({
      fontSize: FONT_SIZE,
      fill: am5.color("#9DA2B0"),
    });
    legend.valueLabels.template.setAll({
      fontSize: FONT_SIZE,
      fill: am5.color("#9DA2B0"),
    });
    legend.data.setAll(chart.series.values);
    // 마커 크기 축소
    legend.markers.template.setAll({ width: 12, height: 12 });
    (legend as any).markerRectangles?.template?.setAll?.({
      width: 12,
      height: 12,
      cornerRadiusTL: 3,
      cornerRadiusTR: 3,
      cornerRadiusBL: 3,
      cornerRadiusBR: 3,
    });
    // 범례 참조 저장 (기존 폰트 사이즈 조정 로직 사용 호환)
    (chart as any).__legendRef = legend;
  }

  const cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, { behavior: "zoomY" }),
  );
  cursor.lineY.set("forceHidden", true);
  cursor.lineX.set("forceHidden", true);

  chart.appear(1000, 100);
  // -------- 반응형 폰트 적용 로직 --------
  function computeFontSize() {
    if (typeof window === "undefined") return FONT_SIZE;
    return window.innerWidth < 1024 ? 10 : 12;
  }
  function applyFontSize(newSize: number) {
    // 축
    (yAxis.get("renderer") as am5xy.AxisRendererY)?.labels?.template?.setAll?.({
      fontSize: newSize,
    });
    (xAxis.get("renderer") as am5xy.AxisRendererX)?.labels?.template?.setAll?.({
      fontSize: newSize,
    });
    // 시리즈 bullets (Label) 갱신
    chart.series.each(series => {
      // tooltip 라벨
      (series.get("tooltip")?.label as any)?.setAll?.({ fontSize: newSize });
      // dataItem별 bullet 라벨 (막대 끝 숫자)
      (series as any).dataItems?.each?.((di: any) => {
        di?.bullets?.forEach((b: any) => {
          const spr = b?.get?.("sprite");
          // Label 또는 sprite 자체에 fontSize 적용
          spr?.setAll?.({ fontSize: newSize });
        });
      });
      // bulletsContainer children fallback
      (series as any).bulletsContainer?.children?.each?.((child: any) => {
        if (child?.setAll) child.setAll({ fontSize: newSize });
        const inner = child?.get?.("sprite");
        inner?.setAll?.({ fontSize: newSize });
      });
    });
    // legend
    const lg = (chart as any).__legendRef;
    lg?.labels?.template?.setAll?.({ fontSize: newSize });
    lg?.valueLabels?.template?.setAll?.({ fontSize: newSize });
  }
  // 범례 가시성 적용 함수
  function applyLegendVisibility() {
    const lg: am5.Legend | undefined = (chart as any).__legendRef;
    if (!lg) return; // 범례 미사용
    if (hideLegendBelowWidth && hideLegendBelowWidth > 0) {
      const shouldHide =
        typeof window !== "undefined" &&
        window.innerWidth <= hideLegendBelowWidth;
      lg.set("visible", !shouldHide);
      lg.set("forceHidden", shouldHide);
    } else {
      lg.set("visible", true);
      lg.set("forceHidden", false);
    }
  }
  if (typeof window !== "undefined") {
    let raf = 0;
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const ns = computeFontSize();
        if (ns !== FONT_SIZE) {
          FONT_SIZE = ns;
          applyFontSize(ns);
        }
        applyLegendVisibility();
      });
    };
    window.addEventListener("resize", onResize);
    // root dispose 시 정리 (amCharts5 root는 dispose 이벤트 미공식 -> 간단히 interval 감지 or Disposer 사용)
    // 간단: root._disposers 배열 활용
    (root as any)._disposers?.push?.({
      dispose: () => window.removeEventListener("resize", onResize),
    });
    // 초기 강제 적용 (혹시 일부 bullet 생성 후 fontSize 반영 누락 대비)
    requestAnimationFrame(() => {
      applyFontSize(FONT_SIZE);
      applyLegendVisibility();
    });
  }
  // --------------------------------------
  return root;
}
