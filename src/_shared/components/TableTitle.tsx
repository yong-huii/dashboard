interface Props {
  title: string;
  children?: React.ReactNode;
}

export default function TableTitle({ title, children }: Props) {
  return (
    <span
      className="hidden h-[45px] shrink-0 items-center justify-between overflow-hidden text-[16px] font-[600] text-ellipsis whitespace-nowrap lg:flex"
      title={title}
    >
      {title}
      {children}
    </span>
  );
}
