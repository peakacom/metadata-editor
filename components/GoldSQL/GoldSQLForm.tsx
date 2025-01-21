import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/ext-language_tools";
import { Button, Divider, Flex, Form, FormProps } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect } from "react";
import { format } from "sql-formatter";

export interface GoldSQLFormProps {
  goldSql?: {
    key: string;
    question: string;
    query: string;
  };
  isAddingUpdatingGoldSql: boolean;
  onSubmit: (values: FormValues) => void;
}

export interface FormValues {
  prompt: string;
  sql: string;
}

export default function GoldSQLForm({
  goldSql,
  isAddingUpdatingGoldSql,
  onSubmit,
}: GoldSQLFormProps) {
  const [form] = Form.useForm();

  const onFinish: FormProps<FormValues>["onFinish"] = (values) => {
    onSubmit(values);
  };

  useEffect(() => {
    if (goldSql) {
      form.setFieldsValue({
        prompt: goldSql.question,
        sql: format(goldSql.query, { language: "trino" }),
      });
    }
  }, [goldSql, form]);

  return (
    <Form form={form} preserve={false} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Question"
        name={"prompt"}
        required
        rules={[{ required: true, message: "Please write a question." }]}
      >
        <TextArea
          disabled={isAddingUpdatingGoldSql}
          showCount
          placeholder="Question"
          style={{ height: 120, resize: "none" }}
        />
      </Form.Item>
      <Divider />
      <Form.Item
        label="SQL"
        name={"sql"}
        required
        rules={[{ required: true, message: "Please write a sql query." }]}
      >
        <AceEditor
          width="100%"
          height="300px"
          mode="sql"
          placeholder="SQL"
          theme="tomorrow"
          fontSize={14}
          lineHeight={19}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
        />
      </Form.Item>
      <Divider />
      <Flex justify="end">
        <Form.Item label={null}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isAddingUpdatingGoldSql}
          >
            {goldSql ? "Update Gold SQL" : "Add Gold SQL"}
          </Button>
        </Form.Item>
      </Flex>
    </Form>
  );
}
