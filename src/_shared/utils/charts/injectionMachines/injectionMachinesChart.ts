import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";

export interface InjectionRow {
  일자: string; // YYYY-MM-DD
  총합?: number | string;
  [key: string]: any; // 사출기N호 등 동적 키
}

export interface InjectionMachinesChartOptions {
  dateKey?: string; // 기본 '일자'
  totalKey?: string; // 기본 '총합'
  machineKeyMatcher?: (key: string) => boolean; // 사출기 필드 판별
  hideLogo?: boolean;
  numberFormat?: string;
  dateFormat?: string; // 입력 포맷
  valueAxisLabel?: string; // Y축 라벨 텍스트
  /** 작은 화면에서 X축(일자) 라벨이 생략되지 않도록 모두 표시 시도 */
  showAllCategories?: boolean;
  /** X축 라벨 표시 포맷 (출력) 기본 'MM.dd' */
  displayDateLabelFormat?: string;
  /** 해당 폭 이하(px)에서는 범례 숨김 (기본 1024). 0 또는 음수 지정 시 항상 표시 */
  hideLegendBelowWidth?: number;
}

export interface InjectionMachinesChartResult {
  root: am5.Root;
  lineSeries: am5xy.LineSeries[]; // 사출기별 라인
  totalColumn?: am5xy.ColumnSeries; // 총합 막대
  updateData: (rows: InjectionRow[]) => void;
  dispose: () => void;
}

/**
 * 동적으로 변하는 사출기1호 ~ 사출기N호 키 집합을 라인 시리즈로 생성하고
 * 총합 키(있다면) 막대(ColumnSeries)로, 사출기 키는 라인(LineSeries)으로 표시.
 */
