interface Props {
  children?: React.ReactNode;
}

export default function ChartSubSection({ children }: Props) {
  return (
    <div className="mt-4 w-full lg:hidden">
      <div className="bg-background flex h-[150px] w-full gap-4">
        {children}
      </div>
    </div>
  );
}
