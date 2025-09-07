"use client";

import { useMemo } from "react";

import useGetLastMonthDataList from "@/_shared/api/services/type-2/useGetLastMonthDataList";
import Chart from "@/_shared/utils/charts/Chart";
import { injectionMachinesChart } from "@/_shared/utils/charts/injectionMachines/injectionMachinesChart";

export default function DurationOnValueAxis() {
  const { data } = useGetLastMonthDataList();

  // ================== Mock Data (최근 7일 예시) ==================
  const mockRows = useMemo(
    () => [
      {
        일자: "2025-09-01",
        총합: 64844,
        사출기1호: 18234,
        사출기2호: 16521,
        사출기3호: 14289,
        사출기4호: 15800,
      },
      {
        일자: "2025-09-02",
        총합: 62647,
        사출기1호: 17654,
        사출기2호: 16011,
        사출기3호: 13970,
        사출기4호: 15012,
      },
      {
        일자: "2025-09-03",
        총합: 66280,
        사출기1호: 18801,
        사출기2호: 17002,
        사출기3호: 14555,
        사출기4호: 15922,
      },
      {
        일자: "2025-09-04",
        총합: 65510,
        사출기1호: 18510,
        사출기2호: 16890,
        사출기3호: 14400,
        사출기4호: 15710,
      },
      {
        일자: "2025-09-05",
        총합: 67005,
        사출기1호: 19002,
        사출기2호: 17110,
        사출기3호: 14680,
        사출기4호: 16213,
      },
      {
        일자: "2025-09-06",
        총합: 66120,
        사출기1호: 18640,
        사출기2호: 16950,
        사출기3호: 14490,
        사출기4호: 16040,
      },
      {
        일자: "2025-09-07",
        총합: 67532,
        사출기1호: 19210,
        사출기2호: 17230,
        사출기3호: 14785,
        사출기4호: 16307,
      },
    ],
    [],
  );

  const rows = data && data.length > 0 ? data : (mockRows as any[]);

  const create = (id: string, data: any[]) =>
    injectionMachinesChart(id, data, {
      dateKey: "일자",
      totalKey: "총합",
      valueAxisLabel: "생산량",
      showAllCategories: true,
    });
  return <Chart createChart={create} id="duration-on-value-axis" data={rows} />;
}
