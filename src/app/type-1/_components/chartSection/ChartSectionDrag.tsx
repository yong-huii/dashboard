"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

import ClusteredBarContainer from "./clusteredBar/ClusteredBarContainer";
import ForceDirectedTreeContainer from "./forceDirectedTree/ForceDirectedTreeContainer";
import WordCloudContainer from "./wordCloud/WordCloudContainer";

export default function ChartSectionDrag() {
  const [activeChart, setActiveChart] = useState(["force", "cluster", "word"]);
  const [isOverMain, setIsOverMain] = useState(false);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  // 드래그 실패 시 원래 자리로 복귀 트리거
  const [resetKey, setResetKey] = useState([0, 0]);
  const mainRef = useRef<HTMLDivElement | null>(null);

  const chartList = [
    {
      type: "force",
      chart: <ForceDirectedTreeContainer />,
    },
    {
      type: "cluster",
      chart: <ClusteredBarContainer />,
    },
    {
      type: "word",
      chart: <WordCloudContainer />,
    },
  ];

  return (
    <div className="bg-background col-span-10 grid grid-cols-12 gap-4 select-none">
      {/* 메인 차트 영역 (드롭존) */}
      <div
        ref={mainRef}
        className="relative col-span-8 overflow-hidden rounded-lg bg-white shadow-md"
        onPointerUp={e => {
          if (draggingIdx !== null && draggingIdx > 0 && mainRef.current) {
            const rect = mainRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            // 드롭 위치가 영역 중앙부(가로/세로 모두 50% 이내)일 때만 swap
            if (
              e.clientX >= rect.left &&
              e.clientX <= rect.right &&
              e.clientY >= rect.top &&
              e.clientY <= rect.bottom &&
              Math.abs(e.clientX - centerX) < rect.width / 2 &&
              Math.abs(e.clientY - centerY) < rect.height / 2
            ) {
              const next = [...activeChart];
              [next[0], next[draggingIdx]] = [next[draggingIdx], next[0]];
              setActiveChart(next);
            }
          }
          setIsOverMain(false);
          setDraggingIdx(null);
        }}
        onPointerMove={e => {
          if (draggingIdx !== null && mainRef.current) {
            const rect = mainRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            // 중앙 50% 이내에 들어오면 오버
            const over =
              e.clientX >= rect.left &&
              e.clientX <= rect.right &&
              e.clientY >= rect.top &&
              e.clientY <= rect.bottom &&
              Math.abs(e.clientX - centerX) < rect.width / 2 &&
              Math.abs(e.clientY - centerY) < rect.height / 2;
            setIsOverMain(over);
          }
        }}
        style={{
          filter: isOverMain ? "blur(3px) brightness(0.95)" : undefined,
          transition: "filter 0.2s",
        }}
      >
        {chartList.find(chart => chart.type === activeChart[0])?.chart}
      </div>
      {/* 사이드 차트 (드래그 가능) */}
      <div className="bg-background col-span-4 grid grid-rows-2 gap-4">
        {[1, 2].map(i => {
          const type = activeChart[i];
          const chart = chartList.find(chart => chart.type === type)?.chart;
          return (
            <motion.div
              key={type + "-" + resetKey[i - 1]}
              className="relative overflow-hidden rounded-lg bg-white shadow-md"
              drag
              dragMomentum={false}
              dragElastic={0.12}
              animate={{ x: 0, y: 0 }}
              style={{
                cursor: draggingIdx === i ? "grabbing" : "grab",
                zIndex: draggingIdx === i ? 50 : 1,
              }}
              onDragStart={() => {
                setDraggingIdx(i);
                setIsOverMain(false);
              }}
              onDragEnd={(_, info) => {
                let swapped = false;
                if (
                  draggingIdx !== null &&
                  draggingIdx > 0 &&
                  mainRef.current
                ) {
                  const mainRect = mainRef.current.getBoundingClientRect();
                  const mainCenterX = mainRect.left + mainRect.width / 2;
                  const mainCenterY = mainRect.top + mainRect.height / 2;

                  // 드래그된 차트 DOM을 찾음
                  const chartDiv = document.querySelectorAll(
                    ".col-span-4 .relative.bg-white.shadow-md",
                  )[draggingIdx - 1] as HTMLElement | null;
                  if (chartDiv) {
                    const chartRect = chartDiv.getBoundingClientRect();
                    const chartCenterX = chartRect.left + chartRect.width / 2;
                    const chartCenterY = chartRect.top + chartRect.height / 2;
                    // 차트 중심이 메인 영역 중앙 50% 이내에 들어오면 swap
                    if (
                      chartCenterX >= mainRect.left &&
                      chartCenterX <= mainRect.right &&
                      chartCenterY >= mainRect.top &&
                      chartCenterY <= mainRect.bottom &&
                      Math.abs(chartCenterX - mainCenterX) <
                        mainRect.width / 2 &&
                      Math.abs(chartCenterY - mainCenterY) < mainRect.height / 2
                    ) {
                      const next = [...activeChart];
                      [next[0], next[draggingIdx]] = [
                        next[draggingIdx],
                        next[0],
                      ];
                      setActiveChart(next);
                      swapped = true;
                    }
                  }
                }
                // swap이 안 됐으면 원래 자리로 리셋 (key 변경)
                if (!swapped) {
                  setResetKey(prev => {
                    const next = [...prev];
                    next[i - 1]++;
                    return next;
                  });
                }
                setDraggingIdx(null);
                setIsOverMain(false);
              }}
              onPointerMove={e => {
                if (draggingIdx !== null) {
                  const rect = mainRef.current?.getBoundingClientRect();
                  if (rect) {
                    const over =
                      e.clientX >= rect.left &&
                      e.clientX <= rect.right &&
                      e.clientY >= rect.top &&
                      e.clientY <= rect.bottom;
                    setIsOverMain(over);
                  }
                }
              }}
            >
              {chart}
              {draggingIdx === i && (
                <div className="pointer-events-none absolute inset-0 z-20" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
