import ChartTitle from "@/_shared/components/ChartTitle";

import ClusteredBar from "./ClusteredBar";

export default function ClusteredBarContainer() {
  return (
    <div className="flex h-full w-full flex-col items-center gap-[2%] p-[1%]">
      <ChartTitle title="Keyword" />
      <ClusteredBar />
    </div>
  );
}
