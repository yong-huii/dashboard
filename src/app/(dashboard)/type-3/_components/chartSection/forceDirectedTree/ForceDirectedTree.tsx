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

  const groupNames = groupFilter?.map(item => item.Word) ?? [];
  const groupList: (GroupNode & { linkWith: string[] })[] | undefined =
    groupFilter?.map(item => ({
      name: item.Word,
      value: item.Frequency,
      children: [],
      linkWith: groupNames.filter(n => n !== item.Word),
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

  // chartData를 root 없이 groupList 자체로 넘김

  const palette = [
    "#7FC3E2",
    "#7EA4E1",
    "#7D85E0",
    "#B17EE1",
    "#E07D81",
    "#E17E6A",
  ];

  const createChartWithPalette = (id: string, data: any) =>
    forceDirectedNetwork(id, data, {
      colors: palette,
    });

  const chartData = (groupList ?? []).map(node => ({
    ...node,
    children:
      node.children?.map(child => ({
        ...child,
        value: child.value * 0.1,
      })) ?? [],
  }));

  return (
    <Chart
      data={chartData}
      createChart={createChartWithPalette}
      id="force-directed-tree"
    />
  );
}
