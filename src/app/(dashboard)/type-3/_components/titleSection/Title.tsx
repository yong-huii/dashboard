import useChartTypeStore from "@/_shared/store/type-3/chartType";

export default function Title() {
  const { chartType } = useChartTypeStore();

  return (
    <div className="flex items-center gap-[1.5rem]">
      <h1 className="pl-[0.5rem] text-[1.6rem] font-bold">{chartType}</h1>
    </div>
  );
}
