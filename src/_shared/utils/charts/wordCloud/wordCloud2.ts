// amCharts4 WordCloud 함수형 생성자 (amCharts5 wordCloud 참고 커스텀)
// 긴 텍스트를 넣으면 단어 빈도 기반으로 크기 결정

import * as am4core from "@amcharts/amcharts4/core";
import * as am4plugins_wordCloud from "@amcharts/amcharts4/plugins/wordCloud";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

export interface WordCloud4Options {
  hideLogo?: boolean; // 로고 숨김 (기본 true)
  animatedTheme?: boolean; // animated 테마 적용 (기본 true)
  maxFontSizePercent?: number; // 최대 폰트 크기 퍼센트 (기본 30)
  angles?: number[]; // 회전 각도 (기본 [0, -90])
  fontWeight?: string; // 폰트 웨이트 (기본 '700')
  accuracy?: number; // series.accuracy (기본 4)
  step?: number; // series.step (기본 15)
  rotationThreshold?: number; // 회전 임계 (기본 0.7)
  maxCount?: number; // 최대 단어 수 (기본 200)
  minWordLength?: number; // 최소 단어 길이 (기본 2)
  margin?: number; // 라벨 margin (기본 4)
  randomize?: boolean; // 주기적 value 랜덤 업데이트 (기본 true)
  updateIntervalMs?: number; // 랜덤 인터벌 (기본 10000)
  randomValueMax?: number; // 랜덤 value 상한 (기본 10)
  labelAdapter?: (
    label: am4core.Label,
    dataItem: am4plugins_wordCloud.WordCloudSeriesDataItem,
  ) => void; // 라벨 커스터마이즈
  // weight -> 폰트 크기 매핑 관련 옵션
  useWeightAsFont?: boolean; // true면 weight 값으로 직접 px 크기 계산
  minFontPx?: number; // useWeightAsFont 사용 시 최소 px (기본 12)
  maxFontPx?: number; // useWeightAsFont 사용 시 최대 px (기본 64)
  scaleWeights?: boolean; // true면 전체 weight 범위를 min~max 로 선형 스케일 (기본 true)
  // 작은 화면 대응 옵션
  smallScreenBreakpoint?: number; // 이하 픽셀 폭일 때 안정화 로직 적용 (기본 640)
  disableRandomizeBelowBreakpoint?: boolean; // true면 작은 화면에서 randomize 비활성 (기본 true)
  singleAngleBelowBreakpoint?: boolean; // true면 작은 화면에서 angles를 [0] 으로 (기본 true)
  smallScreenFontScale?: number; // 작은 화면에서 폰트 크기 비율 (기본 0.8)
}

/**
 * amCharts4 WordCloud chart 생성자
 * chart.dispose() 호출 시 내부 인터벌도 정리됨
 * @param rootId 컨테이너 DOM id
 * @param text 워드클라우드 원본 텍스트
 */
// 배열 데이터 형태
export interface WordCloud4Datum {
  tag: string;
  weight: number;
}

