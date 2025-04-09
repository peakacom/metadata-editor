import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "@xyflow/react/dist/style.css";
import {
  useGetCatalogRelationsQuery,
  useGetProjectMetadataQuery,
  useUpdateMetadataMutation,
} from "@/services/metadata";
import SchemaGraphLegend from "./SchemaGraphLegend";
import TableNode, { TableNodeData } from "./SchemaTableNode";
import { getGraphDataFromTables } from "./SchemaUtils";
import {
  Button,
  Drawer,
  GetProps,
  Input,
  Modal,
  notification,
  Result,
  Select,
  Space,
  Spin,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import {
  DBMetaDataContainer,
  DBMetaRelationship,
  Path,
} from "@/services/types";
import MetadataEditorForm from "../Metadata/MetadataEditForm";
import { cloneDeep } from "lodash";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSelectedCatalog,
  selectSelectedSchema,
  setSelectedCatalog,
  setSelectedSchema,
} from "@/services/schemaViewerSlice";
import { ID_SEPARATOR_CHAR } from "@/config/config";
import SchemaSelector from "../SchemaSelector/SchemaSelector";

const { Search } = Input;
type SearchProps = GetProps<typeof Input.Search>;

export interface NodeData {
  id: string;
  data: TableNodeData;
  position: {
    x: number;
    y: number;
  };
  type?: string;
}

export interface SchemaViewerProps {
  projectId: string;
}

