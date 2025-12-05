"use client";

import { useIsPad } from "@/_shared/hooks/useIsDevice";

import ChartSection from "./_components/chartSection/ChartSection";
import TableSection from "./_components/tableSection/TableSection";
import TitleSection from "./_components/titleSection/TitleSection";

export default function Home() {
  const isPad = useIsPad();

  return (
    <div className="bg-background grid h-full w-full grid-cols-11 grid-rows-8 gap-6 p-6">
      <TableSection />
      <div
        className={`bg-background col-span-11 row-span-8 grid w-full grid-cols-12 grid-rows-28 gap-6 select-none ${isPad ? "lg:col-span-8" : "lg:col-span-9"}`}
      >
        <TitleSection />
        <ChartSection />
      </div>
    </div>
  );
}
