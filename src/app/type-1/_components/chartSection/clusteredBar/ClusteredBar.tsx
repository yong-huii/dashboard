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

  const dataset =
    chartData && chartData.length > 0
      ? chartData.slice(0, 15)
      : mockClusteredBarData;

  return <Chart data={dataset} createChart={clusteredBar} id="clustered-bar" />;
}

export const mockClusteredBarData = [
  { word: "AI Suite", frequency: 150 },
  { word: "Commerce", frequency: 128 },
  { word: "Analytics", frequency: 118 },
  { word: "IoT", frequency: 104 },
  { word: "Security", frequency: 92 },
  { word: "Marketing", frequency: 81 },
  { word: "Platform", frequency: 73 },
  { word: "DataLake", frequency: 69 },
  { word: "CRM", frequency: 64 },
  { word: "Billing", frequency: 58 },
  { word: "Support", frequency: 54 },
  { word: "QA", frequency: 48 },
  { word: "QA1", frequency: 48 },
  { word: "QA2", frequency: 48 },
  { word: "QA3", frequency: 48 },
];
