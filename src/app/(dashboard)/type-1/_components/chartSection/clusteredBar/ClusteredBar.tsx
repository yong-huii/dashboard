"use client";

import useGetXlsxData from "@/_shared/api/services/type-1/useGetXlsxData";
import useDataCdStore from "@/_shared/store/type-1/dataCd";
import Chart from "@/_shared/utils/charts/Chart";
import { clusteredBar } from "@/_shared/utils/charts/clusteredBar/clusteredBar";

export default function ClusteredBar() {
  const { dataCd } = useDataCdStore();
  const { data } = useGetXlsxData(dataCd);

  const chartData = data?.map(item => ({
    word: item.Word,
    frequency: item.Frequency,
  }));

  return (
    <Chart
      data={chartData?.slice(0, 15)}
      createChart={clusteredBar}
      id="clustered-bar"
    />
  );
}