export function wordCloud2(
  rootId: string,
  input: string | WordCloud4Datum[],
  options: WordCloud4Options = {},
) {
  const {
    hideLogo = true,
    animatedTheme = true,
    maxFontSizePercent = 30,
    angles = [0, -90],
    fontWeight = "700",
    accuracy = 4,
    step = 15,
    rotationThreshold = 0.7,
    maxCount = 200,
    minWordLength = 2,
    margin = 4,
    randomize = true,
    updateIntervalMs = 10000,
    randomValueMax = 10,
    labelAdapter,
    useWeightAsFont = false,
    minFontPx = 12,
    maxFontPx = 64,
    scaleWeights = true,
    smallScreenBreakpoint = 640,
    disableRandomizeBelowBreakpoint = true,
    singleAngleBelowBreakpoint = true,
    smallScreenFontScale = 0.8,
  } = options;

  // 기존 동일 id chart 제거 (hot reload 대응)
  const prev = am4core.registry.baseSprites.find(
    (s: any) => s.htmlContainer && s.htmlContainer.id === rootId,
  ) as am4core.Sprite | undefined;
  if (prev) prev.dispose();

  // 작은 화면 여부 판단 (SSR 보호)
  const isSmallScreen =
    typeof window !== "undefined" && window.innerWidth <= smallScreenBreakpoint;

  // 작은 화면에서는 애니메이션 테마 비활성화 권장 (레이블 튐 감소)
  if (animatedTheme && !isSmallScreen) am4core.useTheme(am4themes_animated);

  const chart = am4core.create(
    rootId,
    am4plugins_wordCloud.WordCloud,
  ) as am4plugins_wordCloud.WordCloud;
  const series = chart.series.push(new am4plugins_wordCloud.WordCloudSeries());

  series.accuracy = accuracy;
  series.step = step;
  series.rotationThreshold = rotationThreshold;
  series.maxCount = maxCount;
  series.minWordLength = minWordLength;
  series.labels.template.margin(margin, margin, margin, margin);
  // 기본 최대 폰트 퍼센트 설정 후 작은 화면이면 스케일 적용
  const effectiveMaxFontPercent = isSmallScreen
    ? maxFontSizePercent * smallScreenFontScale
    : maxFontSizePercent;
  series.maxFontSize = am4core.percent(effectiveMaxFontPercent);
  // 작은 화면이면 각도 단순화 -> 재배치 안정화
  series.angles = (
    isSmallScreen && singleAngleBelowBreakpoint ? [0] : angles
  ) as any;
  series.fontWeight = fontWeight as any;

  // 입력 타입 분기 (문자열 vs 배열)
  if (Array.isArray(input)) {
    // 데이터 배열 모드
    series.dataFields.word = "tag" as any; // TS 타입 보완
    series.dataFields.value = "weight" as any;
    // 원본 weight를 별도 필드로 저장해서 이후 애니메이션 후 복구에 사용
    series.data = input.map(d => ({
      ...d,
      originalValue: d.weight,
    })) as any;

    if (useWeightAsFont) {
      // weight 범위 계산 (스케일 옵션 있을 때)
      let minW = Infinity;
      let maxW = -Infinity;
      if (scaleWeights) {
        for (const d of input) {
          if (typeof d.weight === "number") {
            if (d.weight < minW) minW = d.weight;
            if (d.weight > maxW) maxW = d.weight;
          }
        }
        if (!isFinite(minW) || !isFinite(maxW)) {
          minW = 0;
          maxW = 1;
        }
        if (minW === maxW) {
          // 모든 weight 동일하면 분모 0 방지 위해 범위 확장
          maxW = minW + 1;
        }
      }

      series.labels.template.adapter.add("fontSize", (fontSize, target) => {
        const di = target.dataItem as
          | am4plugins_wordCloud.WordCloudSeriesDataItem
          | undefined;
        if (!di) return fontSize;
        const raw = (di.value as number) || 0;
        let mapped: number;
        if (scaleWeights) {
          mapped =
            minFontPx +
            ((raw - minW) / (maxW - minW)) * (maxFontPx - minFontPx);
        } else {
          mapped = raw; // raw 값을 그대로 사용
        }
        if (mapped < minFontPx) mapped = minFontPx;
        if (mapped > maxFontPx) mapped = maxFontPx;
        if (isSmallScreen) mapped = mapped * smallScreenFontScale;
        // 최소 가독성 보장: 8px 이하로 내려가지 않게 (필요 시 옵션화 가능)
        if (mapped < 8) mapped = 8;
        return mapped; // number 반환 (amCharts가 px 처리)
      });
    }
  } else {
    // text 모드 (안전 변환)
    const text = input;
    let safeText: string = "";
    if (typeof text === "string") safeText = text;
    else if (Array.isArray(text)) safeText = (text as any[]).join(" ");
    else if (text && typeof text === "object") safeText = JSON.stringify(text);
    else if (text != null) safeText = String(text);
    series.text = safeText;
  }

  series.colors = new am4core.ColorSet();
  (series.colors as any).passOptions = {}; // loop colors

  if (hideLogo && (chart as any).logo) {
    (chart as any).logo.disabled = true;
  }

  if (labelAdapter) {
    series.labels.template.events.on("inited", ev => {
      const label = ev.target as am4core.Label;
      const di = label.dataItem as am4plugins_wordCloud.WordCloudSeriesDataItem;
      if (di) labelAdapter(label, di);
    });
  }

  let intervalId: any = null;
  const enableRandomize =
    randomize && !(isSmallScreen && disableRandomizeBelowBreakpoint);
  // 퍼졌다가 다시 원래 배치로 수렴하도록, value를 잠시 변경 후 복구하는 애니메이션
  const revertDelay = Math.min(1500, updateIntervalMs / 2); // 인터벌보다 짧게 설정
  if (enableRandomize) {
    intervalId = setInterval(() => {
      if (!series.dataItems.length) return;
      const idx = Math.floor(Math.random() * series.dataItems.length);
      const di = series.dataItems.getIndex(idx);
      if (!di) return;

      const dc: any = di.dataContext || {};
      const original =
        typeof dc.originalValue === "number"
          ? dc.originalValue
          : (di.value as number);

      // 1) value를 랜덤으로 변경해 잠시 퍼지게 함
      const rand = Math.round(Math.random() * randomValueMax);
      di.setValue("value", rand);

      // 2) 짧은 시간 후 다시 원래 값으로 복구하여 기존 배치로 수렴
      setTimeout(() => {
        try {
          di.setValue("value", original);
        } catch (_) {
          // chart dispose 중일 수 있으므로 에러 무시
        }
      }, revertDelay);
    }, updateIntervalMs);
  }

  // 리사이즈 중 과도한 재배치 방지를 위한 디바운스 invalidateLabels (작은 화면에서만)
  if (isSmallScreen && typeof window !== "undefined") {
    let resizeTimer: any = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        try {
          series.invalidateRawData();
          series.validate();
        } catch (_) {}
      }, 150);
    };
    window.addEventListener("resize", onResize);
    const originalDispose2 = chart.dispose.bind(chart);
    chart.dispose = () => {
      window.removeEventListener("resize", onResize);
      originalDispose2();
    };
  }

  const originalDispose = chart.dispose.bind(chart);
  chart.dispose = () => {
    if (intervalId) clearInterval(intervalId);
    originalDispose();
  };

  return chart;
}

