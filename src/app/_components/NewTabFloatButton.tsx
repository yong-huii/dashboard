"use client";

import { ExportOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";

import useMenuKeyStore from "@/_shared/store/useMenuKeyStore";

export default function NewTabFloatButton() {
  const { menuKey } = useMenuKeyStore();

  return (
    <FloatButton
      icon={<ExportOutlined />}
      style={{ insetInlineEnd: 28, bottom: 28 }}
      onClick={() => {
        const base =
          window.location.origin + window.location.pathname.replace(/\/$/, "");
        window.open(`${base}${menuKey}`, "_blank");
      }}
    />
  );
}
