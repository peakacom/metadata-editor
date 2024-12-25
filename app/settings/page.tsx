"use client";

import { aiApi } from "@/services/ai";
import { resetApiKey, selectApiKey, setApiKey } from "@/services/apiKeySlice";
import { metadataApi } from "@/services/metadata";
import {
  partnerApi,
  useGetProjectInfoQuery,
  useLazyGetProjectInfoQuery,
} from "@/services/partner";
import { resetSchemaViewer } from "@/services/schemaViewerSlice";
import {
  Button,
  Card,
  Divider,
  Flex,
  Form,
  FormProps,
  Input,
  notification,
  Spin,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export interface SettingsFormValues {
  apiKey: string;
}
const { Paragraph } = Typography;

export default function Settings() {
  const apiKeyContainer = useSelector(selectApiKey);
  const dispatch = useDispatch();
  const [getProjectInfo] = useLazyGetProjectInfoQuery();
  const [isSavingAPIKey, setIsSavingAPIKey] = useState(false);
  const [form] = Form.useForm();
  const [newApiKeyEntered, setNewApiKeyEntered] = useState(false);
  const {
    data: projectInfo,
    isLoading: isProjectInfoLoading,
    refetch: refetchProjectInfo,
    error: projectInfoError,
  } = useGetProjectInfoQuery({});

  const onFinish: FormProps<SettingsFormValues>["onFinish"] = async (
    values
  ) => {
    const oldApiKey = apiKeyContainer ? apiKeyContainer.apiKey : undefined;
    try {
      setIsSavingAPIKey(true);
      dispatch(setApiKey(values.apiKey));
      await getProjectInfo({}).unwrap();
      openNotification(true, "Success", "API Key saved successfully.")();
      refetchProjectInfo();
    } catch (error) {
      console.error(error);
      dispatch(setApiKey(oldApiKey ? oldApiKey : ""));
      form.setFieldsValue({
        apiKey: oldApiKey,
      });
      openNotification(true, "Error", "Invalid API Key.", false)();
    } finally {
      setIsSavingAPIKey(false);
      setNewApiKeyEntered(false);
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

  useEffect(() => {
    if (!apiKeyContainer.apiKey) {
      return;
    }
    form.setFieldsValue({
      apiKey: apiKeyContainer.apiKey.split(".")[0] + ".******************",
    });
  }, [apiKeyContainer, form, isProjectInfoLoading]);

  return (
    <div className="flex flex-col gap-10 justify-center items-center w-full h-full">
      {contextHolder}
      <Card style={{ width: 600 }} title={"API Key"}>
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
            <Flex justify="end" gap="large">
              <Button
                color="danger"
                variant="solid"
                onClick={async () => {
                  dispatch(resetApiKey());
                  dispatch(resetSchemaViewer());
                  form.setFieldsValue({ apiKey: "" });
                  openNotification(
                    true,
                    "Success",
                    "API Key deleted successfully."
                  )();
                  dispatch(partnerApi.util.resetApiState());
                  dispatch(metadataApi.util.resetApiState());
                  dispatch(aiApi.util.resetApiState());
                }}
              >
                Delete
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={!newApiKeyEntered}
              >
                Save API Key
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </Card>
      {projectInfo && !projectInfoError && (
        <Card style={{ width: 600 }} title={"Project Info"}>
          <Flex vertical align="start" justify="start">
            <Paragraph>{`Account: ${projectInfo.email}`}</Paragraph>
            <Paragraph>{`Project Name: ${projectInfo.projectName}`}</Paragraph>
            <Paragraph>{`Project Id: ${projectInfo.projectId}`}</Paragraph>
          </Flex>
        </Card>
      )}
      <Spin spinning={isProjectInfoLoading || isSavingAPIKey} fullscreen />
    </div>
  );
}
