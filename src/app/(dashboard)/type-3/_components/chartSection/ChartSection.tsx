"use client";

import { useEffect, useRef } from "react";

import useTargetRefStore from "@/_shared/store/type-3/targetRef";

import WordCloudContainer from "./wordCloud/WordCloudContainer";

export default function ChartSection() {
  const chartSectionRef = useRef<HTMLDivElement>(null);

  const { setTargetRef } = useTargetRefStore();

  useEffect(() => {
    if (chartSectionRef.current) {
      setTargetRef(chartSectionRef);
    }
  }, [setTargetRef, chartSectionRef]);

  return (
    <div
      className="relative col-span-12 row-span-25 h-full overflow-hidden rounded-lg bg-white shadow-md lg:row-span-26"
      ref={chartSectionRef}
    >
      <WordCloudContainer />
    </div>
  );
}
