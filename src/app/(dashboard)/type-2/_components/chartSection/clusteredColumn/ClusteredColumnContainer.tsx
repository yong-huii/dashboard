import ChartTitle from "@/_shared/components/ChartTitle";

import ClusteredColumn from "./ClusteredColumn";

export default function ClusteredColumnContainer() {
  return (
    <div className="flex h-full w-full flex-col items-center gap-2 bg-white px-[0.5%] py-[1%]">
      <ChartTitle title="Daily Analysis" />
      <ClusteredColumn />
    </div>
  );
}
