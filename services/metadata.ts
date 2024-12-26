import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  DBMetaData,
  DBMetaDataColumn,
  DBMetaDataContainer,
  DBMetaRelationship,
} from "./types";
import { omit } from "lodash";
import { PARTNER_API_BASE_URL } from "@/config/config";

import type { RootState } from "./store";

export const metadataApi = createApi({
  reducerPath: "metadataApi",
  baseQuery: fetchBaseQuery({
    baseUrl: PARTNER_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const apiKeyState = (getState() as RootState).apiKey;
      if (apiKeyState) {
        headers.set("authorization", `Bearer ${apiKeyState.selectedApiKey}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Relations", "Metadata"],
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
        body: { initialPrompt: args.initialPrompt },
      }),
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
}

export interface CreateSemanticsResult {
  metadata: DBMetaData;
  threadId: string;
}

export const {
  useGetProjectMetadataQuery,
  useGetCatalogRelationsQuery,
  useAddRelationMutation,
  useUpdateRelationMutation,
  useDeleteRelationMutation,
  useUpdateMetadataMutation,
  useCreateSemanticsMutation,
} = metadataApi;