// 샘플 텍스트 export (테스트/데모용)
export const HAMLET_SAMPLE_TEXT =
  "Though yet of Hamlet our dear brother's death The memory be green, and that it us befitted To bear our hearts in grief and our whole kingdom To be contracted in one brow of woe, Yet so far hath discretion fought with nature That we with wisest sorrow think on him, Together with remembrance of ourselves. Therefore our sometime sister, now our queen, The imperial jointress to this warlike state, Have we, as 'twere with a defeated joy,-- With an auspicious and a dropping eye, With mirth in funeral and with dirge in marriage, In equal scale weighing delight and dole,-- Taken to wife: nor have we herein barr'd Your better wisdoms, which have freely gone With this affair along. For all, our thanks. Now follows, that you know, young Fortinbras, Holding a weak supposal of our worth, Or thinking by our late dear brother's death Our state to be disjoint and out of frame, Colleagued with the dream of his advantage, He hath not fail'd to pester us with message, Importing the surrender of those lands Lost by his father, with all bonds of law, To our most valiant brother. So much for him. Now for ourself and for this time of meeting: Thus much the business is: we have here writ To Norway, uncle of young Fortinbras,-- Who, impotent and bed-rid, scarcely hears Of this his nephew's purpose,--to suppress His further gait herein; in that the levies, The lists and full proportions, are all made Out of his subject: and we here dispatch You, good Cornelius, and you, Voltimand, For bearers of this greeting to old Norway; Giving to you no further personal power To business with the king, more than the scope Of these delated articles allow. Farewell, and let your haste commend your duty. Tis sweet and commendable in your nature, Hamlet,To give these mourning duties to your father: But, you must know, your father lost a father; That father lost, lost his, and the survivor bound In filial obligation for some term To do obsequious sorrow: but to persever In obstinate condolement is a course Of impious stubbornness; 'tis unmanly grief; It shows a will most incorrect to heaven, A heart unfortified, a mind impatient, An understanding simple and unschool'd: For what we know must be and is as common As any the most vulgar thing to sense, Why should we in our peevish opposition Take it to heart? Fie! 'tis a fault to heaven, A fault against the dead, a fault to nature, To reason most absurd: whose common theme Is death of fathers, and who still hath cried, From the first corse till he that died to-day, 'This must be so.' We pray you, throw to earth This unprevailing woe, and think of us As of a father: for let the world take note, You are the most immediate to our throne; And with no less nobility of love Than that which dearest father bears his son, Do I impart toward you. For your intent In going back to school in Wittenberg, It is most retrograde to our desire: And we beseech you, bend you to remain Here, in the cheer and comfort of our eye, Our chiefest courtier, cousin, and our son.";
