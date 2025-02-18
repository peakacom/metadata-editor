import {
  useAddRelationMutation,
  useCreateSemanticsMutation,
  useDeleteRelationMutation,
  useGenerateCategoricalColumnMutation,
  useUpdateMetadataMutation,
} from "@/services/metadata";
import {
  DBMetaData,
  DBMetaDataColumn,
  DBMetaDataContainer,
  DBMetaRelationship,
} from "@/services/types";
import {
  Button,
  Flex,
  Input,
  InputRef,
  Modal,
  notification,
  Select,
  Space,
  Switch,
  Table,
  Typography,
} from "antd";
import { Key, useEffect, useMemo, useRef, useState } from "react";
import AddRelationForm, { FormValues } from "./AddRelationForm";
import { getRelationType } from "../utils/utils";
import {
  MinusCircleOutlined,
  OpenAIOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
const { Text } = Typography;
import type { ColumnsType, FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import LineageViewer from "../LineageViewer/LineageViewer";
import GenerateSemanticsForm from "../Semantics/GenerateSemanticsForm";
import GenerateSemanticsResult from "../Semantics/GenerateSemanticsResult";
import { cloneDeep } from "lodash";

export interface MetadataEditorFormProps {
  table?: DBMetaDataContainer;
  relations?: DBMetaRelationship[];
  selectedCatalog?: string;
  selectedSchema?: string;
  onTableDescriptionChange: (description: string) => void;
  onPrimaryKeyChange: (primaryKey: string) => void;
  onColumnDescriptionChange: (column: string, description: string) => void;
  onRelationDelete: (relationId: string) => void;
  onRelationAdd: (relation: DBMetaRelationship) => void;
  onUseWithAIChanged: (useWithAI: boolean) => void;
}

export default function MetadataEditorForm({
  table,
  relations,
  selectedCatalog,
  selectedSchema,
  onTableDescriptionChange,
  onPrimaryKeyChange,
  onColumnDescriptionChange,
  onRelationDelete,
  onRelationAdd,
  onUseWithAIChanged,
}: MetadataEditorFormProps) {
  const [deleteRelations] = useDeleteRelationMutation();
  const [addRelation] = useAddRelationMutation();
  const [isDeletingRelation, setIsDeletingRelations] = useState<
    string | undefined
  >(undefined);

  const [isAddingRelation, setIsAddingRelation] = useState(false);

  const [isAddRelationModalOpen, setIsAddRelationModalOpen] =
    useState<boolean>(false);
  const [isColumnLineageModalOpen, setIsColumnLineageModalOpen] =
    useState<boolean>(false);
  const [isGenerateSemanticsModalOpen, setIsGenerateSemanticsModalOpen] =
    useState<boolean>(false);
  const [isGeneratingSemantics, setIsGeneratingSemantics] =
    useState<boolean>(false);
  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState<boolean>(false);
  const [semanticMetadata, setSemanticMetadata] = useState<DBMetaData | null>(
    null
  );
  const [api, contextHolder] = notification.useNotification();
  const [createSemantics] = useCreateSemanticsMutation();
  const [updateMetadata] = useUpdateMetadataMutation();

  //Categorical Column
  const [isCategoricalColumnModalOpen, setIsCategoricalColumnModalOpen] =
    useState<boolean>(false);

  const [categoricalColumnLimit, setCategoricalColumnLimit] =
    useState<number>(10);

  const [
    generateCategoricalColumn,
    { isLoading: isGeneratingCategoricalColumn },
  ] = useGenerateCategoricalColumnMutation();

  const [generatingCategoricalColumn, setGeneratingCategoricalColumn] =
    useState<
      | {
          key: string;
          name: string;
          dataType: string;
          columnDescription: string;
          isCategorical: boolean;
        }
      | undefined
    >(undefined);

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

  const [searchText, setSearchText] = useState("");
  const searchInput = useRef<InputRef>(null);
  const [selectedColumn, setSelectedColumn] = useState<
    DBMetaDataColumn | undefined
  >(undefined);

  const fieldsDataSource = table?.metadata?.columns
    ?.filter((column) =>
      searchText === "" ? true : column.columnName.includes(searchText)
    )
    .map((column) => {
      return {
        key: column.columnName,
        name: column.columnName,
        dataType: column.dataType,
        columnDescription: column.columnDescription,
        isCategorical: column.isCategorical,
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

  const fieldColumns: unknown[] = [
    {
      title: "Column Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      width: 180,
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
      title: "Data Type",
      dataIndex: "dataType",
      key: "dataType",
      ellipsis: true,
      width: 120,
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
          onChange={(e) => {
            onColumnDescriptionChange(data.key, e.target.value);
          }}
          id={text}
        />
      ),
    },
    {
      title: "Categorical",
      key: "isCategorical",
      width: 110,
      render: (_: unknown, record: unknown) => {
        const column = record as {
          key: string;
          name: string;
          dataType: string;
          columnDescription: string;
          isCategorical: boolean;
        };

        return (
          <div className="flex justify-center items-center">
            <Space size="middle">
              <Button
                color="primary"
                variant="solid"
                loading={
                  generatingCategoricalColumn?.key ===
                  (record as { key: string }).key
                }
                disabled={
                  generatingCategoricalColumn?.key === undefined
                    ? false
                    : generatingCategoricalColumn?.key !==
                      (record as { key: string }).key
                }
                onClick={async () => {
                  setGeneratingCategoricalColumn(column);
                  setIsCategoricalColumnModalOpen(true);
                }}
              >
                {column.isCategorical ? (
                  <MinusCircleOutlined />
                ) : (
                  <PlusCircleOutlined />
                )}
              </Button>
            </Space>
          </div>
        );
      },
    },
  ];

  if (
    table?.metadata.catalogId === "2" ||
    table?.metadata.catalogType === "SEMANTIC"
  ) {
    fieldColumns.push({
      title: "Lineage",
      key: "lineage",
      width: 90,
      render: (_: unknown, record: unknown) => {
        return (
          <Space size="middle">
            <Button
              icon={<ShareAltOutlined />}
              variant="solid"
              loading={isDeletingRelation === (record as { key: string }).key}
              disabled={
                isDeletingRelation === undefined
                  ? false
                  : isDeletingRelation !== (record as { key: string }).key
              }
              onClick={() => {
                if (table) {
                  const column = table.metadata.columns?.find(
                    (column) =>
                      column.columnName === (record as { key: string }).key
                  );
                  setSelectedColumn(column);
                  setIsColumnLineageModalOpen(true);
                }
              }}
            />
          </Space>
        );
      },
    });
  }

  const relationsDataSource = relations?.map((relation) => {
    return {
      key: relation.id,
      projectId: relation.projectId,
      source: `${relation.sourceCatalogName}.${relation.sourceSchemaName}.${relation.sourceTableName}.${relation.sourceColumnName}`,
      target: `${relation.targetCatalogName}.${relation.targetSchemaName}.${relation.targetTableName}.${relation.targetColumnName}`,
      sourceCatalogId: relation.sourceCatalogId,
      targetCatalogId: relation.targetCatalogId,
      type: relation.type,
      action: "",
    };
  });

  const relationsColumns = [
    {
      title: "From",
      dataIndex: "source",
      key: "source",
      ellipsis: true,
    },
    {
      title: "To",
      dataIndex: "target",
      key: "target",
      ellipsis: true,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      ellipsis: true,
    },
    {
      dataIndex: "projectId",
      key: "projectId",
      hidden: true,
    },
    {
      dataIndex: "sourceCatalogId",
      key: "sourceCatalogId",
      hidden: true,
    },
    {
      dataIndex: "targetCatalogId",
      key: "targetCatalogId",
      hidden: true,
    },
    {
      title: "Action",
      key: "action",
      width: 90,
      fixed: "right",
      render: (_: unknown, record: unknown) => {
        return (
          <div className="flex justify-center items-center">
            <Space size="middle">
              <Button
                color="danger"
                variant="solid"
                loading={isDeletingRelation === (record as { key: string }).key}
                disabled={
                  isDeletingRelation === undefined
                    ? false
                    : isDeletingRelation !== (record as { key: string }).key
                }
                onClick={async () => {
                  const relation = record as {
                    key: string;
                    projectId: string;
                    source: string;
                    sourceCatalogId: string;
                  };
                  setIsDeletingRelations(relation.key);
                  try {
                    await deleteRelations({
                      projectId: relation.projectId,
                      catalogId: relation.sourceCatalogId,
                      schemaName: relation.source.split(".")[1],
                      tableName: relation.source.split(".")[2],
                      relationId: relation.key,
                    }).unwrap();

                    openNotification(
                      true,
                      "Success",
                      "Relation has been deleted successfully."
                    )();
                  } catch (error) {
                    openNotification(
                      true,
                      "Fail",
                      (error as { data: { message: string } }).data.message,
                      false
                    )();
                  }

                  onRelationDelete(relation.key);
                  setIsDeletingRelations(undefined);
                }}
              >
                Delete
              </Button>
            </Space>
          </div>
        );
      },
    },
  ];

  const tableName = `${table?.metadata.catalogQueryName}.${table?.metadata.schemaName}.${table?.metadata.tableName}`;

  const primaryKeysOptions = useMemo(() => {
    if (!table?.metadata.columns) {
      return [];
    }
    return table.metadata.columns.map((column) => {
      return {
        value: column.columnName,
        label: column.columnName,
      };
    });
  }, [table?.metadata.columns]);

  const [selectedPrimaryKey, setSelectedPrimaryKey] = useState<
    string | undefined
  >();

  useEffect(() => {
    const primaryKey = table?.metadata.columns?.find(
      (column) => column.isPrimary
    );
    if (primaryKey) {
      setSelectedPrimaryKey(primaryKey.columnName);
    } else {
      setSelectedPrimaryKey(undefined);
    }
  }, [table?.metadata.columns]);

  return (
    <>
      {contextHolder}

      <Flex gap="middle" vertical>
        <Flex gap="small" justify="space-between">
          <Flex gap="small" vertical>
            <div className="text-gray-500">Name</div>
            <Text ellipsis title={tableName}>
              {tableName}
            </Text>
          </Flex>
          <Flex gap="middle" justify="center" align="center">
            <Button
              icon={<OpenAIOutlined />}
              onClick={() => {
                setIsGenerateSemanticsModalOpen(true);
              }}
            >
              Generate Semantics
            </Button>
            <Flex gap="small" vertical>
              <div className="text-gray-500">Use with AI</div>
              <Switch
                className="w-8"
                style={{ margin: "auto" }}
                value={table?.metadata.useWithAI}
                onChange={onUseWithAIChanged}
              />
            </Flex>
          </Flex>
        </Flex>

        <Flex gap="small" vertical>
          <div className="text-gray-500">Description</div>
          <Input
            placeholder="Table Description"
            value={table?.metadata.tableDescription}
            onChange={(e) => onTableDescriptionChange(e.target.value)}
          />
        </Flex>
        <Flex gap="small" vertical>
          <div className="text-gray-500">Primary Key</div>
          <Select
            showSearch
            placeholder="Select Primary Key"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            value={selectedPrimaryKey}
            options={primaryKeysOptions}
            onChange={(value) => {
              onPrimaryKeyChange(value);
            }}
          />
        </Flex>
        <Flex gap="small" vertical>
          <div className="text-gray-500">Columns</div>
          <Table
            dataSource={fieldsDataSource}
            columns={fieldColumns as ColumnsType}
            pagination={{
              pageSize: 7,
              hideOnSinglePage: true,
              showSizeChanger: false,
              size: "small",
            }}
          />
        </Flex>
        <Flex gap="large" vertical>
          <Flex gap="large" justify="space-between">
            <div className="text-gray-500">Relations</div>
            <Button
              type="primary"
              onClick={() => {
                setIsAddRelationModalOpen(true);
              }}
            >
              Add Relation
            </Button>
          </Flex>
          <Table
            dataSource={relationsDataSource}
            columns={relationsColumns as ColumnsType}
            pagination={{ pageSize: 2, hideOnSinglePage: true, size: "small" }}
          />
        </Flex>
        <Modal
          title="Add Relation"
          open={isAddRelationModalOpen}
          width={750}
          centered
          maskClosable={false}
          destroyOnClose
          footer={null}
          onCancel={() => {
            setIsAddRelationModalOpen(false);
          }}
        >
          <AddRelationForm
            projectId={table?.metadata?.projectId}
            selectedCatalog={selectedCatalog}
            selectedSchema={selectedSchema}
            initialSelectedModel={`${table?.metadata.projectId}.${table?.metadata.catalogId}.${table?.metadata.schemaName}.${table?.metadata.tableName}`}
            onSubmit={async (values: FormValues) => {
              const fromSplit = values.from.split(".");
              const toSplit = values.to.split(".");
              setIsAddingRelation(true);
              try {
                const relation = await addRelation({
                  projectId: table?.metadata.projectId
                    ? table?.metadata.projectId
                    : "",
                  sourceCatalogId: fromSplit[1],
                  sourceSchemaName: fromSplit[2],
                  sourceTableName: fromSplit[3],
                  sourceColumnName: fromSplit[4],
                  targetCatalogId: toSplit[1],
                  targetSchemaName: toSplit[2],
                  targetTableName: toSplit[3],
                  targetColumnName: toSplit[4],
                  type: getRelationType(values.type),
                }).unwrap();

                onRelationAdd(relation);
                setIsAddingRelation(false);
                setIsAddRelationModalOpen(false);

                openNotification(
                  true,
                  "Success",
                  "Relation has been added successfully."
                )();
              } catch (error) {
                setIsAddingRelation(false);
                openNotification(
                  true,
                  "Fail",
                  (error as { data: { message: string } }).data.message,
                  false
                )();
              }
            }}
            isAddingRelation={isAddingRelation}
          />
        </Modal>

        <Modal
          title="Column Lineage"
          open={isColumnLineageModalOpen}
          width={
            selectedColumn &&
            selectedColumn.lineage &&
            selectedColumn?.lineage?.length > 4
              ? 3000
              : 1000
          }
          centered
          maskClosable={false}
          destroyOnClose
          footer={null}
          onCancel={() => {
            setIsColumnLineageModalOpen(false);
          }}
        >
          <LineageViewer data={selectedColumn?.lineage} />
        </Modal>

        <Modal
          title="Generate Semantics"
          open={isGenerateSemanticsModalOpen}
          width={1200}
          centered
          maskClosable={false}
          destroyOnClose
          footer={null}
          onCancel={() => {
            setIsGenerateSemanticsModalOpen(false);
            setSemanticMetadata(null);
          }}
          closable={!isGeneratingSemantics && !isUpdatingMetadata}
        >
          {semanticMetadata ? (
            <GenerateSemanticsResult
              metadata={semanticMetadata}
              onTableDescriptionChange={(description) => {
                if (semanticMetadata) {
                  setSemanticMetadata({
                    ...semanticMetadata,
                    tableDescription: description,
                  });
                }
              }}
              onColumnDescriptionChange={(
                columnName: string,
                description: string
              ) => {
                const clonedSemanticMetadata = cloneDeep(semanticMetadata);
                clonedSemanticMetadata.columns?.forEach((column) => {
                  if (column.columnName === columnName) {
                    column.columnDescription = description;
                  }
                });
                setSemanticMetadata(clonedSemanticMetadata);
              }}
              onUpdate={async (selectedRowKeys: Key[]) => {
                setIsUpdatingMetadata(true);
                try {
                  const clonedTable = cloneDeep(table);
                  if (!clonedTable) {
                    return;
                  }
                  clonedTable.metadata.tableDescription =
                    semanticMetadata.tableDescription;

                  for (const key of selectedRowKeys) {
                    clonedTable.metadata.columns?.forEach((column) => {
                      if (column.columnName === key) {
                        const semanticColumnDescription =
                          semanticMetadata.columns?.find(
                            (column) => column.columnName === key
                          )?.columnDescription;
                        if (semanticColumnDescription) {
                          column.columnDescription = semanticColumnDescription;
                        }
                      }
                    });
                  }

                  await updateMetadata({
                    projectId: clonedTable.metadata.projectId,
                    catalogId: clonedTable.metadata.catalogId,
                    schemaName: clonedTable.metadata.schemaName,
                    tableName: clonedTable.metadata.tableName,
                    metadata: {
                      tableDescription: clonedTable.metadata.tableDescription,
                      columns: clonedTable.metadata.columns,
                      useWithAI: clonedTable.metadata.useWithAI,
                    },
                  }).unwrap();

                  openNotification(
                    true,
                    "Success",
                    "Table metadata has been edited successfully."
                  )();
                } catch (error) {
                  openNotification(
                    true,
                    "Fail",
                    (error as { data: { message: string } }).data.message,
                    false
                  )();
                } finally {
                  setSemanticMetadata(null);
                  setIsGenerateSemanticsModalOpen(false);
                  setIsUpdatingMetadata(false);
                }
              }}
              isUpdatingMetadata={isUpdatingMetadata}
            />
          ) : (
            <GenerateSemanticsForm
              isGeneratingSemantics={isGeneratingSemantics}
              onSubmit={async (values) => {
                if (table) {
                  setIsGeneratingSemantics(true);
                  try {
                    const response = await createSemantics({
                      projectId: table.metadata.projectId,
                      catalogId: table.metadata.catalogId,
                      schemaName: table.metadata.schemaName,
                      tableName: table.metadata.tableName,
                      initialPrompt: values.initialPrompt,
                      limit: Number.parseInt(values.limit),
                    }).unwrap();

                    setSemanticMetadata(response.metadata);
                  } catch (error) {
                    openNotification(
                      true,
                      "Fail",
                      (error as { data: { message: string } }).data.message,
                      false
                    )();
                  } finally {
                    setIsGeneratingSemantics(false);
                  }
                }
              }}
            />
          )}
        </Modal>
        <Modal
          title={
            generatingCategoricalColumn?.isCategorical
              ? "Remove Categorical Column Values?  "
              : "Generate Categorical Column Values?"
          }
          open={isCategoricalColumnModalOpen}
          centered
          width={600}
          destroyOnClose
          onCancel={() => {
            setIsCategoricalColumnModalOpen(false);
            setGeneratingCategoricalColumn(undefined);
          }}
          okText={
            generatingCategoricalColumn?.isCategorical ? "Remove" : "Generate"
          }
          okType="primary"
          okButtonProps={{ loading: isGeneratingCategoricalColumn }}
          onOk={async () => {
            if (!table || !generatingCategoricalColumn) {
              return;
            }
            if (generatingCategoricalColumn.isCategorical) {
              setIsUpdatingMetadata(true);
              try {
                const clonedTable = cloneDeep(table);
                if (!clonedTable) {
                  return;
                }
                const column = clonedTable.metadata.columns?.find(
                  (column) =>
                    column.columnName === generatingCategoricalColumn.name
                );

                if (!column) {
                  return;
                }

                column.isCategorical = false;
                column.categoricalValues = [];

                await updateMetadata({
                  projectId: clonedTable.metadata.projectId,
                  catalogId: clonedTable.metadata.catalogId,
                  schemaName: clonedTable.metadata.schemaName,
                  tableName: clonedTable.metadata.tableName,
                  metadata: {
                    tableDescription: clonedTable.metadata.tableDescription,
                    columns: clonedTable.metadata.columns,
                    useWithAI: clonedTable.metadata.useWithAI,
                  },
                }).unwrap();

                openNotification(
                  true,
                  "Success",
                  "Table metadata has been edited successfully."
                )();
              } catch (error) {
                openNotification(
                  true,
                  "Fail",
                  (error as { data: { message: string } }).data.message,
                  false
                )();
              } finally {
                setIsUpdatingMetadata(false);
                setIsCategoricalColumnModalOpen(false);
                setGeneratingCategoricalColumn(undefined);
              }
            } else {
              try {
                await generateCategoricalColumn({
                  projectId: table.metadata.projectId
                    ? table.metadata.projectId
                    : "",
                  catalogId: table.metadata.catalogId,
                  schemaName: table.metadata.schemaName,
                  tableName: table.metadata.tableName,
                  columnName: generatingCategoricalColumn.key,
                  limit: categoricalColumnLimit,
                }).unwrap();

                openNotification(
                  true,
                  "Success",
                  "Successfully generated categorical column values."
                )();
              } catch {
                openNotification(
                  true,
                  "Error",
                  "Could not generate categorical column values.",
                  false
                )();
              } finally {
                setIsCategoricalColumnModalOpen(false);
                setGeneratingCategoricalColumn(undefined);
              }
            }
          }}
        >
          {generatingCategoricalColumn?.isCategorical ? (
            ""
          ) : (
            <div className="flex flex-col justify-center items-start gap-3">
              <div className="text-gray-500">Limit Value</div>
              <Input
                placeholder="Limit"
                type="number"
                value={categoricalColumnLimit}
                onChange={(e) => {
                  setCategoricalColumnLimit(Number.parseInt(e.target.value));
                }}
              />
              <div className="text-gray-500">
                {`SELECT DISTINCT ${generatingCategoricalColumn?.name} FROM ${table?.metadata.catalogQueryName}.${table?.metadata.schemaName}.${table?.metadata.tableName} LIMIT ${categoricalColumnLimit}`}
              </div>
            </div>
          )}
        </Modal>
      </Flex>
    </>
  );
}
