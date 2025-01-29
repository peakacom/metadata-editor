import { Button, Divider, Flex, Form, Input } from "antd";
import type { FormProps } from "antd";
import TextArea from "antd/es/input/TextArea";

export interface GenerateSemanticsFormProps {
  isGeneratingSemantics: boolean;
  onSubmit: (values: FormValues) => void;
}

export interface FormValues {
  initialPrompt: string;
  limit: string;
}
const INITIAL_PROMPT_PLACEHOLDER = `Write a general description for this table to get better results for semantics generation. 
The process of generating semantics may take longer than a minute, depending on the number of table columns.
Eg: The customer_orders table stores information about orders placed by customers. Each row in the table represents a unique order.`;

export default function GenerateSemanticsForm({
  isGeneratingSemantics,
  onSubmit,
}: GenerateSemanticsFormProps) {
  const [form] = Form.useForm();

  const onFinish: FormProps<FormValues>["onFinish"] = (values) => {
    onSubmit(values);
  };

  return (
    <Form form={form} preserve={false} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Initial Prompt"
        name={"initialPrompt"}
        required
        rules={[
          { required: true, message: "Please write a small description." },
        ]}
      >
        <TextArea
          disabled={isGeneratingSemantics}
          showCount
          placeholder={INITIAL_PROMPT_PLACEHOLDER}
          style={{ height: 120, resize: "none" }}
        />
      </Form.Item>

      <Form.Item
        label="Query Limit For Sample Data"
        name={"limit"}
        required
        rules={[
          {
            required: true,
            message: "Please enter a limit for sample data query.",
          },
        ]}
      >
        <Input
          disabled={isGeneratingSemantics}
          type="number"
          defaultValue={3}
          placeholder={"Limit for the query"}
        />
      </Form.Item>
      <Divider />
      <Flex justify="end">
        <Form.Item label={null}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isGeneratingSemantics}
          >
            Generate Semantics
          </Button>
        </Form.Item>
      </Flex>
    </Form>
  );
}
