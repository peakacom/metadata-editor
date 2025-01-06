"use client";
import { useGetProjectInfoQuery } from "@/services/partner";
import { Path } from "@/services/types";
import { Avatar, Button, Layout, Space } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { UserOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import styles from "@/components/Layout/app.layout.module.css";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: projectInfo, isLoading } = useGetProjectInfoQuery({});

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin indicator={<LoadingOutlined spin />} size="large" />
      </div>
    );
  }

  return (
    <Layout className="h-screen">
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#27282a",
          width: "100%",
        }}
      >
        <Space className="justify-start">
          <div className="flex items-center justify-center gap-4">
            <span>
              <Image src="/logo.svg" width={32} height={32} alt="logo" />
            </span>
            <Button
              shape="round"
              size="small"
              style={{
                border: "none",
              }}
              className={
                pathname.includes(Path.Chat.toString())
                  ? styles.headerButtonHighlight
                  : styles.headerButton
              }
              onClick={() => router.push(Path.Chat)}
            >
              Chat
            </Button>
            <Button
              shape="round"
              size="small"
              style={{
                border: "none",
              }}
              className={
                pathname.includes(Path.Modeling.toString())
                  ? styles.headerButtonHighlight
                  : styles.headerButton
              }
              onClick={() => router.push(Path.Modeling)}
            >
              Modeling
            </Button>
            <Button
              shape="round"
              size="small"
              style={{
                border: "none",
              }}
              className={
                pathname.includes(Path.GoldSQL.toString())
                  ? styles.headerButtonHighlight
                  : styles.headerButton
              }
              onClick={() => router.push(Path.GoldSQL)}
            >
              Gold SQL
            </Button>
          </div>
        </Space>
        {projectInfo && (
          <Space>
            <span className="text-gray-300">
              Current Project: {projectInfo.projectName}
            </span>
          </Space>
        )}
        <Space>
          {projectInfo ? (
            <Avatar
              style={{ backgroundColor: "#fde3cf", color: "#f56a00" }}
              className="cursor-pointer"
              onClick={() => {
                router.push(Path.Settings);
              }}
            >
              {projectInfo.email[0].toUpperCase()}
            </Avatar>
          ) : (
            <Avatar
              onClick={() => {
                router.push(Path.Settings);
              }}
              className="cursor-pointer"
              icon={<UserOutlined />}
            />
          )}
        </Space>
      </Header>
      <Content style={{ width: "100vw", height: "100vh" }}>{children}</Content>
    </Layout>
  );
}
