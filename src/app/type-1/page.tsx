"use client";

import { useIsPad } from "@/_shared/hooks/useIsDevice";

import ChartSection from "./_components/chartSection/ChartSection";
import TableSection from "./_components/tableSection/TableSection";

export default function Home() {
  const isPad = useIsPad();

  return (
    <div
      className={`bg-background grid h-full w-full grid-rows-8 gap-4 p-4 ${isPad ? "grid-cols-9" : "grid-cols-11"}`}
    >
      <TableSection />
      <ChartSection />
    </div>
  );
}
