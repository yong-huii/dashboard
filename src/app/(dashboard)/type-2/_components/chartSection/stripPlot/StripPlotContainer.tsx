import ChartTitle from "@/_shared/components/ChartTitle";

import StripPlot from "./StripPlot";

export default function StripPlotContainer() {
  return (
    <div className="flex h-full w-full flex-col items-center bg-white pt-[1%] pl-[1%]">
      <ChartTitle title="Realtime Analysis" />
      <StripPlot />
    </div>
  );
}
