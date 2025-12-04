"use client";

import { useIsPad } from "@/_shared/hooks/useIsDevice";

import ProduceTable from "./ProduceTable";
import StatusTable from "./StatusTable";

export default function TableSection() {
  const isPad = useIsPad();
  return (
    <div
      className={`col-span-11 row-span-4 grid grid-rows-8 gap-4 lg:row-span-8 ${isPad ? "lg:col-span-3" : "lg:col-span-2"}`}
      style={{ fontSize: 12 }}
    >
      <StatusTable />
      <ProduceTable />
    </div>
  );
}
