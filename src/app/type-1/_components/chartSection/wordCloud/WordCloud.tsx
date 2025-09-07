"use client";

import useGetXlsxData from "@/_shared/api/services/type-1/useGetXlsxData";
import useDataCdStore from "@/_shared/store/type-1/dataCd";
import Chart from "@/_shared/utils/charts/Chart";
import { wordCloud2 } from "@/_shared/utils/charts/wordCloud/wordCloud2";

export default function WordCloud() {
  const { dataCd } = useDataCdStore();
  const { data } = useGetXlsxData(dataCd);

  const chartData = data?.map(item => ({
    tag: item.Word,
    weight: item.Frequency,
  }));
  // API 데이터 없을 경우 fallback mock 사용
  const dataset =
    chartData && chartData.length > 0 ? chartData : mockWordCloudData;

  return <Chart data={dataset} createChart={wordCloud2} id="word-cloud" />;
}

// ================== WordCloud 개발용 Mock Data ==================
// tag: 단어, weight: 가중치(빈도) - UI/디자인 확인용.
// 실제 데이터 scale 확인 위해 다양한 구간(대형/중형/소형)으로 구성.
export const mockWordCloudData = [
  { tag: "AI", weight: 140 },
  { tag: "MachineLearning", weight: 120 },
  { tag: "데이터엔지니어링", weight: 110 },
  { tag: "분석플랫폼", weight: 105 },
  { tag: "LLM", weight: 98 },
  { tag: "VectorDB", weight: 92 },
  { tag: "파이프라인", weight: 88 },
  { tag: "피쳐스토어", weight: 84 },
  { tag: "AutoML", weight: 80 },
  { tag: "Prompt", weight: 76 },
  { tag: "HyperParameter", weight: 72 },
  { tag: "Streaming", weight: 68 },
  { tag: "Observability", weight: 65 },
  { tag: "MLOps", weight: 62 },
  { tag: "A/BTest", weight: 59 },
  { tag: "Monitoring", weight: 56 },
  { tag: "데이터카탈로그", weight: 54 },
  { tag: "세그먼트", weight: 52 },
  { tag: "전처리", weight: 49 },
  { tag: "EDA", weight: 47 },
  { tag: "시각화", weight: 45 },
  { tag: "Batch", weight: 43 },
  { tag: "Latency", weight: 41 },
  { tag: "Throughput", weight: 39 },
  { tag: "QoS", weight: 37 },
  { tag: "Security", weight: 36 },
  { tag: "IAM", weight: 34 },
  { tag: "암호화", weight: 33 },
  { tag: "침입탐지", weight: 31 },
  { tag: "캠페인", weight: 30 },
  { tag: "세션", weight: 28 },
  { tag: "전환", weight: 26 },
  { tag: "이탈률", weight: 24 },
  { tag: "Retention", weight: 22 },
  { tag: "LTV", weight: 20 },
  { tag: "Churn", weight: 18 },
  { tag: "Alert", weight: 17 },
  { tag: "PipelineFail", weight: 16 },
  { tag: "Cache", weight: 15 },
  { tag: "Scaling", weight: 14 },
  { tag: "CPU", weight: 13 },
  { tag: "메모리", weight: 12 },
  { tag: "GC", weight: 11 },
  { tag: "LatencyP99", weight: 10 },
  { tag: "Grafana", weight: 9 },
  { tag: "Prometheus", weight: 8 },
  { tag: "테스트", weight: 7 },
  { tag: "QA", weight: 6 },
  { tag: "로드", weight: 5 },
  { tag: "CLI", weight: 4 },
  { tag: "DevEx", weight: 3 },
  { tag: "SDK", weight: 2 },
  { tag: "Docs", weight: 1 },
];
