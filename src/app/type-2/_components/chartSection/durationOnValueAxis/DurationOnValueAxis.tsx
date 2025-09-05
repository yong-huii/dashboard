"use client";

import useGetLastMonthDataList from "@/_shared/api/services/type-2/useGetLastMonthDataList";
import Chart from "@/_shared/utils/charts/Chart";
import { injectionMachinesChart } from "@/_shared/utils/charts/injectionMachines/injectionMachinesChart";

export default function DurationOnValueAxis() {
  const { data } = useGetLastMonthDataList();

  const create = (id: string, data: any[]) =>
    injectionMachinesChart(id, data, {
      dateKey: "일자",
      totalKey: "총합",
      valueAxisLabel: "생산량",
      showAllCategories: true,
    });
  return <Chart createChart={create} id="duration-on-value-axis" data={data} />;
}
