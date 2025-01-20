import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/ext-language_tools";
import { Button, Divider, Flex, Form, FormProps } from "antd";
import TextArea from "antd/es/input/TextArea";

export interface GoldSQLFormProps {
  isAddingUpdatingGoldSql: boolean;
  onSubmit: (values: FormValues) => void;
}

export interface FormValues {
  prompt: string;
  sql: string;
}

export default function GoldSQLForm({
  isAddingUpdatingGoldSql,
  onSubmit,
}: GoldSQLFormProps) {
  const [form] = Form.useForm();

  const onFinish: FormProps<FormValues>["onFinish"] = (values) => {
    onSubmit(values);
  };

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
            Add Gold SQL
          </Button>
        </Form.Item>
      </Flex>
    </Form>
  );
}
