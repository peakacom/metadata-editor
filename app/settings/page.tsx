"use client";

import useProjectInfos from "@/hooks/useProjectInfos";
import { aiApi } from "@/services/ai";
import {
  selectApiKey,
  setApiKey,
  setApiKeys,
  setSelectedApiKey,
} from "@/services/apiKeySlice";
import { metadataApi } from "@/services/metadata";
import { partnerApi, useLazyGetProjectInfoQuery } from "@/services/partner";
import { resetSchemaViewer } from "@/services/schemaViewerSlice";
import {
  Button,
  Card,
  Divider,
  Flex,
  Form,
  FormProps,
  Input,
  Modal,
  notification,
  Spin,
  Typography,
} from "antd";
import { cloneDeep } from "lodash";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export interface SettingsFormValues {
  apiKey: string;
}
const { Paragraph } = Typography;

export default function Settings() {
  const apiKeyState = useSelector(selectApiKey);

  const dispatch = useDispatch();
  const [getProjectInfo] = useLazyGetProjectInfoQuery();
  const [isSavingAPIKey, setIsSavingAPIKey] = useState(false);
  const [form] = Form.useForm();
  const [newApiKeyEntered, setNewApiKeyEntered] = useState(false);
  const projectInfos = useProjectInfos();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAll, setIsDeleteAll] = useState(false);
  const [deletedAPIKey, setDeletedAPIKey] = useState("");

  const onFinish: FormProps<SettingsFormValues>["onFinish"] = async (
    values
  ) => {
    const apiKeys = apiKeyState.apiKeys;
    if (apiKeys?.includes(values.apiKey)) {
      openNotification(true, "Error", "API Key already added.", false)();
      return;
    }

    try {
      setIsSavingAPIKey(true);
      dispatch(setApiKey(values.apiKey.trim()));
      if (!apiKeyState.selectedApiKey) {
        dispatch(setSelectedApiKey(values.apiKey));
        dispatch(resetSchemaViewer());
        dispatch(metadataApi.util.resetApiState());
        dispatch(aiApi.util.resetApiState());
        dispatch(partnerApi.util.resetApiState());
      }
      await getProjectInfo({ apiKey: values.apiKey }).unwrap();
      openNotification(true, "Success", "API Key added successfully.")();
    } catch (error) {
      console.error(error);
      openNotification(true, "Error", "Invalid API Key.", false)();
    } finally {
      setIsSavingAPIKey(false);
      setNewApiKeyEntered(false);
      form.setFieldsValue({
        apiKey: "",
      });
    }
  };

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

  return (
    <div className="flex flex-col gap-10 justify-start items-center w-full h-full pt-10">
      {contextHolder}
      <Card style={{ width: 600 }} title={"New API Key"}>
        <Form
          form={form}
          preserve={false}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="API Key"
            name={"apiKey"}
            required
            rules={[
              { required: true, message: "Please enter a valid API key." },
            ]}
          >
            <Input
              placeholder="API Key"
              onChange={() => {
                setNewApiKeyEntered(true);
              }}
            />
          </Form.Item>

          <Divider />

          <Form.Item label={null}>
            <Flex justify="space-between" gap="large">
              <Button
                color="danger"
                variant="solid"
                onClick={async () => {
                  setIsDeleteModalOpen(true);
                  setIsDeleteAll(true);
                }}
              >
                Delete All API Keys
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={!newApiKeyEntered}
              >
                Add API Key
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </Card>
      {projectInfos && (
        <>
          {Object.keys(projectInfos).map((key) => (
            <Card
              style={{ width: 600 }}
              title={
                <div className="flex justify-between items-end">
                  <span>Project Info</span>

                  <div className="flex justify-center items-center gap-3">
                    {apiKeyState.selectedApiKey === key ? (
                      <span className="text-green-500">Active</span>
                    ) : (
                      <Button
                        color="primary"
                        variant="solid"
                        disabled={apiKeyState.selectedApiKey === key}
                        onClick={async () => {
                          dispatch(setSelectedApiKey(key));
                          dispatch(resetSchemaViewer());
                          dispatch(metadataApi.util.resetApiState());
                          dispatch(aiApi.util.resetApiState());
                          dispatch(partnerApi.util.resetApiState());
                          openNotification(
                            true,
                            "Success",
                            "API Key activated successfully."
                          )();
                        }}
                      >
                        Activate
                      </Button>
                    )}

                    <Button
                      color="danger"
                      variant="solid"
                      onClick={async () => {
                        setIsDeleteModalOpen(true);
                        setIsDeleteAll(false);
                        setDeletedAPIKey(key);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              }
              key={key}
            >
              <Flex vertical align="start" justify="start">
                <Paragraph>{`Account: ${projectInfos[key].email}`}</Paragraph>
                <Paragraph>{`Project Name: ${projectInfos[key].projectName}`}</Paragraph>
                <Paragraph>{`Project Id: ${projectInfos[key].projectId}`}</Paragraph>
              </Flex>
            </Card>
          ))}
        </>
      )}
      <Spin spinning={!projectInfos || isSavingAPIKey} fullscreen />
      <Modal
        title={"Delete"}
        open={isDeleteModalOpen}
        centered
        width={450}
        destroyOnClose
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setIsDeleteAll(false);
          setDeletedAPIKey("");
        }}
        okText={"Delete"}
        okType={"danger"}
        onOk={async () => {
          if (isDeleteAll) {
            dispatch(setApiKeys([]));
            dispatch(setSelectedApiKey(null));
            dispatch(resetSchemaViewer());
            dispatch(metadataApi.util.resetApiState());
            dispatch(aiApi.util.resetApiState());
            openNotification(
              true,
              "Success",
              "All API Keys deleted successfully."
            )();
          } else {
            if (!apiKeyState.apiKeys) {
              return;
            }

            const apiKeys = cloneDeep(apiKeyState.apiKeys).filter(
              (apiKey) => apiKey !== deletedAPIKey
            );

            if (deletedAPIKey === apiKeyState.selectedApiKey) {
              if (apiKeys.length > 0) {
                dispatch(setSelectedApiKey(apiKeys[0]));
              } else {
                dispatch(setSelectedApiKey(null));
              }
            }

            dispatch(setApiKeys(apiKeys));

            openNotification(
              true,
              "Success",
              "API Key deleted successfully."
            )();

            dispatch(resetSchemaViewer());
            dispatch(metadataApi.util.resetApiState());
            dispatch(aiApi.util.resetApiState());
            dispatch(partnerApi.util.resetApiState());
          }
          setIsDeleteModalOpen(false);
          setIsDeleteAll(false);
          setDeletedAPIKey("");
        }}
      >
        {isDeleteAll
          ? "Do you really want to delete All API Keys?"
          : "Do you really want to delete API Key?"}
      </Modal>
    </div>
  );
}
