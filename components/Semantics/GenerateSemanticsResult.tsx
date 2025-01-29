import { DBMetaData } from "@/services/types";
import {
  Button,
  Divider,
  Flex,
  Input,
  InputRef,
  Space,
  Table,
  Typography,
} from "antd";
const { Text } = Typography;
import type { ColumnsType, FilterDropdownProps } from "antd/es/table/interface";
import { Key, useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";

export interface GenerateSemanticsResultProps {
  metadata: DBMetaData;
  isUpdatingMetadata: boolean;
  onTableDescriptionChange: (description: string) => void;
  onColumnDescriptionChange: (column: string, description: string) => void;
  onUpdate: (selectedRowKeys: Key[]) => void;
}

export interface FormValues {
  initialPrompt: string;
}

export default function GenerateSemanticsResult({
  metadata,
  isUpdatingMetadata,
  onTableDescriptionChange,
  onColumnDescriptionChange,
  onUpdate,
}: GenerateSemanticsResultProps) {
  const [searchText, setSearchText] = useState("");
  const searchInput = useRef<InputRef>(null);
  const fieldsDataSource = metadata.columns
    ?.filter((column) =>
      searchText === "" ? true : column.columnName.includes(searchText)
    )
    .map((column) => {
      return {
        key: column.columnName,
        name: column.columnName,
        dataType: column.dataType,
        columnDescription: column.columnDescription,
        sampleValues: column.sampleValues,
      };
    });

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"]
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };
  const [selectedRows, setSelectedRows] = useState<Key[]>([]);

  useEffect(() => {
    if (metadata.columns) {
      setSelectedRows(metadata.columns.map((column) => column.columnName));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fieldColumns: unknown[] = [
    {
      title: "Column Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      ellipsis: true,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
        close,
      }: FilterDropdownProps) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            ref={searchInput}
            placeholder={`Search Column Name`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => handleSearch(selectedKeys as string[], confirm)}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => handleSearch(selectedKeys as string[], confirm)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => clearFilters && handleReset(clearFilters)}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>

            <Button
              type="link"
              size="small"
              onClick={() => {
                close();
              }}
            >
              close
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
      ),
      render: (text: string) => (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ),
    },
    {
      title: "Description",
      dataIndex: "columnDescription",
      key: "columnDescription",
      ellipsis: true,
      render: (text: string, data: { key: string }) => (
        <Input
          placeholder="Column Description"
          value={text}
          disabled={isUpdatingMetadata}
          onChange={(e) => {
            onColumnDescriptionChange(data.key, e.target.value);
          }}
          id={text}
        />
      ),
    },
    {
      title: "Sample Values",
      dataIndex: "sampleValues",
      key: "sampleValues",
      ellipsis: true,
      render: (text: string) => (
        <Input
          placeholder="Sample Values"
          readOnly={true}
          value={text}
          disabled={isUpdatingMetadata}
          id={text}
        />
      ),
    },
  ];
  return (
    <Flex gap="large" vertical>
      <Divider style={{ margin: "2px 0" }} />
      <Flex gap="small" justify="space-between">
        <Flex gap="small" vertical>
          <div className="text-gray-500">Name</div>
          <Text
            ellipsis
            title={`${metadata.catalogQueryName}.${metadata.schemaName}.${metadata.tableName}`}
          >
            {`${metadata.catalogQueryName}.${metadata.schemaName}.${metadata.tableName}`}
          </Text>
        </Flex>
      </Flex>
      <Flex gap="small" vertical>
        <div className="text-gray-500">Description</div>
        <Input
          disabled={isUpdatingMetadata}
          placeholder="Table Description"
          value={metadata.tableDescription}
          onChange={(e) => {
            onTableDescriptionChange(e.target.value);
          }}
        />
      </Flex>
      <Flex gap="small" vertical>
        <div className="text-gray-500">Columns</div>
        <Table
          dataSource={fieldsDataSource}
          columns={fieldColumns as ColumnsType}
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: selectedRows,
            onChange: (selectedRowKeys) => {
              setSelectedRows(selectedRowKeys);
            },
            getCheckboxProps: (record) => ({
              name: record.name,
            }),
          }}
          pagination={{
            pageSize: 8,
            hideOnSinglePage: true,
            showSizeChanger: false,
            size: "small",
          }}
        />
      </Flex>
      <Divider style={{ margin: "2px 0" }} />
      <Flex justify="end">
        <Button
          type="primary"
          onClick={() => onUpdate(selectedRows)}
          loading={isUpdatingMetadata}
        >
          Update Metadata
        </Button>
      </Flex>
    </Flex>
  );
}
