"use-client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ProjectInfo } from "./types";
import { PARTNER_API_BASE_URL } from "@/config/config";

import type { RootState } from "./store";

export const partnerApi = createApi({
  reducerPath: "partnerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: PARTNER_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const apiKeyState = (getState() as RootState).apiKey;
      if (!headers.get("authorization") && apiKeyState) {
        headers.set("authorization", `Bearer ${apiKeyState.selectedApiKey}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getProjectInfo: builder.query<ProjectInfo, GetProjectInfoQueryArgs>({
      query: (args) => ({
        url: `info`,
        headers: {
          authorization: args.apiKey ? `Bearer ${args.apiKey}` : undefined,
        },
      }),
    }),
  }),
});

export interface GetProjectInfoQueryArgs {
  apiKey?: string;
}

export const { useGetProjectInfoQuery, useLazyGetProjectInfoQuery } =
  partnerApi;
