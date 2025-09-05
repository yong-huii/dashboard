import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5wc from "@amcharts/amcharts5/wc";

export interface WordCloudDatum {
  tag: string;
  weight: number;
}

export interface WordCloudOptions {
  /** amCharts 로고 제거 (정식 라이선스 필요) */
  hideLogo?: boolean;
  /** 글자 최대 크기 퍼센트 값 (기본 15) */
  maxFontSizePercent?: number;
  /** 레이블 fontFamily (기본 'Courier New') */
  fontFamily?: string;
  /** 주기적 랜덤 weight 업데이트 사용 여부 (기본 true) */
  randomize?: boolean;
  /** 랜덤 업데이트 인터벌(ms) (기본 5000) */
  updateIntervalMs?: number;
  /** weight 랜덤 상한 (기본 65) */
  randomMax?: number;
  /** 차트 생성 후 바로 appear 애니메이션 (기본 true) */
  animateOnLoad?: boolean;
}

/** wordCloud 차트 함수형 생성자 (forceDirectedTree/stackBar 패턴) */
export function wordCloud(
  rootId: string,
  data: WordCloudDatum[] = [],
  options: WordCloudOptions = {},
) {
  const {
    hideLogo = true,
    maxFontSizePercent = 15,
    fontFamily = "Courier New",
    randomize = true,
    updateIntervalMs = 5000,
    randomMax = 65,
    animateOnLoad = true,
  } = options;

  // 이미 동일 id 로 존재하면 dispose (hot reload / 재마운트 대응)
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

  const series = root.container.children.push(
    am5wc.WordCloud.new(root, {
      categoryField: "tag",
      valueField: "weight",
      maxFontSize: am5.percent(maxFontSizePercent),
    }),
  );

  series.labels.template.setAll({ fontFamily, fill: am5.color("#555879") });
  // weight 값을 px 폰트 크기로 고정
  series.labels.template.adapters.add("fontSize", (fontSize, target) => {
    const dataItem = target.dataItem;
    if (dataItem && dataItem.dataContext) {
      const ctx = dataItem.dataContext as WordCloudDatum;
      if (typeof ctx.weight === "number") {
        return ctx.weight + 10 + "px";
      }
    }
    return fontSize;
  });
  series.data.setAll(data);

  let intervalId: any = null;
  if (randomize) {
    intervalId = setInterval(() => {
      am5.array.each(series.dataItems, dataItem => {
        let value = Math.random() * randomMax;
        value = value - Math.random() * value;
        dataItem.set("value", value);
        dataItem.set("valueWorking", value);
      });
    }, updateIntervalMs);
  }

  // root dispose 시 인터벌 정리 (타입 호환 위해 any 캐스팅)
  (root as any).events.on("wheel", () => {}); // (no-op) 타입 유지용
  const originalDispose = root.dispose.bind(root);
  root.dispose = () => {
    if (intervalId) clearInterval(intervalId);
    originalDispose();
  };

  if (animateOnLoad) {
    series.appear(1000);
  }

  return root;
}
