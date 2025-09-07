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

  const palette = [
    "#7FC3E2", // 민트
    "#7EA4E1", // 블루
    "#7D85E0", // 퍼플
    "#B17EE1", // 핑크
    "#E07D81", // 레드
    "#E17E6A", // 오렌지
  ];

  const createChartWithPalette = (id: string, data: any) =>
    forceDirectedNetwork(id, data, {
      colors: palette,
      // 간격 조정: 더 넓게 퍼지도록 반발력/링크거리/센터강도 조정
      repulsionStrength: -33, // (-) 절대값 클수록 퍼짐
      linkDistance: 1, // 기본보다 크게
      centerStrength: 0.6, // 낮추면 주변으로 더 퍼짐 (기본 0.5~1 가정)
    });

  const apiChartData = chartData;

  const dataset =
    groupList && groupList.length > 0 ? apiChartData : mockNetworkData;

  return (
    <Chart
      data={dataset}
      createChart={createChartWithPalette}
      id="force-directed-tree"
    />
  );
}

export const mockNetworkData = {
  name: "Product Ecosystem",
  children: [
    {
      name: "AI Suite",
      value: 150,
      linkWith: ["Analytics", "Security"],
      children: [
        { name: "모델트레이닝", value: 42, linkWith: ["데이터모델"] },
        { name: "데이터파이프라인", value: 38, linkWith: ["ETL"] },
        { name: "LLM서비스", value: 35, linkWith: ["위협인텔리전스"] },
        { name: "AutoML", value: 28 },
        { name: "피쳐스토어", value: 24, linkWith: ["세그먼트", "ETL"] },
      ],
    },
    {
      name: "Commerce",
      value: 130,
      linkWith: ["Marketing"],
      children: [
        { name: "주문", value: 40, linkWith: ["결제", "재고"] },
        { name: "상품", value: 33 },
        { name: "재고", value: 29, linkWith: ["실시간스트림"] },
        { name: "결제", value: 27, linkWith: ["IAM"] },
        { name: "프로모션", value: 21, linkWith: ["캠페인"] },
      ],
    },
    {
      name: "Analytics",
      value: 115,
      linkWith: ["Marketing"],
      children: [
        { name: "ETL", value: 36, linkWith: ["데이터파이프라인"] },
        { name: "데이터모델", value: 31, linkWith: ["모델트레이닝"] },
        { name: "리포트", value: 28, linkWith: ["대시보드"] },
        { name: "대시보드", value: 26 },
        { name: "알람", value: 20, linkWith: ["침입탐지"] },
      ],
    },
    {
      name: "IoT",
      value: 100,
      linkWith: ["Security"],
      children: [
        { name: "디바이스관리", value: 30, linkWith: ["IAM"] },
        { name: "테레메트리", value: 27, linkWith: ["실시간스트림"] },
        { name: "실시간스트림", value: 23, linkWith: ["재고", "알람"] },
        { name: "OTA업데이트", value: 18 },
        { name: "디바이스보안", value: 16, linkWith: ["침입탐지"] },
      ],
    },
    {
      name: "Security",
      value: 90,
      linkWith: ["AI Suite"],
      children: [
        { name: "IAM", value: 32, linkWith: ["결제", "디바이스관리"] },
        { name: "암호화", value: 26 },
        { name: "침입탐지", value: 22, linkWith: ["알람", "디바이스보안"] },
        { name: "감사로그", value: 20 },
        { name: "위협인텔리전스", value: 17, linkWith: ["LLM서비스"] },
      ],
    },
    {
      name: "Marketing",
      value: 80,
      linkWith: ["Commerce", "Analytics"],
      children: [
        { name: "캠페인", value: 25, linkWith: ["프로모션"] },
        { name: "세그먼트", value: 22, linkWith: ["피쳐스토어"] },
        { name: "A/B테스트", value: 19 },
        { name: "퍼널", value: 17 },
        { name: "LTV분석", value: 15 },
      ],
    },
  ],
};
