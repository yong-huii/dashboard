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

  return <Chart data={chartData} createChart={wordCloud2} id="word-cloud" />;
}
