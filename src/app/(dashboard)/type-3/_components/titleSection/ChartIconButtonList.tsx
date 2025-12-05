"use client";

import { Button } from "antd";
import { TbBubbleText } from "react-icons/tb";

import useChartTypeStore from "@/_shared/store/type-3/chartType";

export default function ChartIconButtonList() {
  const { chartType, setChartType } = useChartTypeStore();

  const chartIconList = [
    {
      type: "WordCloud",
      icon: <TbBubbleText style={{ fontSize: "2rem", marginTop: "0.25rem" }} />,
    },
  ];

  return (
    <div className="flex gap-[0.5rem]">
      {chartIconList.map(chart => (
        <Button
          key={chart.type}
          icon={chart.icon}
          onClick={() => setChartType(chart.type)}
          style={{
            border: chartType === chart.type ? "2px solid #6794DC" : undefined,
          }}
        />
      ))}
    </div>
  );
}
