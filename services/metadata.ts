import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  DBMetaData,
  DBMetaDataColumn,
  DBMetaDataContainer,
  DBMetaRelationship,
} from "./types";
import { omit } from "lodash";
import { getBaseUrl } from "@/config/config";

import type { RootState } from "./store";

export const metadataApi = createApi({
  reducerPath: "metadataApi",
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers, { getState }) => {
      const apiKeyState = (getState() as RootState).apiKey;
      if (apiKeyState) {
        headers.set("authorization", `Bearer ${apiKeyState.selectedApiKey}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Relations", "Metadata", "GoldenSql"],
  endpoints: (builder) => ({
    getProjectMetadata: builder.query<
      GetProjectMetadataResult,
      GetProjectMetadataQueryArgs
    >({
      query: (args) => `metadata/${args.projectId}`,
      providesTags: ["Metadata"],
    }),
    getCatalogRelations: builder.query<
      GetCatalogRelationsResult,
      GetCatalogRelationsQueryArgs
    >({
      query: (args) => `metadata/${args.projectId}/relations/${args.catalogId}`,
      providesTags: ["Relations"],
    }),
    addRelation: builder.mutation<DBMetaRelationship, DBMetaRelationship>({
      query: (relation) => ({
        url: `metadata/${relation.projectId}/relations/${relation.sourceCatalogId}/${relation.sourceSchemaName}/${relation.sourceTableName}/${relation.sourceColumnName}`,
        method: "POST",
        body: omit(relation, [
          "sourceCatalogId",
          "sourceSchemaName",
          "sourceTableName",
          "sourceColumnName",
        ]),
      }),
      invalidatesTags: ["Relations", "Metadata"],
    }),
    updateRelation: builder.mutation<DBMetaRelationship, DBMetaRelationship>({
      query: (relation) => ({
        url: `metadata/${relation.projectId}/relations/${relation.sourceCatalogId}/${relation.sourceSchemaName}/${relation.sourceTableName}/${relation.id}`,
        method: "PUT",
        body: omit(relation, [
          "id",
          "projectId",
          "sourceCatalogId",
          "sourceSchemaName",
          "sourceTableName",
          "sourceColumnName",
          "targetCatalogId",
          "targetSchemaName",
          "targetTableName",
          "targetColumnName",
        ]),
      }),
      invalidatesTags: ["Relations"],
    }),
    deleteRelation: builder.mutation<
      DBMetaRelationship,
      DeleteRelationQueryArgs
    >({
      query: (args) => ({
        url: `metadata/${args.projectId}/relations/${args.catalogId}/${args.schemaName}/${args.tableName}/${args.relationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Relations", "Metadata"],
    }),
    updateMetadata: builder.mutation<DBMetaData, UpdateMetadataQueryArgs>({
      query: (args) => ({
        url: `metadata/${args.projectId}/${args.catalogId}/${args.schemaName}/${args.tableName}`,
        method: "PUT",
        body: args.metadata,
      }),
      invalidatesTags: ["Metadata"],
    }),
    createSemantics: builder.mutation<
      CreateSemanticsResult,
      CreateSemanticsQueryArgs
    >({
      query: (args) => ({
        url: `metadata/${args.projectId}/semantics/${args.catalogId}/${args.schemaName}/${args.tableName}`,
        method: "POST",
        body: { initialPrompt: args.initialPrompt, limit: args.limit },
      }),
    }),
    generateSampleQuestions: builder.query<
      GenerateSampleQuestionsResult,
      GenerateSampleQuestionsQueryArgs
    >({
      query: (args) => ({
        url: `metadata/${
          args.projectId
        }/questions/generate?question=${encodeURIComponent(args.question)}`,
        method: "GET",
      }),
    }),
    getGoldenSqls: builder.query<GetGoldenSqlsResult, GetGoldenSqlsQueryArgs>({
      query: (args) => `metadata/${args.projectId}/golden-sqls`,
      providesTags: ["GoldenSql"],
    }),
    addGoldenSql: builder.mutation<
      CreateGoldenSqlQueryArgs,
      CreateGoldenSqlQueryArgs
    >({
      query: (args) => ({
        url: `metadata/${args.projectId}/golden-sqls`,
        method: "POST",
        body: { sql: args.sql, prompt: args.prompt },
      }),
      invalidatesTags: ["GoldenSql"],
    }),
    deleteGoldenSql: builder.mutation<unknown, DeleteGoldenSqlQueryArgs>({
      query: (args) => ({
        url: `metadata/${args.projectId}/golden-sqls/${args.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GoldenSql"],
    }),
    generateCategoricalColumn: builder.mutation<
      unknown,
      GenerateCategoricalColumnQueryArgs
    >({
      query: (args) => ({
        url: `metadata/${args.projectId}/categorical/${args.catalogId}/${args.schemaName}/${args.tableName}/${args.columnName}`,
        method: "PUT",
        body: { limit: args.limit },
      }),
      invalidatesTags: ["Metadata"],
    }),
  }),
});

export interface GetProjectMetadataQueryArgs {
  projectId: string;
}

export interface GetProjectMetadataResult {
  metadata: DBMetaDataContainer[];
}

export interface GetCatalogRelationsQueryArgs {
  projectId: string;
  catalogId: string;
}

export interface GetCatalogRelationsResult {
  relations: DBMetaRelationship[];
}

export interface DeleteRelationQueryArgs {
  projectId: string;
  catalogId: string;
  schemaName: string;
  tableName: string;
  relationId: string;
}

export interface UpdateMetadataQueryArgs {
  projectId: string;
  catalogId: string;
  schemaName: string;
  tableName: string;
  metadata: UpdatedMetadata;
}

export interface UpdatedMetadata {
  columns?: DBMetaDataColumn[];
  tableDescription?: string;
  useWithAI?: boolean;
}

export interface CreateSemanticsQueryArgs {
  projectId: string;
  catalogId: string;
  schemaName: string;
  tableName: string;
  initialPrompt: string;
  limit: number;
}

export interface CreateSemanticsResult {
  metadata: DBMetaData;
  threadId: string;
}

export interface GenerateSampleQuestionsQueryArgs {
  projectId: string;
  question: string;
  threadId?: string;
}

export interface GenerateSampleQuestionsResult {
  questions: SampleQuestion[];
  threadId: string;
}

export interface SampleQuestion {
  question: string;
  category: string;
}

export interface GetGoldenSqlsResult {
  result: GoldenSql[];
}

export interface GetGoldenSqlsQueryArgs {
  projectId: string;
}

export interface GoldenSql {
  id: string;
  content: string;
  metadata: GoldenSqlMetadata;
}

export interface GoldenSqlMetadata {
  sql: string;
  prompt: string;
  projectId: string;
}

export interface CreateGoldenSqlQueryArgs {
  projectId: string;
  prompt: string;
  sql: string;
}

export interface DeleteGoldenSqlQueryArgs {
  id: string;
  projectId: string;
}

export interface GenerateCategoricalColumnQueryArgs {
  projectId: string;
  catalogId: string;
  schemaName: string;
  tableName: string;
  columnName: string;
  limit: number;
}

export const {
  useGenerateCategoricalColumnMutation,
  useGetGoldenSqlsQuery,
  useAddGoldenSqlMutation,
  useDeleteGoldenSqlMutation,
  useGenerateSampleQuestionsQuery,
  useGetProjectMetadataQuery,
  useGetCatalogRelationsQuery,
  useAddRelationMutation,
  useUpdateRelationMutation,
  useDeleteRelationMutation,
  useUpdateMetadataMutation,
  useCreateSemanticsMutation,
} = metadataApi;
