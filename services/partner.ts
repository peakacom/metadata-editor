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
      if (apiKeyState) {
        headers.set("authorization", `Bearer ${apiKeyState.apiKey}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getProjectInfo: builder.query<ProjectInfo, unknown>({
      query: () => `info`,
    }),
  }),
});

export const { useGetProjectInfoQuery, useLazyGetProjectInfoQuery } =
  partnerApi;
