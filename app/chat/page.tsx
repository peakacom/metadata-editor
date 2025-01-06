"use client";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/ext-language_tools";

import {
  ChatHistory,
  useAskAIAgentMutation,
  useDeleteChatHistoryMutation,
  useGetChatHistoryQuery,
  useUpdateChatHistoryNameMutation,
} from "@/services/ai";
import { useGetProjectInfoQuery } from "@/services/partner";
import { Path } from "@/services/types";
import {
  Button,
  Card,
  Dropdown,
  Flex,
  Input,
  Layout,
  Modal,
  notification,
  Skeleton,
  Spin,
  Tabs,
  theme,
  Tree,
  TreeDataNode,
  TreeProps,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import styles from "@/app/chat/chat.module.css";
import { useEffect, useRef, useState } from "react";
import MessageOutlined from "@ant-design/icons/MessageOutlined";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { EllipsisVertical } from "lucide-react";
import {
  CheckCircleFilled,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { cloneDeep } from "lodash";
import { format } from "sql-formatter";
import ChatDataViewer from "@/components/Chat/ChatDataViewer";
import {
  useAddGoldenSqlMutation,
  useGenerateSampleQuestionsQuery,
} from "@/services/metadata";
import ChatSampleQuestionsViewer from "@/components/Chat/ChatSampleQuestionsViewer";

const { Title, Text } = Typography;

export default function Chat() {
  const router = useRouter();
  const [askAIAgent] = useAskAIAgentMutation();

  const { data: projectInfo, isLoading: isProjectInfoLoading } =
    useGetProjectInfoQuery({});

  const { data: chatHistory, isLoading: isChatHistoryLoading } =
    useGetChatHistoryQuery(
      { projectId: projectInfo?.projectId ? projectInfo.projectId : "" },
      { skip: !projectInfo }
    );

  const [isAIProcessing, setIsAIProcessing] = useState(false);

  const containerRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight + 400,
      });
    }
  }, [chatHistory, isAIProcessing, containerRef]);

  const [inputValue, setInputValue] = useState("");
  const [selectedThread, setSelectedThread] = useState<ChatHistory | null>(
    null
  );

  const [isAddGoldSQLModalOpen, setIsGoldSQLModalOpen] = useState(false);
  const [selectedGoldSqlQuestion, setSelectedGoldSqlQuestion] =
    useState<string>("");
  const [selectedGoldSqlQuery, setSelectedGoldSqlQuery] = useState<string>("");
  const [addGoldSQL, { isLoading: isAddingGoldSQL }] =
    useAddGoldenSqlMutation();

  const [isThreadModalOpen, setIsThreadModalOpen] = useState(false);
  const [isThreadModalEdit, setIsThreadModalEdit] = useState(false);
  const [threadModalSelectedThread, setThreadModalSelectedThread] =
    useState<ChatHistory | null>(null);
  const [newThreadName, setNewThreadName] = useState("");

  const [deleteChatHistory, { isLoading: isDeletingThread }] =
    useDeleteChatHistoryMutation();
  const [updateChatHistoryName, { isLoading: isUpdatingThread }] =
    useUpdateChatHistoryNameMutation();

  const { data: sampleQuestions, isLoading: isSampleQuestionsLoading } =
    useGenerateSampleQuestionsQuery(
      {
        projectId: projectInfo ? projectInfo?.projectId : "",
        question: selectedThread
          ? selectedThread.tasks[selectedThread.tasks.length - 1].message
          : "",
      },
      { skip: !projectInfo }
    );

  useEffect(() => {
    if (chatHistory && selectedThread && !isAIProcessing) {
      const thread = chatHistory.history.find(
        (t) => t.aiThreadId === selectedThread.aiThreadId
      );
      if (thread) {
        setSelectedThread(thread);
      }
    }
  }, [chatHistory, selectedThread, isAIProcessing]);

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

  const submitAsk = async (question?: string) => {
    const aiMessage = question ? question : inputValue;

    if (selectedThread) {
      const clonedSelectedThread = cloneDeep(selectedThread);
      clonedSelectedThread?.tasks.push({
        step: [],
        output: undefined,
        message: aiMessage,
        modelParams: {},
      });
      setIsAIProcessing(true);
      setSelectedThread(clonedSelectedThread);
    } else {
      setIsAIProcessing(true);
      const newThread: ChatHistory = {
        id: "-1",
        aiThreadId: "",
        displayName: "New Chat",
        tasks: [
          {
            step: [],
            output: undefined,
            message: aiMessage,
            modelParams: {},
          },
        ],
      };
      setSelectedThread(newThread);
    }

    try {
      const result = await askAIAgent({
        message: aiMessage,
        projectId: projectInfo ? projectInfo.projectId : "",
        threadId: selectedThread ? selectedThread.aiThreadId : undefined,
      }).unwrap();

      const newThread: ChatHistory = {
        id: "",
        aiThreadId: result.threadId,
        displayName: "New Chat",
        tasks: [
          {
            step: [],
            output: result.output,
            message: aiMessage,
            modelParams: {},
          },
        ],
      };
      setSelectedThread(newThread);
    } catch (error) {
      openNotification(
        true,
        "Error",
        (error as { data: { message: string } }).data.message,
        false
      )();
    } finally {
      setInputValue("");
      setIsAIProcessing(false);
    }
  };

  const onSelect: TreeProps["onSelect"] = (selectedKeys) => {
    if (!selectedKeys) {
      setSelectedThread(null);
      return;
    }
    if (chatHistory) {
      const thread = chatHistory.history.find(
        (t) => t.aiThreadId === selectedKeys[0]
      );
      if (thread) {
        setSelectedThread(thread);
      } else {
        setSelectedThread(null);
      }
    }
  };

  const threads: TreeDataNode[] =
    isChatHistoryLoading || !chatHistory
      ? []
      : chatHistory.history.map((thread) => {
          return {
            key: thread.aiThreadId,
            className: styles.chatHistoryNode,
            title: (
              <div className="flex items-center justify-center w-full">
                <Text ellipsis title={thread.displayName} className="w-56">
                  {thread.displayName}
                </Text>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="ml-2 cursor-pointer"
                >
                  <Dropdown
                    menu={{
                      items: [
                        {
                          label: "Rename",
                          key: "0",
                          onClick: () => {
                            setIsThreadModalEdit(true);
                            setThreadModalSelectedThread(thread);
                            setIsThreadModalOpen(true);
                            setNewThreadName(thread.displayName);
                          },
                        },
                        {
                          label: "Delete",
                          key: "1",
                          danger: true,
                          onClick: () => {
                            setIsThreadModalEdit(false);
                            setThreadModalSelectedThread(thread);
                            setIsThreadModalOpen(true);
                          },
                        },
                      ],
                    }}
                    trigger={["click"]}
                  >
                    <EllipsisVertical size={16} strokeWidth={0.5} />
                  </Dropdown>
                </span>
              </div>
            ),
          } as TreeDataNode;
        });
  return (
    <Content className="w-full h-full flex flex-col justify-start">
      {contextHolder}
      <Modal
        title={isThreadModalEdit ? "Edit Thread Name" : "Delete"}
        open={isThreadModalOpen}
        centered
        width={450}
        destroyOnClose
        onCancel={() => {
          setIsThreadModalOpen(false);
          setSelectedThread(null);
          setNewThreadName("");
        }}
        okText={isThreadModalEdit ? "Save" : "Delete"}
        okType={isThreadModalEdit ? "primary" : "danger"}
        okButtonProps={{ loading: isDeletingThread || isUpdatingThread }}
        onOk={async () => {
          if (!threadModalSelectedThread) {
            return;
          }

          if (isThreadModalEdit) {
            try {
              await updateChatHistoryName({
                projectId: projectInfo ? projectInfo.projectId : "",
                threadId: threadModalSelectedThread.aiThreadId,
                name: newThreadName,
              });
              setSelectedThread(null);
              setIsThreadModalOpen(false);
              setNewThreadName("");
              openNotification(
                true,
                "Success",
                "Thread update successfully."
              )();
            } catch {
              openNotification(
                true,
                "Error",
                "Could not update thread.",
                false
              )();
            }
          } else {
            try {
              await deleteChatHistory({
                projectId: projectInfo ? projectInfo.projectId : "",
                threadId: threadModalSelectedThread.aiThreadId,
              });
              setSelectedThread(null);
              setIsThreadModalOpen(false);
              openNotification(
                true,
                "Success",
                "Thread deleted successfully."
              )();
            } catch {
              openNotification(
                true,
                "Error",
                "Could not delete thread.",
                false
              )();
            }
          }
        }}
      >
        {isThreadModalEdit ? (
          <Input
            placeholder="Thread Name"
            value={newThreadName}
            onChange={(e) => {
              setNewThreadName(e.target.value);
            }}
          />
        ) : (
          "Do you really want to delete this thread?"
        )}
      </Modal>
      <Modal
        title={"Add to Golden SQL"}
        open={isAddGoldSQLModalOpen}
        centered
        width={450}
        destroyOnClose
        onCancel={() => {
          setIsGoldSQLModalOpen(false);
        }}
        okText="Add"
        okType="primary"
        okButtonProps={{ loading: isAddingGoldSQL }}
        onOk={async () => {
          if (!projectInfo) {
            return;
          }
          try {
            await addGoldSQL({
              projectId: projectInfo.projectId,
              prompt: selectedGoldSqlQuestion,
              sql: selectedGoldSqlQuery,
            }).unwrap();
            openNotification(
              true,
              "Success",
              "Successfully added Question/SQL pair as Gold SQL."
            )();
          } catch {
            openNotification(
              true,
              "Error",
              "Could not add to Gold SQL.",
              false
            )();
          } finally {
            setIsGoldSQLModalOpen(false);
          }
        }}
      >
        Do you want to add Question/SQL pair as Gold SQL?
      </Modal>
      <Layout
        style={{
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <Sider style={{ background: "#fafafa" }} width={300}>
          <Flex vertical gap="large" className="w-full h-full p-3">
            <Button
              style={{ backgroundColor: "transparent" }}
              onClick={() => {
                setSelectedThread(null);
              }}
              block
            >
              <PlusOutlined />
              New thread
            </Button>
            {isChatHistoryLoading ? (
              <div className="w-full h-full flex justify-center items-center">
                <Spin indicator={<LoadingOutlined spin />} size="large" />
              </div>
            ) : (
              <Tree
                style={{ background: "#fafafa", height: "100%" }}
                className="w-full h-full"
                treeData={threads}
                showIcon={false}
                onSelect={onSelect}
                selectedKeys={selectedThread ? [selectedThread.aiThreadId] : []}
              />
            )}
          </Flex>
        </Sider>
        <Content
          style={{ padding: "0 24px", minHeight: 280, marginTop: 30 }}
          className="flex w-full justify-center items-center overflow-scroll h-[90%]"
          ref={containerRef}
        >
          {selectedThread ? (
            <div className="flex flex-col gap-6 w-2/3 h-full">
              {selectedThread.tasks.map((task, index) => (
                <div key={index}>
                  <Title className="rounded flex" level={3}>
                    <MessageOutlined
                      className={styles.questionIcon + " mt-1 mr-3"}
                    />
                    <Text className={styles.question}>{task.message}</Text>
                  </Title>
                  {isAIProcessing &&
                  index === selectedThread.tasks.length - 1 ? (
                    <div className="h-[450px]">
                      <Skeleton active className="" />
                    </div>
                  ) : (
                    <Card
                      title={
                        <div className="flex justify-between">
                          <div>
                            <CheckCircleFilled
                              className="mr-2"
                              style={{ color: "#52c41a" }}
                            />
                            Summary
                          </div>
                          <Button
                            type="primary"
                            onClick={() => {
                              if (!task.output) {
                                return;
                              }

                              setSelectedGoldSqlQuestion(task.output.text);
                              setSelectedGoldSqlQuery(task.output.query);

                              setIsGoldSQLModalOpen(true);
                            }}
                          >
                            Add to Gold SQL
                          </Button>
                        </div>
                      }
                      style={{
                        marginBottom:
                          index === selectedThread.tasks.length - 1
                            ? "10px"
                            : "0px",
                      }}
                      className="w-full h-[450px]"
                    >
                      <Tabs
                        defaultActiveKey="1"
                        className="w-full"
                        type="card"
                        items={[
                          {
                            key: "1",
                            label: "Result",
                            children: (
                              <Text className="text-medium text-gray-400 h-[300px] whitespace-pre-wrap">
                                {task.output?.text}
                              </Text>
                            ),
                          },
                          {
                            key: "2",
                            label: "SQL",
                            children: (
                              <AceEditor
                                width="100%"
                                height="300px"
                                mode="sql"
                                theme="tomorrow"
                                readOnly
                                value={format(
                                  task.output?.query ? task.output.query : "",
                                  {
                                    language: "trino",
                                  }
                                )}
                                fontSize={14}
                                lineHeight={19}
                                showPrintMargin={true}
                                showGutter={true}
                                highlightActiveLine={true}
                              />
                            ),
                          },
                          {
                            key: "3",
                            label: "Data",
                            children: (
                              <ChatDataViewer data={task.output?.data} />
                            ),
                          },
                        ]}
                      />
                    </Card>
                  )}
                </div>
              ))}
              {!isAIProcessing && (
                <div className="flex items-center justify-center gap-6 w-full h-full">
                  <ChatSampleQuestionsViewer
                    sampleQuestions={sampleQuestions}
                    onSubmit={(question: string) => {
                      submitAsk(question);
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              {isSampleQuestionsLoading ? (
                <div className="w-full h-full flex justify-center items-center">
                  <Spin indicator={<LoadingOutlined spin />} size="large" />
                  <Text className="ml-3">Generating sample questions...</Text>
                </div>
              ) : (
                <ChatSampleQuestionsViewer
                  sampleQuestions={sampleQuestions}
                  onSubmit={(question: string) => {
                    submitAsk(question);
                  }}
                />
              )}
            </>
          )}

          <div
            className={
              styles.prompt +
              " flex align-end bg-gray-2 p-3 border border-gray-3 rounded "
            }
          >
            <Input.TextArea
              size="large"
              className="max-h-40"
              autoSize
              placeholder="Ask to explore your data"
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
              }}
              onPressEnter={(event) => {
                if (event.shiftKey) return;
                event.preventDefault();
                submitAsk();
              }}
              disabled={isAIProcessing || isSampleQuestionsLoading}
            />
            <div className="flex flex-col justify-end align-center">
              <Button
                className="min-w-[72px] ml-3"
                disabled={isSampleQuestionsLoading}
                type="primary"
                size="large"
                loading={isAIProcessing}
                onClick={() => {
                  submitAsk();
                }}
              >
                Ask
              </Button>
            </div>
          </div>
        </Content>
      </Layout>
    </Content>
  );
}
