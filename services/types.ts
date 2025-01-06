export interface DBMetaDataContainer {
  id: string;
  content: string;
  metadata: DBMetaData;
}

export interface DBMetaData {
  projectId: string;
  catalogId: string;
  catalogType: string;
  catalogSubType: string;
  catalogQueryName: string;
  catalogDisplayName: string;
  schemaName: string;
  tableName: string;
  tableDescription?: string;
  isCacheable: boolean;
  isDynamicTable: boolean;
  useWithAI: boolean;
  columns?: DBMetaDataColumn[];
  relations?: DBMetaRelationship[];
}

export interface DBMetaDataColumn {
  columnName: string;
  columnDescription: string;
  dataType: string;
  order: number;
  isNotNull?: boolean;
  isSystem?: boolean;
  isUnique?: boolean;
  isPrimary?: boolean;
  lineage?: DBMetaDataColumnLineage[];
}

export interface DBMetaDataColumnLineage {
  column: string;
  tables: string[];
  expression: string;
}

export interface DBMetaRelationship {
  id?: string;
  projectId: string;
  sourceCatalogName?: string;
  sourceCatalogId: string;
  sourceSchemaName: string;
  sourceTableName: string;
  sourceColumnName: string;
  targetCatalogId: string;
  targetCatalogName?: string;
  targetSchemaName: string;
  targetTableName: string;
  targetColumnName: string;
  type: RelationshipType;
}

export enum RelationshipType {
  ManyToOne = "MANY_TO_ONE",
  OneToMany = "ONE_TO_MANY",
  OneToOne = "ONE_TO_ONE",
}

export interface ProjectInfo {
  projectId: string;
  projectName: string;
  userId: string;
  email: string;
}

export enum Path {
  Chat = "/chat",
  Modeling = "/modeling",
  Settings = "/settings",
  GoldSQL = "/gold-sql",
}
