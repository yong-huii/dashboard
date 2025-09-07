import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";

/** StripPlot 개별 데이터 포인트 타입 */
export interface StripPlotPoint {
  /** 카테고리 (Y축) */
  category: string;
  /** X축 위치 값 (예: 점수 0~100) */
  position: number;
  /** 버블 크기를 결정할 값 (heatRules radius) */
  value: number;
  /** 개별 점 색상 지정 */
  color?: am5.Color;
}

export interface StripPlotCategoryMeta {
  category: string;
  icon?: string;
  color?: am5.Color; // 기본 색상 팔레트로 사용
}

export interface StripPlotOptions {
  /** 카테고리 메타 (아이콘/기본색) */
  categories?: StripPlotCategoryMeta[];
  /** X축 최소 */
  min?: number;
  /** X축 최대 */
  max?: number;
  /** 고정 min/max 강제 (기본 true) */
  strictMinMax?: boolean;
  /** 루트에 amCharts 로고 제거 (상업 라이선스 외 개발/테스트 목적) */
  hideLogo?: boolean;
  /** 점 radius 가중치 값 필드 (기본 value) */
  radiusField?: string;
  /** radius 최소 */
  minRadius?: number;
  /** radius 최대 */
  maxRadius?: number;
  /** 전체 number format */
  numberFormat?: string;
  /** 툴팁 텍스트 */
  tooltipText?: string;
  /** 스크롤바 표시 여부 */
  showScrollbars?: boolean;
  /**
   * 외부에서 X축을 직접 생성/커스터마이즈 하고 싶을 때 사용.
   * 함수가 제공되면 기본 ValueAxis 대신 이 팩토리에서 반환한 축을 사용.
   * (root, chart) => valueAxis
   */
  createXAxis?: (root: am5.Root, chart: am5xy.XYChart) => am5xy.ValueAxis<any>;
  /**
   * 특정 X 값(숫자) -> 라벨(문자열) 매핑. 예: { 8: '2025-09-01', 17: '2025-09-02' }
   * ValueAxis 의 기본 자동 라벨 대신 지정된 값에 한해 라벨 텍스트를 교체.
   */
  xLabelMap?: Record<number, string>;
  /** 커스텀 Range 라벨 회전 각 (deg). 예: -45 */
  xLabelRotation?: number;
}

export interface StripPlotResult {
  root: am5.Root;
  chart: am5xy.XYChart;
  xAxis: am5xy.ValueAxis<any>;
  yAxis: am5xy.CategoryAxis<any>;
  series: am5xy.LineSeries;
  /** 데이터 교체/추가 유틸 */
  updateData: (
    newData: StripPlotPoint[],
    options?: { replaceCategories?: boolean },
  ) => void;
  /** X축 라벨 매핑 갱신 */
  updateXLabels: (map: Record<number, string>) => void;
  dispose: () => void;
}

