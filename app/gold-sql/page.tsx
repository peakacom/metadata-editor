"use client";

import { useGetProjectInfoQuery } from "@/services/partner";
import { Path } from "@/services/types";
import {
  Layout,
  notification,
  theme,
  Table,
  Spin,
  Button,
  Space,
  Empty,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { Content } from "antd/es/layout/layout";
import {
  useDeleteGoldenSqlMutation,
  useGetGoldenSqlsQuery,
} from "@/services/metadata";
import { LoadingOutlined } from "@ant-design/icons";
import { useState } from "react";
import Link from "next/link";

export default function GoldSQL() {
  const router = useRouter();
  const { data: projectInfo, isLoading: isProjectInfoLoading } =
    useGetProjectInfoQuery({});

  const { data: goldenSqls, isLoading: isGoldSqlsLoading } =
    useGetGoldenSqlsQuery({
      projectId: projectInfo?.projectId ? projectInfo.projectId : "",
    });

  const [deleteGoldSql] = useDeleteGoldenSqlMutation();

  const [deletingGoldSqlId, setDeletingGoldSqlId] = useState<
    string | undefined
  >();

  const fieldsDataSource = goldenSqls?.result.map((goldenSql) => {
    return {
      key: goldenSql.id,
      question: goldenSql.metadata.prompt,
      query: goldenSql.metadata.sql,
    };
  });

  const fieldColumns = [
    {
      title: "Id",
      dataIndex: "key",
      key: "key",
      ellipsis: true,
      width: 350,
    },
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
      ellipsis: true,
    },
    {
      title: "Query",
      dataIndex: "query",
      key: "query",
      ellipsis: true,
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_: unknown, record: unknown) => {
        return (
          <Space size="middle">
            <Button
              color="danger"
              variant="solid"
              loading={deletingGoldSqlId === (record as { key: string }).key}
              disabled={
                deletingGoldSqlId === undefined
                  ? false
                  : deletingGoldSqlId !== (record as { key: string }).key
              }
              onClick={async () => {
                const sql = record as {
                  key: string;
                  question: string;
                  query: string;
                };
                setDeletingGoldSqlId(sql.key);
                try {
                  await deleteGoldSql({
                    projectId: projectInfo?.projectId
                      ? projectInfo.projectId
                      : "",
                    id: sql.key,
                  }).unwrap();

                  openNotification(
                    true,
                    "Success",
                    "Gold SQL has been deleted successfully."
                  )();
                  setDeletingGoldSqlId(undefined);
                } catch (error) {
                  openNotification(
                    true,
                    "Fail",
                    (error as { data: { message: string } }).data.message,
                    false
                  )();
                }
              }}
            >
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  const [api, contextHolder] = notification.useNotification();

  const openNotification =
    (
      pauseOnHover: boolean,
      title: string,
      message: string,
      success: boolean = true
    ) =>
    () => {
      if (success) {
        api.success({
          message: title,
          description: message,
          showProgress: true,
          pauseOnHover,
        });
      } else {
        api.error({
          message: title,
          description: message,
          showProgress: true,
          pauseOnHover,
        });
      }
    };

  if (!isProjectInfoLoading && !projectInfo) {
    router.push(Path.Settings);
    return null;
  }

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Content className="w-full h-full flex flex-col justify-start">
      {contextHolder}

      <Layout
        style={{
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <Content
          style={{ padding: "0 24px", minHeight: 280, marginTop: 30 }}
          className="flex w-full justify-center items-start h-[90%]"
        >
          {goldenSqls?.result.length === 0 ? (
            <div className="h-screen flex justify-center items-center">
              <Empty
                description={
                  <Typography.Text>
                    Go to <Link href="/chat">Chat</Link> to create Question/SQL
                    pairs.
                  </Typography.Text>
                }
              ></Empty>
            </div>
          ) : isGoldSqlsLoading ? (
            <div className="h-screen flex justify-center items-center">
              <Spin indicator={<LoadingOutlined spin />} size="large" />
            </div>
          ) : (
            <Table
              dataSource={fieldsDataSource}
              columns={fieldColumns}
              pagination={{
                pageSize: 30,
                hideOnSinglePage: true,
                showSizeChanger: false,
                size: "default",
              }}
            />
          )}
        </Content>
      </Layout>
    </Content>
  );
}