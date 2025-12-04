"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import QueryProvider from "@/_shared/api/query/queryProvider";
import useMenuKeyStore from "@/_shared/store/useMenuKeyStore";

export default function AppProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setMenuKey } = useMenuKeyStore();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname === "/") return;

    setMenuKey(pathname);
  }, [pathname, setMenuKey]);

  return <QueryProvider>{children}</QueryProvider>;
}
