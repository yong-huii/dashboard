import { RedoOutlined } from "@ant-design/icons";

interface Props {
  onClick?: () => void;
}

export default function ResetButton({ onClick }: Props) {
  return (
    <button
      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[#D9D9D9]"
      onClick={onClick}
    >
      <RedoOutlined className="text-[1rem] text-[#555879]" />
    </button>
  );
}
