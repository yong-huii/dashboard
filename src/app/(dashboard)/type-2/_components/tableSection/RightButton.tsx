import { CaretRightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface Props {
  date: string;
  setDate: (date: string) => void;
}

export default function RightButton({ date, setDate }: Props) {
  const rightButtonHandler = () => {
    const nextDate = dayjs(date).add(1, "day").format("YYYYMMDD");
    setDate(nextDate);
  };
  return (
    <button
      className="flex h-6 w-5 cursor-pointer items-center justify-center rounded-md border border-[#D9D9D9]"
      onClick={rightButtonHandler}
    >
      <CaretRightOutlined className="text-[0.7rem] text-[#555879]" />
    </button>
  );
}
