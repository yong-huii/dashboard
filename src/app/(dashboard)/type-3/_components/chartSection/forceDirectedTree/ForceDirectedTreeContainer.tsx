import ChartTitle from "@/_shared/components/ChartTitle";

import ForceDirectedTree from "./ForceDirectedTree";

export default function ForceDirectedTreeContainer() {
  return (
    <div className="flex h-full w-full flex-col items-center py-[1%]">
      <ChartTitle title="Word Embedding" />
      <ForceDirectedTree />
    </div>
  );
}
