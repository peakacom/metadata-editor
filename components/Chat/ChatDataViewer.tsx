import { ChatHistoryQueryData } from "@/services/ai";
import { Table } from "antd";
import { useMemo } from "react";

export interface ChatDataViewerProps {
  data?: ChatHistoryQueryData[][];
}

export default function ChatDataViewer({ data }: ChatDataViewerProps) {
  const transformedData = useMemo(() => {
    if (!data || data.length === 0) return { dataSource: [], columns: [] };
    if (Array.isArray(data[0])) {
      const columns = data[0].map((item) => ({
        title: item.name.charAt(0).toUpperCase() + item.name.slice(1),
        dataIndex: item.name,
        key: item.name,
      }));

      const dataSource = data.map((row, index) => {
        const rowData: { [key: string]: unknown } = { key: index + 1 };
        row.forEach((item) => {
          rowData[item.name] = item.value;
        });
        return rowData;
      });

      return { dataSource, columns };
    } else {
      const columns = Object.keys(data[0]).map((key) => ({
        title: key.charAt(0).toUpperCase() + key.slice(1),
        dataIndex: key,
        key,
      }));

      const dataSource = data.map((row, index) => ({
        key: index + 1,
        ...row,
      }));

      return { dataSource, columns };
    }
  }, [data]);

  return (
    <Table
      size="small"
      pagination={{ pageSize: 5, hideOnSinglePage: true, size: "small" }}
      dataSource={transformedData.dataSource}
      columns={transformedData.columns}
    />
  );
}