export function injectionMachinesChart(
  rootId: string,
  rows: InjectionRow[] = [],
  options: InjectionMachinesChartOptions = {},
): InjectionMachinesChartResult {
  const {
    dateKey = "일자",
    totalKey = "총합",
    machineKeyMatcher = k => /사출기\d+호/.test(k),
    hideLogo = true,
    numberFormat = "#,###.##",
    dateFormat = "yyyy-MM-dd",
    showAllCategories = false,
    displayDateLabelFormat = "MM.dd",
    hideLegendBelowWidth = 1024,
  } = options;

  // 기존 root 제거(HMR 대응)
  const existingRoot = (am5 as any).registry.rootElements.find(
    (r: am5.Root) => r.dom.id === rootId,
  );
  if (existingRoot) existingRoot.dispose();

  const root = am5.Root.new(rootId);
  root.setThemes([am5themes_Animated.new(root)]);
  if (hideLogo) root._logo?.dispose();

  // 데이터가 없으면 예시 한 줄 생성
  if (!rows.length) {
    rows = [
      {
        [dateKey]: "2025-01-01",
        [totalKey]: 0,
        사출기1호: 0,
      },
    ] as any;
  }

  // 머신 키 수집
  const machineKeys = Array.from(
    new Set(
      rows.flatMap(r =>
        Object.keys(r).filter(
          k => k !== dateKey && k !== totalKey && machineKeyMatcher(k),
        ),
      ),
    ),
  );

  // 숫자 변환 헬퍼
  function toNum(v: any): number | undefined {
    if (v == null || v === "") return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
  }

  // 공통 차트/축 설정
  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout,
    }),
  );
  chart.getNumberFormatter().set("numberFormat", numberFormat);
  // 반응형 폰트 설정 (lg: 1024px 기준)
  const LG_BREAKPOINT = 1024;
  const LARGE_FONT_SIZE = 12;
  const SMALL_FONT_SIZE = 10;
  const getResponsiveFontSize = () =>
    typeof window !== "undefined" && window.innerWidth <= LG_BREAKPOINT
      ? SMALL_FONT_SIZE
      : LARGE_FONT_SIZE;
  let currentFontSize = getResponsiveFontSize();
  const FONT_SIZE = currentFontSize; // 초기 적용값
  const LABEL_COLOR = am5.color("#9DA2B0");
  const GRID_COLOR = am5.color("#D2D3D4");

  // X축 DateAxis
  const xRenderer = am5xy.AxisRendererX.new(root, {
    minGridDistance: 60,
  });
  xRenderer.grid.template.setAll({ stroke: GRID_COLOR });
  xRenderer.labels.template.setAll({ fontSize: FONT_SIZE, fill: LABEL_COLOR });
  const xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      baseInterval: { timeUnit: "day", count: 1 },
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {}),
    }),
  );

  // X축 라벨 포맷 적용 (예: 08.05 형태)
  if (displayDateLabelFormat) {
    // 공통 DateFormatter 생성 후 축에 적용
    const df = am5.DateFormatter.new(root, {
      dateFormat: displayDateLabelFormat,
    });
    xAxis.set("dateFormatter", df);
    // 모든 기간 단위에 동일 형식 적용 (amCharts5는 dateFormats/periodChangeDateFormats 사용)
    xAxis.setAll({
      dateFormats: {
        millisecond: displayDateLabelFormat,
        second: displayDateLabelFormat,
        minute: displayDateLabelFormat,
        hour: displayDateLabelFormat,
        day: displayDateLabelFormat,
        week: displayDateLabelFormat,
        month: displayDateLabelFormat,
        year: displayDateLabelFormat,
      },
      periodChangeDateFormats: {
        millisecond: displayDateLabelFormat,
        second: displayDateLabelFormat,
        minute: displayDateLabelFormat,
        hour: displayDateLabelFormat,
        day: displayDateLabelFormat,
        week: displayDateLabelFormat,
        month: displayDateLabelFormat,
        year: displayDateLabelFormat,
      },
    });
    // 라벨 텍스트 강제 (기본 locale 포맷 덮어쓰기)
    xRenderer.labels.template.setAll({
      text: `{value.formatDate('${displayDateLabelFormat}')}`,
    });
    // 축 툴팁 텍스트도 동일 적용
    xAxis.get("tooltip")?.label.setAll({
      text: `{value.formatDate('${displayDateLabelFormat}')}`,
    });
  }

  // 모든 일자 레이블 강제 시도: 간격 최소화 및 그룹핑/스킵 비활성화
  if (showAllCategories) {
    xRenderer.setAll({ minGridDistance: 1 });
    xAxis.setAll({ groupData: false });
    // skipEmptyPeriods 기본 false 이지만 명시 (안전)
    (xAxis as any).setAll?.({ skipEmptyPeriods: false });
  }

  // Y축 ValueAxis
  const yRenderer = am5xy.AxisRendererY.new(root, {});
  yRenderer.grid.template.setAll({ stroke: GRID_COLOR, strokeOpacity: 0.4 });
  yRenderer.labels.template.setAll({ fontSize: FONT_SIZE, fill: LABEL_COLOR });
  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: yRenderer,
      tooltip: am5.Tooltip.new(root, {}),
    }),
  );

  // 색상 팔레트 다변화
  const palette = chart.get("colors");
  palette?.setAll({
    colors: [
      am5.color(0x7ea4e1),
      am5.color(0x7d85e0),
      am5.color(0xb17ee1),
      am5.color(0xe07d81),
    ],
    step: 1,
  });

  const lineSeries: am5xy.LineSeries[] = [];

  // 머신별 라인 시리즈 생성
  machineKeys.forEach(key => {
    const s = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: key,
        xAxis,
        yAxis,
        valueXField: dateKey,
        valueYField: key,
        tooltip: am5.Tooltip.new(root, { labelText: `${key}: {valueY}` }),
      }),
    );
    s.strokes.template.setAll({ strokeWidth: 2 });
    s.data.processor = am5.DataProcessor.new(root, {
      dateFields: [dateKey],
      dateFormat,
      numericFields: [key],
    });
    s.bullets.push(() =>
      am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 4,
          strokeWidth: 2,
          stroke: root.interfaceColors.get("background"),
          fill: s.get("stroke"),
        }),
      }),
    );
    lineSeries.push(s);
  });

  // 총합 막대(존재 시)
  let totalColumn: am5xy.ColumnSeries | undefined;
  if (rows.some(r => toNum(r[totalKey]) != null)) {
    totalColumn = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: totalKey,
        xAxis,
        yAxis,
        valueXField: dateKey,
        valueYField: totalKey,
        clustered: false,
        tooltip: am5.Tooltip.new(root, { labelText: `${totalKey}: {valueY}` }),
      }),
    );
    totalColumn.columns.template.setAll({
      fill: am5.color("#7EC2E1"),
      stroke: am5.color("#7EC2E1"),
      fillOpacity: 0.7,
      strokeOpacity: 1,
      strokeWidth: 1,
      cornerRadiusTL: 3,
      cornerRadiusTR: 3,
    });
    totalColumn.data.processor = am5.DataProcessor.new(root, {
      dateFields: [dateKey],
      dateFormat,
      numericFields: [totalKey],
    });
  }

  // 커서 & 범례
  chart.set("cursor", am5xy.XYCursor.new(root, { xAxis }));
  const legend = chart.children.push(
    am5.Legend.new(root, {
      useDefaultMarker: true,
      centerX: am5.p50, // 가로 중앙 기준점
      x: am5.p50, // 차트 컨테이너 가로 중앙 위치
    }),
  );
  legend.labels.template.setAll({
    fontSize: FONT_SIZE,
    fill: LABEL_COLOR,
    wrap: false,
    oversizedBehavior: "truncate",
  } as any);
  legend.valueLabels.template.setAll({
    fontSize: FONT_SIZE,
    fill: LABEL_COLOR,
  });

  // 마커 크기 축소
  legend.markers.template.setAll({ width: 12, height: 12 });
  (legend as any).markerRectangles?.template?.setAll?.({
    width: 12,
    height: 12,
  });
  legend.data.setAll([...lineSeries, ...(totalColumn ? [totalColumn] : [])]);

  // 폰트 사이즈 적용/업데이트 함수
  const applyFontSize = (size: number) => {
    if (currentFontSize === size) return;
    currentFontSize = size;
    xRenderer.labels.template.setAll({ fontSize: size });
    yRenderer.labels.template.setAll({ fontSize: size });
    legend.labels.template.setAll({ fontSize: size });
    legend.valueLabels.template.setAll({ fontSize: size });
  };
  const handleResize = () => {
    const next = getResponsiveFontSize();
    applyFontSize(next);
    applyLegendVisibility();
  };
  // 범례 가시성 토글 함수
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
  // 최초 1회 적용
  applyLegendVisibility();
  if (typeof window !== "undefined") {
    window.addEventListener("resize", handleResize);
  }
  // dispose 시 정리
  if (typeof (root as any)._disposers !== "undefined") {
    (root as any)._disposers.push({
      dispose: () => {
        if (typeof window !== "undefined") {
          window.removeEventListener("resize", handleResize);
        }
      },
    });
  }

  function setAllData(r: InjectionRow[]) {
    lineSeries.forEach(s => s.data.setAll(r as any));
    totalColumn?.data.setAll(r as any);
    xAxis.data.setAll(r as any);
  }

  setAllData(rows);

  lineSeries.forEach(s => s.appear(600));
  totalColumn?.appear(600);
  chart.appear(600, 100);

  function updateData(newRows: InjectionRow[]) {
    setAllData(newRows);
  }

  return {
    root,
    lineSeries,
    totalColumn,
    updateData,
    dispose: () => root.dispose(),
  };
}