export default function SchemaViewer({ projectId }: SchemaViewerProps) {
  const {
    data: tables,
    isLoading: isTablesLoading,
    error: tablesError,
  } = useGetProjectMetadataQuery({ projectId: projectId });

  const router = useRouter();

  const [updateMetadata] = useUpdateMetadataMutation();

  const miniMapNodeColor = "#111318";
  const miniMapMaskColor = "rgb(237, 237, 237, .8)";
  const reactFlowInstance = useReactFlow();

  const [api, contextHolder] = notification.useNotification();
  const [isEditAIUsageModalOpen, setIsEditAIUsageModalOpen] = useState(false);

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

  const nodeTypes = useMemo(
    () => ({
      table: TableNode,
    }),
    []
  );

  const [catalogs, setCatalogs] =
    useState<{ value: string; label: string }[]>();
  const [schemas, setSchemas] = useState<{ value: string; label: string }[]>();
  const selectedCatalog = useSelector(selectSelectedCatalog);
  const selectedSchema = useSelector(selectSelectedSchema);
  const [selectedCatalogForBulkEdit, setSelectedCatalogForBulkEdit] = useState<
    string | undefined
  >();
  const [selectedSchemaForBulkEdit, setSelectedSchemaForBulkEdit] = useState<
    string | undefined
  >();
  const dispatch = useDispatch();

  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<
    DBMetaDataContainer | undefined
  >();

  const { data: catalogRelations } = useGetCatalogRelationsQuery(
    {
      projectId: projectId,
      catalogId: selectedCatalog ? selectedCatalog : "",
    },
    { skip: !selectedCatalog }
  );

  const [selectedTableRelations, setSelectedTableRelations] =
    useState<DBMetaRelationship[]>();

  const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
    if (info?.source === "clear") {
      setSearchValue("");
    } else {
      setSearchValue(value);
    }
  };
  const [editingMetadata, setEditingMetadata] = useState(false);

  const refreshDrawer = useCallback(
    (
      projectId: string,
      catalogId: string,
      schemaName: string,
      tableName: string
    ) => {
      let table: DBMetaDataContainer | undefined = undefined;
      tables?.metadata.forEach((t) => {
        if (
          t.metadata.projectId === projectId &&
          t.metadata.catalogId === catalogId &&
          t.metadata.schemaName === schemaName &&
          t.metadata.tableName === tableName
        ) {
          table = t;
        }
      });

      setSelectedTable(table);
    },
    [tables]
  );

  useEffect(() => {
    if (selectedTable) {
      refreshDrawer(
        projectId,
        selectedTable.metadata.catalogId,
        selectedTable.metadata.schemaName,
        selectedTable.metadata.tableName
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables]);

  const onNodeClick = useCallback(
    (id: string) => {
      const idSplit = id.split(ID_SEPARATOR_CHAR);
      const projectId = idSplit[0];
      const catalogId = idSplit[1];
      const schemaName = idSplit[2];
      const tableName = idSplit[3];
      refreshDrawer(projectId, catalogId, schemaName, tableName);
      setOpenDrawer(true);
    },
    [refreshDrawer]
  );

  useEffect(() => {
    if (catalogRelations && selectedTable) {
      const relations: DBMetaRelationship[] = [];
      catalogRelations.relations.forEach((relation) => {
        if (
          (relation.projectId === projectId &&
            relation.sourceCatalogId === selectedTable.metadata.catalogId &&
            relation.sourceSchemaName === selectedTable.metadata.schemaName &&
            relation.sourceTableName === selectedTable.metadata.tableName) ||
          (relation.projectId === projectId &&
            relation.targetCatalogId === selectedTable.metadata.catalogId &&
            relation.targetSchemaName === selectedTable.metadata.schemaName &&
            relation.targetTableName === selectedTable.metadata.tableName)
        ) {
          const relationCopy = cloneDeep(relation);
          relations.push(relationCopy);
        }
      });
      setSelectedTableRelations(relations);
    }
  }, [catalogRelations, catalogs, projectId, selectedTable]);

  const [openDrawer, setOpenDrawer] = useState(false);

  const onCloseDrawer = () => {
    setOpenDrawer(false);
  };

  useEffect(() => {
    if (tables && selectedCatalog && selectedSchema) {
      const filteredTables = tables.metadata.filter(
        (table) =>
          table.metadata.catalogId === selectedCatalog &&
          table.metadata.schemaName === selectedSchema &&
          !table.metadata.isDynamicTable &&
          table.metadata.tableName.toLowerCase().includes(searchValue)
      );

      let relations: DBMetaRelationship[] = [];
      filteredTables.forEach((table) => {
        if (table.metadata.relations) {
          relations = [...relations, ...table.metadata.relations];
        }
      });

      getGraphDataFromTables(filteredTables, relations, onNodeClick).then(
        ({ nodes, edges }) => {
          reactFlowInstance.setNodes(nodes);
          reactFlowInstance.setEdges(edges);
          setTimeout(() => reactFlowInstance.fitView({}));
        }
      );
    }
    if (!selectedCatalog || !selectedSchema) {
      reactFlowInstance.setNodes([]);
      reactFlowInstance.setEdges([]);
    }
  }, [
    reactFlowInstance,
    tables,
    selectedCatalog,
    selectedSchema,
    searchValue,
    onNodeClick,
  ]);

  useEffect(() => {
    if (tables) {
      const uniqueCatalogs = new Map<
        string,
        { value: string; label: string }
      >();

      tables.metadata.forEach((table) => {
        if (!uniqueCatalogs.has(table.metadata.catalogId)) {
          uniqueCatalogs.set(table.metadata.catalogId, {
            value: table.metadata.catalogId,
            label: table.metadata.catalogDisplayName,
          });
        }
      });
      setCatalogs(Array.from(uniqueCatalogs.values()));
    }
  }, [tables]);

  useEffect(() => {
    if (tables) {
      const uniqueSchemas = new Map<string, { value: string; label: string }>();

      tables.metadata.forEach((table) => {
        if (
          table.metadata.catalogId === selectedCatalog &&
          !uniqueSchemas.has(table.metadata.schemaName)
        ) {
          uniqueSchemas.set(table.metadata.schemaName, {
            value: table.metadata.schemaName,
            label: table.metadata.schemaName,
          });
        }
      });
      setSchemas(Array.from(uniqueSchemas.values()));
    }
  }, [selectedCatalog, tables]);

  if (isTablesLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Spin indicator={<LoadingOutlined spin />} size="large" />
      </div>
    );
  }
  if (tablesError) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Result
          title="Could not get metadata. Check your API Key."
          extra={
            <Button
              type="primary"
              key="console"
              onClick={() => {
                router.push(Path.Settings);
              }}
            >
              Go Settings
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      {contextHolder}
      <div className="flex justify-center items-center gap-6 p-6 w-[900px]">
        <Select
          style={{ width: "30%" }}
          showSearch
          loading={isTablesLoading}
          placeholder="Select Catalog"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          value={selectedCatalog}
          options={catalogs?.sort((a, b) => a.label.localeCompare(b.label))}
          onChange={(value) => {
            dispatch(setSelectedCatalog(value));
            dispatch(setSelectedSchema(undefined));
          }}
        />
        <Select
          showSearch
          style={{ width: "30%" }}
          loading={isTablesLoading}
          placeholder="Select Schema"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          value={selectedSchema}
          onChange={(value) => {
            dispatch(setSelectedSchema(value));
          }}
          options={schemas?.sort((a, b) => a.label.localeCompare(b.label))}
        />
        <Search
          style={{ width: "30%" }}
          placeholder="Search Tables"
          allowClear
          onSearch={onSearch}
        />
        <Button
          type="primary"
          onClick={() => {
            setIsEditAIUsageModalOpen(true);
          }}
        >
          Configure AI Access in Bulk
        </Button>
      </div>
      <div className="w-full h-full">
        <ReactFlow
          id="SchemaViewer"
          defaultNodes={[]}
          defaultEdges={[]}
          fitView
          proOptions={{ hideAttribution: true }}
          nodeTypes={nodeTypes}
          onlyRenderVisibleElements
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: true,
            deletable: false,
          }}
          minZoom={0.8}
          maxZoom={1.8}
        >
          <Background
            gap={16}
            className="[&>*]:stroke-foreground-muted opacity-[25%]"
            variant={BackgroundVariant.Dots}
            color={"inherit"}
          />
          <Controls position="top-left" />
          <SchemaGraphLegend />
          <MiniMap
            pannable
            zoomable
            nodeColor={miniMapNodeColor}
            maskColor={miniMapMaskColor}
            className="border rounded-md shadow-sm"
          />
        </ReactFlow>
      </div>
      <Drawer
        title="Edit Metadata"
        width={900}
        onClose={onCloseDrawer}
        open={openDrawer}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
        extra={
          <Space>
            <Button onClick={onCloseDrawer}>Cancel</Button>
            <Button
              loading={editingMetadata}
              onClick={async () => {
                if (selectedTable) {
                  try {
                    setEditingMetadata(true);
                    await updateMetadata({
                      projectId: projectId,
                      catalogId: selectedTable.metadata.catalogId,
                      schemaName: selectedTable.metadata.schemaName,
                      tableName: selectedTable.metadata.tableName,
                      metadata: {
                        tableDescription:
                          selectedTable.metadata.tableDescription,
                        columns: selectedTable.metadata.columns,
                        useWithAI: selectedTable.metadata.useWithAI,
                      },
                    }).unwrap();

                    openNotification(
                      true,
                      "Success",
                      "Table metadata has been edited successfully."
                    )();

                    onCloseDrawer();
                  } catch (error) {
                    openNotification(
                      true,
                      "Fail",
                      (error as { data: { message: string } }).data.message,
                      false
                    )();
                  } finally {
                    setEditingMetadata(false);
                  }
                }
              }}
              type="primary"
            >
              Edit
            </Button>
          </Space>
        }
      >
        <MetadataEditorForm
          table={selectedTable}
          relations={selectedTableRelations}
          onTableDescriptionChange={(description: string) => {
            if (selectedTable) {
              setSelectedTable({
                ...selectedTable,
                metadata: {
                  ...selectedTable.metadata,
                  tableDescription: description,
                },
              });
            }
          }}
          onPrimaryKeyChange={(primaryKey: string) => {
            const clonedSelectedTable = cloneDeep(selectedTable);
            clonedSelectedTable?.metadata.columns?.forEach((column) => {
              column.isPrimary = column.columnName === primaryKey;
              column.isNotNull = column.columnName === primaryKey;
            });
            setSelectedTable(clonedSelectedTable);
          }}
          onColumnDescriptionChange={(
            columnName: string,
            description: string
          ) => {
            const clonedSelectedTable = cloneDeep(selectedTable);
            clonedSelectedTable?.metadata.columns?.forEach((column) => {
              if (column.columnName === columnName) {
                column.columnDescription = description;
              }
            });
            setSelectedTable(clonedSelectedTable);
          }}
          onRelationDelete={(relationId: string) => {
            const clonedSelectedTable = cloneDeep(selectedTableRelations);
            clonedSelectedTable?.forEach((relation, index) => {
              if (relation.id === relationId) {
                clonedSelectedTable?.splice(index, 1);
              }
            });
            setSelectedTableRelations(clonedSelectedTable);
          }}
          onRelationAdd={(relation: DBMetaRelationship) => {
            const clonedSelectedTable = cloneDeep(selectedTableRelations);
            clonedSelectedTable?.push(relation);
            setSelectedTableRelations(clonedSelectedTable);
          }}
          onUseWithAIChanged={(useWithAI: boolean) => {
            const clonedSelectedTable = cloneDeep(selectedTable);
            if (!clonedSelectedTable?.metadata) {
              return;
            }
            clonedSelectedTable.metadata.useWithAI = useWithAI;
            setSelectedTable(clonedSelectedTable);
          }}
        />
      </Drawer>
      <Modal
        title={"Enable/Disable AI Access in Bulk"}
        open={isEditAIUsageModalOpen}
        centered
        width={450}
        destroyOnClose
        onCancel={async () => {
          setIsEditAIUsageModalOpen(false);
          setSelectedCatalogForBulkEdit(undefined);
          setSelectedSchemaForBulkEdit(undefined);
        }}
        cancelText={"Disable"}
        cancelButtonProps={{
          color: "danger",
          variant: "solid",
          onClick: async () => {
            await bulkEditAIUsage(false);
          },
          loading: editingMetadata,
        }}
        okText={"Enable"}
        okType={"primary"}
        onOk={async () => {
          await bulkEditAIUsage(true);
        }}
        okButtonProps={{
          loading: editingMetadata,
        }}
      >
        <div className="p-6">
          <SchemaSelector
            projectId={projectId}
            onCatalogSelected={(catalogId) => {
              setSelectedCatalogForBulkEdit(catalogId);
            }}
            onSchemaSelected={(catalogId, schemaName) => {
              setSelectedCatalogForBulkEdit(catalogId);
              setSelectedSchemaForBulkEdit(schemaName);
            }}
          />
        </div>
      </Modal>
    </div>
  );

  async function bulkEditAIUsage(useWithAI: boolean) {
    if (!selectedCatalogForBulkEdit) {
      openNotification(
        true,
        "Invalid Selection",
        "You need to select at least one catalog or schema for bulk edit.",
        false
      )();
      return;
    }

    try {
      setEditingMetadata(true);
      if (selectedCatalogForBulkEdit && !selectedSchemaForBulkEdit) {
        await updateMetadata({
          projectId: projectId,
          catalogId: selectedCatalogForBulkEdit,
          metadata: {
            useWithAI,
          },
        }).unwrap();
      } else if (selectedCatalogForBulkEdit && selectedSchemaForBulkEdit) {
        await updateMetadata({
          projectId: projectId,
          catalogId: selectedCatalogForBulkEdit,
          schemaName: selectedSchemaForBulkEdit,
          metadata: {
            useWithAI,
          },
        }).unwrap();
      }
      openNotification(
        true,
        "Success",
        "AI usage has been edited successfully."
      )();
    } catch (error) {
      openNotification(
        true,
        "Fail",
        (error as { data: { message: string } }).data.message,
        false
      )();
    } finally {
      setIsEditAIUsageModalOpen(false);
      setSelectedCatalogForBulkEdit(undefined);
      setSelectedSchemaForBulkEdit(undefined);
      setEditingMetadata(false);
    }
  }
}
