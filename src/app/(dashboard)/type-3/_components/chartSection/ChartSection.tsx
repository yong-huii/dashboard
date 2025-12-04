"use client";

import { useIsPad } from "@/_shared/hooks/useIsDevice";

import WordCloudContainer from "./wordCloud/WordCloudContainer";

export default function ChartSection() {
  const isPad = useIsPad();

  return (
    <div
      className={`bg-background col-span-11 row-span-6 grid grid-cols-12 grid-rows-8 gap-4 select-none lg:row-span-8 ${isPad ? "lg:col-span-8" : "lg:col-span-9"}`}
    >
      <div className="relative col-span-12 row-span-8 h-full overflow-hidden rounded-lg bg-white shadow-md">
        <WordCloudContainer />
      </div>
    </div>
  );
}