export function stripPlot(
  rootId: string,
  data: StripPlotPoint[] = [],
  options: StripPlotOptions = {},
): StripPlotResult {
  const {
    categories: categoriesOption,
    min = 0,
    max = 100,
    strictMinMax = true,
    hideLogo = true,
    radiusField = "value",
    minRadius = 5,
    maxRadius = 20,
    numberFormat = "#.#s",
    tooltipText = "{valueX}: [bold]{value}[/]",
    showScrollbars = true,
    createXAxis,
    xLabelMap = {},
    xLabelRotation,
  } = options;

  // 기존 root 제거 (hot reload 대응)
  const existingRoot = (am5 as any).registry.rootElements.find(
    (r: am5.Root) => r.dom.id === rootId,
  );
  if (existingRoot) existingRoot.dispose();

  const root = am5.Root.new(rootId);
  root.setThemes([am5themes_Animated.new(root)]);

  if (hideLogo) root._logo?.dispose();

  // 카테고리 메타 추론: 옵션 우선, 없으면 데이터에서 category 추출 후 단일 색상
  let categories: StripPlotCategoryMeta[] = [];
  if (categoriesOption && categoriesOption.length) {
    categories = categoriesOption;
  } else {
    const uniq = Array.from(new Set(data.map(d => d.category)));
    categories = uniq.map(c => ({ category: c }));
  }

  // 카테고리 색상 팔레트 (필요시 확장)
  const PALETTE = [
    "#6771DC",
    "#00aade",
    "#f04571",
    "#03c03e",
    "#ff9f43",
    "#7342f5",
  ].map(c => am5.color(c));

  // 색상 보강
  categories = categories.map((c, idx) => ({
    ...c,
    color: c.color || PALETTE[idx % PALETTE.length],
  }));

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout,
      paddingLeft: 0,
    }),
  );
  chart.getNumberFormatter().set("numberFormat", numberFormat);

  // 반응형 폰트: 1024px 미만(lg 이하)일 때 10px, 그 외 12px
  let FONT_SIZE =
    typeof window !== "undefined" && window.innerWidth < 1024 ? 10 : 12;

  // Y Axis (Category)
  const yAxis = chart.yAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "category",
      renderer: am5xy.AxisRendererY.new(root, {
        cellStartLocation: 0.1,
        cellEndLocation: 0.9,
        inversed: true,
        minGridDistance: 20, // 행 간 최소 간격 확보로 라벨 스킵 완화
      }),
      bullet: (root, _axis, dataItem) => {
        const ctx: any = dataItem.dataContext;
        if (!ctx) return undefined as any;
        if (ctx.icon) {
          // TS 타입 정의에 locationY 미존재 -> any 캐스팅으로 적용
          return am5xy.AxisBullet.new(root, {
            location: 0.5, // locationY 대신 location 사용 (동일 효과)
            sprite: am5.Picture.new(root, {
              dx: -10,
              width: 24,
              height: 24,
              centerY: am5.p50,
              centerX: am5.p100,
              src: ctx.icon,
            }),
          } as any);
        }
        return undefined as any;
      },
    }),
  );

  const yRenderer = yAxis.get("renderer") as am5xy.AxisRendererY;
  yRenderer.labels.template.setAll({
    fontSize: FONT_SIZE,
    paddingRight: 40,
    fill: am5.color("#9DA2B0"),
  });
  yRenderer.grid.template.setAll({
    location: 0.5,
    stroke: am5.color("#D2D3D4"),
  });
  yAxis.data.setAll(categories);

  // X Axis (Value)
  // X Axis (Value) - 커스텀 팩토리 우선
  const xAxis = chart.xAxes.push(
    createXAxis
      ? createXAxis(root, chart)
      : am5xy.ValueAxis.new(root, {
          min,
          max,
          strictMinMax,
          renderer: am5xy.AxisRendererX.new(root, {}),
        }),
  );
  const xRenderer = xAxis.get("renderer") as am5xy.AxisRendererX;
  xRenderer.labels.template.setAll({ forceHidden: true }); // 기본 눈금 라벨 숨김
  xRenderer.grid.template.setAll({ forceHidden: true }); // 기본 그리드 숨김

  // AxisRange 라벨 컬렉션
  // am5xy에 명시 AxisRange 타입 export가 없어 런타임 객체를 any로 추적
  let xRanges: any[] = [];
  let currentXLabelMap = xLabelMap; // 최신 매핑 참조

  function clearXRanges() {
    xRanges.forEach(r => r.dispose());
    xRanges = [];
  }

  function buildXRanges(map: Record<number, string>) {
    clearXRanges();
    const entries = Object.entries(map)
      .map(([k, v]) => [Number(k), v] as [number, string])
      .sort((a, b) => a[0] - b[0]);
    entries.forEach(([value, label]) => {
      if (isNaN(value)) return;
      const dataItem = xAxis.makeDataItem({ value });
      const range = xAxis.createAxisRange(dataItem);
      // 라벨 스타일
      range.get("label")?.setAll({
        text: label,
        forceHidden: false,
        centerX: am5.p50,
        centerY: am5.p0,
        dy: xLabelRotation ? 10 : 4,
        rotation: typeof xLabelRotation === "number" ? xLabelRotation : 0,
        fill: am5.color("#9DA2B0"), // Y축 라벨 색상과 통일
        fontSize: FONT_SIZE,
      });
      // grid (선) 노출 원하면 strokeOpacity 조정
      range
        .get("grid")
        ?.setAll({ strokeOpacity: 0.1, stroke: am5.color(0xcccccc) });
      xRanges.push(range);
    });
    xAxis.markDirty();
  }

  if (Object.keys(currentXLabelMap).length) {
    buildXRanges(currentXLabelMap);
  }

  // 시리즈 (LineSeries + bullets)
  const series = chart.series.push(
    am5xy.LineSeries.new(root, {
      xAxis,
      yAxis,
      baseAxis: yAxis,
      valueXField: "position",
      valueField: radiusField,
      categoryYField: "category",
      calculateAggregates: true,
    }),
  );
  series.strokes.template.setAll({ strokeOpacity: 0 });

  // 데이터 변환: category 메타 색상 주입
  const prepared = data.map(d => {
    const meta = categories.find(c => c.category === d.category);
    return {
      ...d,
      bulletSettings: {
        fill: d.color || meta?.color || PALETTE[0],
      },
    } as any;
  });
  series.data.setAll(prepared);

  const circleTemplate = am5.Template.new<am5.Circle>({});
  series.bullets.push(() =>
    am5.Bullet.new(root, {
      locationY: 0.5,
      sprite: am5.Circle.new(
        root,
        {
          tooltipText: tooltipText,
          radius: minRadius,
          stroke: am5.color(0xffffff),
          strokeWidth: 1,
          fillOpacity: 0.85,
          templateField: "bulletSettings",
        },
        circleTemplate,
      ),
    }),
  );

  series.set("heatRules", [
    {
      target: circleTemplate,
      min: minRadius,
      max: maxRadius,
      dataField: radiusField,
      key: "radius",
    },
  ]);

  if (showScrollbars) {
    chart.set(
      "scrollbarX",
      am5.Scrollbar.new(root, { orientation: "horizontal" }),
    );
    chart.set(
      "scrollbarY",
      am5.Scrollbar.new(root, { orientation: "vertical" }),
    );
  }

  series.appear();
  chart.appear(800, 100);

  function updateData(
    newData: StripPlotPoint[],
    opt: { replaceCategories?: boolean } = {},
  ) {
    const { replaceCategories = false } = opt;
    if (replaceCategories) {
      const uniq = Array.from(new Set(newData.map(d => d.category)));
      categories = uniq.map(c => {
        const prev = categories.find(p => p.category === c);
        return prev || { category: c };
      });
      yAxis.data.setAll(categories);
    }
    const prepared = newData.map(d => {
      const meta = categories.find(c => c.category === d.category);
      return {
        ...d,
        bulletSettings: {
          fill: d.color || meta?.color || am5.color(0x6771dc),
        },
      } as any;
    });
    series.data.setAll(prepared);
  }

  function updateXLabels(map: Record<number, string>) {
    currentXLabelMap = map;
    if (Object.keys(map).length) buildXRanges(map);
    else clearXRanges();
  }

  // -------- 반응형 폰트 리사이즈 로직 --------
  function computeFontSize() {
    if (typeof window === "undefined") return FONT_SIZE;
    return window.innerWidth < 1024 ? 10 : 12;
  }
  function applyFontSize(newSize: number) {
    // root 또는 템플릿이 이미 dispose 되었으면 중단
    const labelTemplate: any = yRenderer.labels.template as any;
    if ((root as any).isDisposed?.() || labelTemplate?.isDisposed?.()) return;
    try {
      labelTemplate.setAll({ fontSize: newSize });
    } catch (_) {
      return; // 이미 dispose 진행 중
    }
    // X축 Range 라벨 재구성 (폰트 사이즈 반영)
    if (Object.keys(currentXLabelMap).length) buildXRanges(currentXLabelMap);
  }
  if (typeof window !== "undefined") {
    let raf = 0;
    let disposed = false;
    const onResize = () => {
      if (disposed || (root as any).isDisposed?.()) return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (disposed || (root as any).isDisposed?.()) return;
        const ns = computeFontSize();
        if (ns !== FONT_SIZE) {
          FONT_SIZE = ns;
          applyFontSize(ns);
        }
      });
    };
    window.addEventListener("resize", onResize);
    // root dispose 시 리스너/상태 정리
    (root as any)._disposers?.push?.({
      dispose: () => {
        disposed = true;
        window.removeEventListener("resize", onResize);
        if (raf) cancelAnimationFrame(raf);
      },
    });
  }
  // ------------------------------------------

  return {
    root,
    chart,
    xAxis,
    yAxis,
    series,
    updateData,
    updateXLabels,
    dispose: () => root.dispose(),
  };
}
