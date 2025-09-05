"use client";

import useGetXlsxData from "@/_shared/api/services/type-1/useGetXlsxData";
import useDataCdStore from "@/_shared/store/type-1/dataCd";
import Chart from "@/_shared/utils/charts/Chart";
import { forceDirectedNetwork } from "@/_shared/utils/charts/forceDirectedTree/forceDirectedNetwork";

export default function ForceDirectedTree() {
  const { dataCd } = useDataCdStore();
  const { data } = useGetXlsxData(dataCd);

  const groupFilter = data?.filter(item => !item.Group);
  type GroupNode = {
    name: string;
    value: number;
    children: { name: string; value: number }[];
  };

  const groupList: GroupNode[] | undefined = groupFilter?.map(item => ({
    name: item.Word,
    value: item.Frequency,
    children: [],
  }));

  const childrenFilter = data?.filter(item => item.Group);

  childrenFilter?.forEach(child => {
    const parent = groupList?.find(group => group.name === child.Group);

    if (parent) {
      parent.children.push({
        name: child.Word,
        value: child.Frequency,
      });
    }
  });

  const chartData = {
    name: "",
    value: 0,
    children: groupList,
  };

  // 색상 팔레트 정의 (원하는 색상 순서대로)
  // const palette = ["#2563EB", "#7C3AED", "#DB2777", "#059669", "#F59E0B"]; // 필요시 prop/store로 분리 가능
  const palette = [
    "#7FC3E2", // 민트
    "#7EA4E1", // 블루
    "#7D85E0", // 퍼플
    "#B17EE1", // 핑크
    "#E07D81", // 레드
    "#E17E6A", // 오렌지
  ];

  // Chart 컴포넌트는 createChart 시그니처가 (id, data) 이므로 옵션 전달용 래퍼 생성
  const createChartWithPalette = (id: string, data: any) =>
    forceDirectedNetwork(id, data, {
      colors: palette,
    });

  return (
    <Chart
      data={chartData}
      createChart={createChartWithPalette}
      id="force-directed-tree"
    />
  );
}
