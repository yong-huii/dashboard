"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import ClusteredBarContainer from "./clusteredBar/ClusteredBarContainer";
import ForceDirectedTreeContainer from "./forceDirectedTree/ForceDirectedTreeContainer";
import WordCloudContainer from "./wordCloud/WordCloudContainer";

export default function ChartSection() {
  const [activeChart, setActiveChart] = useState(["force", "cluster", "word"]);

  const chartList = useMemo(
    () => [
      {
        type: "force",
        chart: <ForceDirectedTreeContainer key="force" />,
      },
      {
        type: "cluster",
        chart: <ClusteredBarContainer key="cluster" />,
      },
      {
        type: "word",
        chart: <WordCloudContainer key="word" />,
      },
    ],
    [],
  );

  return (
    <div className="bg-background col-span-11 row-span-6 grid grid-cols-12 grid-rows-4 gap-4 select-none lg:col-span-9 lg:row-span-8">
      <div className="relative col-span-12 row-span-3 h-full overflow-hidden rounded-lg bg-white shadow-md lg:col-span-8 lg:row-span-4">
        {chartList.find(chart => chart.type === activeChart[0])?.chart}
      </div>
      <div className="bg-background col-span-12 row-span-1 grid grid-cols-2 gap-4 lg:col-span-4 lg:row-span-4 lg:grid-cols-1 lg:grid-rows-2">
        {[1, 2].map(i => {
          const type = activeChart[i];
          const chart = chartList.find(chart => chart.type === type)?.chart;
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
    </div>
  );
}
