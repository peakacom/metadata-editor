import { useGetProjectMetadataQuery } from "@/services/metadata";
import { Select } from "antd";
import { useEffect, useState } from "react";

export interface SchemaSelectorProps {
  projectId: string;
  onSchemaSelected?: (catalogId: string, schemaName: string) => void;
  onCatalogSelected?: (catalogId: string) => void;
}

export default function SchemaSelector({
  projectId,
  onCatalogSelected,
  onSchemaSelected,
}: SchemaSelectorProps) {
  const {
    data: tables,
    isLoading: isTablesLoading,
    error: tablesError,
  } = useGetProjectMetadataQuery({ projectId: projectId });

  const [catalogs, setCatalogs] =
    useState<{ value: string; label: string }[]>();
  const [schemas, setSchemas] = useState<{ value: string; label: string }[]>();

  const [selectedCatalog, setSelectedCatalog] = useState<string | undefined>();
  const [selectedSchema, setSelectedSchema] = useState<string | undefined>();

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

  return (
    <>
      {tablesError ? (
        <div>Could not load tables</div>
      ) : (
        <div className="flex justify-between items-center gap-6 ">
          <Select
            showSearch
            className="w-full"
            loading={isTablesLoading}
            placeholder="Select Catalog"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            value={selectedCatalog}
            options={catalogs?.sort((a, b) => a.label.localeCompare(b.label))}
            onChange={(value) => {
              onCatalogSelected?.(value);
              setSelectedCatalog(value);
              setSelectedSchema(undefined);
            }}
          />
          <Select
            showSearch
            className="w-full"
            loading={isTablesLoading}
            placeholder="Select Schema"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            value={selectedSchema}
            onChange={(value) => {
              onSchemaSelected?.(selectedCatalog!, value);
              setSelectedSchema(value);
            }}
            options={schemas?.sort((a, b) => a.label.localeCompare(b.label))}
          />
        </div>
      )}
    </>
  );
}
