"use-client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PARTNER_API_BASE_URL } from "@/config/config";
import { omit } from "lodash";

import type { RootState } from "./store";

export const aiApi = createApi({
  reducerPath: "aiApi",
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
  tagTypes: ["ChatHistory"],
  endpoints: (builder) => ({
    askAIAgent: builder.mutation<AskAIAgentResult, AskAIAgentQueryArgs>({
      query: (args) => ({
        url: `ai/${args.projectId}/agent`,
        method: "POST",
        body: omit(args, ["projectId"]),
      }),
      invalidatesTags: ["ChatHistory"],
    }),
    getChatHistory: builder.query<
      GetChatHistoryResult,
      GetChatHistoryQueryArgs
    >({
      query: (args) => ({
        url: `ai/${args.projectId}/agent/history`,
        method: "GET",
      }),
      providesTags: ["ChatHistory"],
    }),
    deleteChatHistory: builder.mutation<void, DeleteChatHistoryQueryArgs>({
      query: (args) => ({
        url: `ai/${args.projectId}/agent/history/${args.threadId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ChatHistory"],
    }),
    updateChatHistoryName: builder.mutation<
      void,
      UpdateChatHistoryNameQueryArgs
    >({
      query: (args) => ({
        url: `ai/${args.projectId}/agent/history/${args.threadId}`,
        method: "PUT",
        body: { name: args.name },
      }),
      invalidatesTags: ["ChatHistory"],
    }),
  }),
});

export interface AskAIAgentQueryArgs {
  projectId: string;
  message: string;
  threadId?: string;
}

export interface AskAIAgentResult {
  output: AgentOutput;
  threadId: string;
}

export interface AgentOutput {
  query: string;
  data: AgentOutputData[][];
  text: string;
}

export interface AgentOutputData {
  dataType: string;
  name: string;
  order: number;
  value: string;
}

export interface GetChatHistoryQueryArgs {
  projectId: string;
}

export interface GetChatHistoryResult {
  history: ChatHistory[];
}

export interface DeleteChatHistoryQueryArgs {
  projectId: string;
  threadId: string;
}

export interface UpdateChatHistoryNameQueryArgs {
  projectId: string;
  threadId: string;
  name: string;
}

export interface ChatHistory {
  id: string;
  aiThreadId: string;
  displayName: string;
  tasks: ChatHistoryTask[];
}

export interface ChatHistoryTask {
  step: ChatHistoryStep[];
  output?: ChatHistoryOutput;
  message: string;
  modelParams?: { [key: string]: unknown };
}

export interface ChatHistoryStep {
  action: {
    log: string;
    tool: string;
    toolInput: string;
  };
  observation: string;
}

export interface ChatHistoryOutput {
  data: ChatHistoryQueryData[][];
  text: string;
  query: string;
}

export interface ChatHistoryQueryData {
  name: string;
  order: number;
  value: unknown;
  dataType: string;
}

export const {
  useAskAIAgentMutation,
  useGetChatHistoryQuery,
  useDeleteChatHistoryMutation,
  useUpdateChatHistoryNameMutation,
} = aiApi;
