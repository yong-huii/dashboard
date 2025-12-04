interface Props {
  title: string;
}

export default function ChartTitle({ title }: Props) {
  return <span className="chart-title text-[16px] font-[600]">{title}</span>;
}
