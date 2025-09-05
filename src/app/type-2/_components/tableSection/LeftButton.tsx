import { CaretLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface Props {
  date: string;
  setDate: (date: string) => void;
}

export default function LeftButton({ date, setDate }: Props) {
  const leftButtonHandler = () => {
    const prevDate = dayjs(date).subtract(1, "day").format("YYYYMMDD");
    setDate(prevDate);
  };

  return (
    <button
      className="flex h-6 w-5 cursor-pointer items-center justify-center rounded-md border border-[#D9D9D9]"
      onClick={leftButtonHandler}
    >
      <CaretLeftOutlined className="text-[0.7rem] text-[#555879]" />
    </button>
  );
}
