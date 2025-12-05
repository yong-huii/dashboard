"use client";

import { useMemo } from "react";

import useGetProduceList from "@/_shared/api/services/type-2/useGetProduceList";
import useDateStore from "@/_shared/store/type-2/date";
import Chart from "@/_shared/utils/charts/Chart";
import { clusteredColumn } from "@/_shared/utils/charts/clusteredColumn/clusteredColumn";

export default function ClusteredColumn() {
  const { date } = useDateStore();
  const { data } = useGetProduceList(date);

  /**
   * 요구사항: x축 = date, 범례 = name
   * 현재 API 구조 (예상): [{ name, date, total_count, error_cnt, ... }, ...]
   * -> 날짜별로 name 값을 열(column)로 pivot 해서
   *    [{ date: '2025-01-01', A: 10, B: 5 }, { date: '2025-01-02', A: 7, B: 9 }] 형태로 변환.
   * 각 name 이 하나의 시리즈가 되어 범례에 노출.
   */
  const { pivotData, seriesConfigs } = useMemo(() => {
    if (!data)
      return {
        pivotData: [] as any[],
        seriesConfigs: [] as { valueField: string; name: string }[],
      };

    // 1) "총합" 제거 & 숫자 변환
    const filtered = data
      .filter(item => item.name !== "총합")
      .map(item => ({
        name: item.name,
        date: item.date, // 그대로 카테고리 값
        total_count: Number(item.total_count) || 0,
        error_cnt: Number(item.error_cnt) || 0,
      }));

    // 2) 고유 name, 고유 date 수집
    const names = Array.from(new Set(filtered.map(d => d.name)));
    const dates = Array.from(new Set(filtered.map(d => d.date))).sort();

    // 3) pivot (date 기준 한 행에 각 name 값 매핑)
    const rows = dates.map(date => {
      const row: Record<string, any> = { date };
      names.forEach(n => {
        const found = filtered.find(f => f.date === date && f.name === n);
        row[n] = found ? found.total_count : 0; // 기본 0
      });
      return row;
    });

    // 4) 시리즈 설정 (valueField = name 그대로)
    const series = names.map(n => ({ valueField: n, name: n }));

    return { pivotData: rows, seriesConfigs: series };
  }, [data]);

  // createChart: categoryField = 'date', 시리즈는 name 기반
  const create = (id: string, d: typeof pivotData) =>
    clusteredColumn(id, d, {
      categoryField: "date",
      numberFormat: "#,###",
      tooltipText: "{name}: {valueY}",
      series: seriesConfigs,
      showAllCategories: true,
      columnWidthPercent: 55, // 막대 너비 축소 (원래 90)
      colors: ["#7EA4E1", "#7D85E0", "#B17EE1", "#E07D81"],
    });

  return <Chart createChart={create} id="clustered-column" data={pivotData} />;
}
