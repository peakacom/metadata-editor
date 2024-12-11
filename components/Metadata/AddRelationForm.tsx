import { useGetProjectMetadataQuery } from "@/services/metadata";
import { Button, Divider, Flex, Form, Select, Space } from "antd";
import { useEffect, useState } from "react";
import type { FormProps } from "antd";

export interface AddRelationFormProps {
  projectId?: string;
  selectedCatalog?: string;
  selectedSchema?: string;
  initialSelectedModel?: string;
  isAddingRelation: boolean;
  onSubmit: (values: FormValues) => void;
}

export interface FormValues {
  from: string;
  to: string;
  type: string;
}

export default function AddRelationForm({
  projectId,
  selectedCatalog,
  selectedSchema,
  initialSelectedModel,
  isAddingRelation,
  onSubmit,
}: AddRelationFormProps) {
  const [form] = Form.useForm();

  const { data: tables, isLoading: isTablesLoading } =
    useGetProjectMetadataQuery({ projectId: projectId! });

  const [models, setModels] = useState<{ label: string; value: string }[]>();
  const [selectedFromModel, setSelectedFromModel] = useState<
    string | undefined
  >(initialSelectedModel);
  const [selectedToModel, setSelectedToModel] = useState<string>();

  const [fromColumns, setFromColumns] =
    useState<{ label: string; value: string }[]>();
  const [toColumns, setToColumns] =
    useState<{ label: string; value: string }[]>();

  useEffect(() => {
    if (tables) {
      const uniqueTables = new Map<string, { value: string; label: string }>();
      tables.metadata.forEach((table) => {
        const metadata = table.metadata;
        if (
          (selectedCatalog && metadata.catalogId !== selectedCatalog) ||
          (selectedSchema && metadata.schemaName !== selectedSchema)
        ) {
          return;
        }
        const key = `${metadata.projectId}.${metadata.catalogId}.${metadata.schemaName}.${metadata.tableName}`;
        const value = `${metadata.catalogQueryName}.${metadata.schemaName}.${metadata.tableName}`;
        if (!uniqueTables.has(key)) {
          uniqueTables.set(key, { value: key, label: value });
        }
      });
      setModels(Array.from(uniqueTables.values()));
    }
  }, [selectedCatalog, selectedSchema, tables]);

  useEffect(() => {
    if (selectedFromModel && tables) {
      const keySplit = selectedFromModel.split(".");
      const projectId = keySplit[0];
      const catalogId = keySplit[1];
      const schemaName = keySplit[2];
      const tableName = keySplit[3];

      const table = tables.metadata.find(
        (table) =>
          table.metadata.projectId === projectId &&
          table.metadata.catalogId === catalogId &&
          table.metadata.schemaName === schemaName &&
          table.metadata.tableName === tableName
      );

      if (table) {
        setFromColumns(
          table.metadata.columns?.map((column) => {
            return {
              label: column.columnName,
              value: column.columnName,
            };
          })
        );
      }
    }
  }, [selectedFromModel, tables]);

  useEffect(() => {
    if (selectedToModel && tables) {
      const keySplit = selectedToModel.split(".");
      const projectId = keySplit[0];
      const catalogId = keySplit[1];
      const schemaName = keySplit[2];
      const tableName = keySplit[3];

      const table = tables.metadata.find(
        (table) =>
          table.metadata.projectId === projectId &&
          table.metadata.catalogId === catalogId &&
          table.metadata.schemaName === schemaName &&
          table.metadata.tableName === tableName
      );

      if (table) {
        setToColumns(
          table.metadata.columns?.map((column) => {
            return {
              label: column.columnName,
              value: column.columnName,
            };
          })
        );
      }
    }
  }, [selectedToModel, tables]);

  const relationTypeOptions = [
    {
      label: "ONE_TO_ONE",
      value: "ONE_TO_ONE",
    },
    {
      label: "ONE_TO_MANY",
      value: "ONE_TO_MANY",
    },
    {
      label: "MANY_TO_ONE",
      value: "MANY_TO_ONE",
    },
  ];

  const onFinish: FormProps<FormValues>["onFinish"] = (values) => {
    onSubmit(values);
  };

  return (
    <Form form={form} preserve={false} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="From"
        name={"from"}
        required
        rules={[{ required: true, message: "Please select a column." }]}
      >
        <Space.Compact className="w-full">
          <Select
            style={{ width: "60%" }}
            options={models}
            onChange={(value) => {
              setSelectedFromModel(value);
            }}
            placeholder="Table"
            value={initialSelectedModel}
            disabled={initialSelectedModel ? true : false}
            showSearch
            optionFilterProp="label"
            loading={isTablesLoading}
          />
          <Select
            options={fromColumns}
            style={{ width: "40%" }}
            loading={isTablesLoading}
            onChange={(value) => {
              form.setFieldValue("from", `${selectedFromModel}.${value}`);
            }}
            placeholder="Column"
            showSearch
            optionFilterProp="label"
          />
        </Space.Compact>
      </Form.Item>
      <Form.Item
        label="To"
        name={"to"}
        required
        rules={[{ required: true, message: "Please select a column." }]}
      >
        <Space.Compact className="w-full">
          <Select
            style={{ width: "60%" }}
            loading={isTablesLoading}
            options={models}
            onChange={(value) => {
              setSelectedToModel(value);
            }}
            placeholder="Table"
            showSearch
            optionFilterProp="label"
          />
          <Select
            style={{ width: "40%" }}
            loading={isTablesLoading}
            options={toColumns}
            onChange={(value) => {
              form.setFieldValue("to", `${selectedToModel}.${value}`);
            }}
            placeholder="Column"
            showSearch
            optionFilterProp="label"
          />
        </Space.Compact>
      </Form.Item>
      <Form.Item
        label="Type"
        name={"type"}
        required
        rules={[{ required: true, message: "Please select relation type." }]}
      >
        <Select
          options={relationTypeOptions}
          placeholder="Select a relations type"
        />
      </Form.Item>
      <Divider />
      <Flex justify="end">
        <Form.Item label={null}>
          <Button type="primary" htmlType="submit" loading={isAddingRelation}>
            Add Relation
          </Button>
        </Form.Item>
      </Flex>
    </Form>
  );
}
