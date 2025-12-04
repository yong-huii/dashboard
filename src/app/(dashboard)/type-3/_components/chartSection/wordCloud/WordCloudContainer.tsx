import ChartTitle from "@/_shared/components/ChartTitle";

import WordCloud from "./WordCloud";

export default function WordCloudContainer() {
  return (
    <div className="flex h-full w-full flex-col items-center p-[1%]">
      <ChartTitle title="Word Cloud" />
      <WordCloud />
    </div>
  );
}
