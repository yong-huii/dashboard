import { useEffect } from "react";
import { RedoOutlined } from "@ant-design/icons";
import { message } from "antd";

interface Props {
  refetch: () => void;
}

export default function ResetButton({ refetch }: Props) {
  const onClickHandler = () => {
    refetch();
  };

  return (
    <button
      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[#D9D9D9]"
      onClick={onClickHandler}
    >
      <RedoOutlined className="text-[1rem] text-[#555879]" />
    </button>
  );
}
