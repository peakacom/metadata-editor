"use client";
import AppLayout from "@/components/Layout/AppLayout";
import "./globals.css";
import { ReduxProvider } from "@/services/provider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReduxProvider>
      <html lang="en">
        <body>
          <AntdRegistry>
            <ConfigProvider>
              <AppLayout>{children}</AppLayout>
            </ConfigProvider>
          </AntdRegistry>
        </body>
      </html>
    </ReduxProvider>
  );
}
