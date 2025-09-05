"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import useIsLgUp from "@/_shared/hooks/useIsLgUp";

import TableSection from "../tableSection/TableSection";
import ChartSubSection from "./ChartSubSection";
import ClusteredColumnContainer from "./clusteredColumn/ClusteredColumnContainer";
import DurationOnValueAxis from "./durationOnValueAxis/DurationOnValueAxis";
import StripPlotContainer from "./stripPlot/StripPlotContainer";

export default function ChartSection() {
  const [activeChart, setActiveChart] = useState([
    "stripPlot",
    "clusteredColumn",
    "durationOnValueAxis",
  ]);
  const isLgUp = useIsLgUp();

  // 브레이크포인트 전환 시 서브/모바일 영역 재그리기 위해 resize 이벤트 트리거
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => window.dispatchEvent(new Event("resize")), 60);
    return () => clearTimeout(t);
  }, [isLgUp]);

  const chartList = useMemo(
    () => [
      {
        type: "stripPlot",
        chart: <StripPlotContainer key="stripPlot" />,
      },
      {
        type: "clusteredColumn",
        chart: <ClusteredColumnContainer key="clusteredColumn" />,
      },
      {
        type: "durationOnValueAxis",
        chart: <DurationOnValueAxis key="durationOnValueAxis" />,
      },
    ],
    [],
  );

  return (
    <>
      <div className="grid h-full grid-cols-11 grid-rows-8 gap-4">
        <TableSection />
        <div className="bg-background col-span-11 row-span-4 grid grid-cols-12 grid-rows-4 gap-4 select-none lg:col-span-9 lg:row-span-8">
          {/* 메인영역 */}
          <div className="relative col-span-12 row-span-4 h-full overflow-hidden rounded-lg bg-white shadow-md lg:col-span-8 lg:row-span-4">
            {chartList.find(chart => chart.type === activeChart[0])?.chart}
          </div>
          {isLgUp && (
            <div className="bg-background col-span-12 hidden grid-cols-2 gap-4 lg:col-span-4 lg:row-span-4 lg:grid lg:grid-cols-1 lg:grid-rows-2">
              {[1, 2].map(i => {
                const type = activeChart[i];
                const chart = chartList.find(
                  chart => chart.type === type,
                )?.chart;
                return (
                  <motion.div
                    key={type}
                    className="relative h-full overflow-hidden rounded-lg bg-white shadow-md"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      const next = [...activeChart];
                      [next[0], next[i]] = [next[i], next[0]];
                      setActiveChart(next);
                    }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="pointer-events-none h-full">{chart}</div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {!isLgUp && (
        <ChartSubSection>
          {[1, 2].map(i => {
            const type = activeChart[i];
            const chart = chartList.find(chart => chart.type === type)?.chart;
            return (
              <motion.div
                key={type}
                className="relative h-full min-w-0 flex-1 overflow-hidden rounded-lg bg-white shadow-md"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const next = [...activeChart];
                  [next[0], next[i]] = [next[i], next[0]];
                  setActiveChart(next);
                }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="pointer-events-none h-full w-full">{chart}</div>
              </motion.div>
            );
          })}
        </ChartSubSection>
      )}
    </>
  );
}
