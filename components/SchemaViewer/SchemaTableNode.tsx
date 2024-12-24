import { Handle, Position } from "@xyflow/react";
import { cn } from "../utils/utils";
import { DiamondIcon, Fingerprint, Key, Table2, Edit } from "lucide-react";
import { Typography } from "antd";

export const TABLE_NODE_WIDTH = 320;
export const TABLE_NODE_ROW_HEIGHT = 40;

const { Text } = Typography;

export type TableNodeData = {
  id: string;
  name: string;
  hasRelations: boolean;
  onClick: (id: string) => void;
  useWithAI: boolean;
  columns: {
    id: string;
    name: string;
    isPrimary: boolean;
    isUnique: boolean;
    isNullable: boolean;
    dataType: string;
  }[];
};

export default function TableNode({ data }: { data: TableNodeData }) {
  const hiddenNodeConnector =
    "!h-px !w-px !min-w-0 !min-h-0 !cursor-grab !border-0 !opacity-0";

  const itemHeight = "h-[22px]";
  const filteredColumns = data.columns
    .filter((column) => !column.name.startsWith("_q_"))
    .sort((c1) => (c1.isPrimary ? -1 : 1));
  const slice = data.hasRelations ? data.columns.length : 10;
  const headerColor =
    data.useWithAI === true ? " bg-purple-400" : " bg-slate-400";
  return (
    <>
      <div
        className="border-[0.5px] overflow-hidden rounded-[4px] shadow-sm"
        onClick={() => {
          data.onClick(data.id);
        }}
        style={{ width: TABLE_NODE_WIDTH / 2 }}
      >
        <header
          className={cn(
            "text-[0.55rem] pl-2 pr-1 text-default flex items-center justify-between",
            headerColor,
            itemHeight
          )}
        >
          <div className="flex gap-x-1 items-center ">
            <Table2 strokeWidth={1} size={12} className="text-light" />
            <Text ellipsis title={data.name} className="w-28">
              {data.name}
            </Text>
            <Edit
              strokeWidth={1}
              size={12}
              className="text-light cursor-pointer"
            />
          </div>
        </header>

        {filteredColumns.slice(0, slice).map((column) => (
          <div
            className={cn(
              "text-[8px] leading-5 relative flex flex-row justify-items-start",
              "bg-slate-100",
              "border-t",
              "border-t-[0.5px]",
              "hover:bg-slate-300 transition cursor-pointer",
              itemHeight
            )}
            key={column.id}
          >
            <div
              className={cn(
                "gap-[0.24rem] flex mx-2 align-middle items-center justify-start",
                column.isPrimary && "basis-1/5"
              )}
            >
              {column.isPrimary && (
                <Key
                  size={8}
                  strokeWidth={1}
                  className={cn("flex-shrink-0", "text-light")}
                />
              )}
              {column.isNullable && (
                <DiamondIcon
                  size={8}
                  strokeWidth={1}
                  className="flex-shrink-0 text-light"
                />
              )}
              {!column.isNullable && (
                <DiamondIcon
                  size={8}
                  strokeWidth={1}
                  fill="currentColor"
                  className="flex-shrink-0 text-light"
                />
              )}
              {column.isUnique && (
                <Fingerprint
                  size={8}
                  strokeWidth={1}
                  className="flex-shrink-0 text-light"
                />
              )}
            </div>
            <div className="flex w-full justify-between">
              <span className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[85px]">
                {column.name}
              </span>
              <span className="px-2 inline-flex justify-end font-mono text-lighter text-[0.35rem] max-w-[60px] text-ellipsis overflow-hidden">
                {column.dataType}
              </span>
            </div>
            <Handle
              type="target"
              id={column.id}
              position={Position.Left}
              className={cn(hiddenNodeConnector, "!left-0")}
            />
            <Handle
              type="source"
              id={column.id}
              position={Position.Right}
              className={cn(hiddenNodeConnector, "!right-0")}
            />
          </div>
        ))}
        {!data.hasRelations && filteredColumns.length > 10 && (
          <div
            className={cn(
              "leading-5 ",
              "bg-slate-100",
              "border-t",
              "border-t-[0.5px]",
              "hover:bg-slate-300 transition cursor-pointer",
              itemHeight,
              "flex justify-start items-center w-full text-[0.4rem] pl-3 italic text-slate-600"
            )}
          >
            and {data.columns.length - 10} more
          </div>
        )}
      </div>
    </>
  );
}
