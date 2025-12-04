import type { Metadata } from "next";

import "@/_shared/styles/globals.css";

import { AntdRegistry } from "@ant-design/nextjs-registry";

import AppProvider from "./_components/provider/AppProvider";

export const metadata: Metadata = {
  title: "app",
  description: "app",
  icons: [
    { rel: "icon", url: "/logo512.png", sizes: "512x512", type: "image/png" },
    { rel: "apple-touch-icon", url: "/logo192.png" },
  ],
  manifest: "/manifest.json",
};

export const viewport = {
  minimumScale: 1,
  initialScale: 1,
  width: "device-width",
  shrinkToFit: "no",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-dvh w-full bg-white antialiased">
        <AntdRegistry>
          <AppProvider>{children}</AppProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
