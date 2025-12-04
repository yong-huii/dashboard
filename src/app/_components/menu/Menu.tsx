"use client";

import { Menu as AntdMenu, MenuProps } from "antd";

import useMenuKeyStore from "@/_shared/store/useMenuKeyStore";

type MenuItem = Required<MenuProps>["items"][number];

export default function Menu() {
  const { menuKey, setMenuKey } = useMenuKeyStore();

  const items: MenuItem[] = [
    {
      key: "DX",
      label: "DX",
      type: "group",
      children: [
        {
          key: "dashboard",
          label: "대시보드",
          children: [
            { key: "/type-1", label: "비정형대시보드" },
            { key: "/type-2", label: "정형대시보드" },
            { key: "/type-3", label: "Word Cloud" },
          ],
        },
      ],
    },
  ];

  const onClick: MenuProps["onClick"] = e => {
    setMenuKey(e.key);
  };

  return (
    <AntdMenu
      onClick={onClick}
      style={{
        width: 256,
        height: "100%",
        borderRight: "1px solid #D9D9D9",
      }}
      selectedKeys={[menuKey]}
      defaultOpenKeys={["DX", "dashboard"]}
      mode="inline"
      items={items}
    />
  );
}
