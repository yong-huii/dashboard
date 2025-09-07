"use client";

import ChartSection from "./_components/chartSection/ChartSection";
import TableSection from "./_components/tableSection/TableSection";

export default function Home() {
  return (
    <div className="bg-background grid h-full w-full grid-cols-11 grid-rows-8 gap-4 p-4">
      <TableSection />
      <ChartSection />
    </div>
  );
}
