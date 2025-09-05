"use client";

import ProduceTable from "./ProduceTable";
import StatusTable from "./StatusTable";

export default function TableSection() {
  return (
    <div
      className="col-span-10 row-span-4 grid grid-rows-2 gap-4 lg:col-span-2 lg:row-span-8"
      style={{ fontSize: 12 }}
    >
      <StatusTable />
      <ProduceTable />
    </div>
  );
}
