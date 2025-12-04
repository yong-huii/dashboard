import ChartTitle from "@/_shared/components/ChartTitle";

import DurationOnValueAxis from "./DurationOnValueAxis";

export default function DurationOnValueAxisContainer() {
  return (
    <div className="flex h-full w-full flex-col items-center bg-white pt-[1%]">
      <ChartTitle title="Monthly Analysis" />
      <DurationOnValueAxis />
    </div>
  );
}
