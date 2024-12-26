"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import {
  API_KEY_LOCAL_STORAGE_KEY,
  SELECTED_API_KEY_LOCAL_STORAGE_KEY,
} from "@/config/config";

export interface ApiKeyState {
  apiKeys: string[] | null;
  selectedApiKey: string | null;
}

const initialState: ApiKeyState = {
  apiKeys:
    global?.localStorage && localStorage.getItem(API_KEY_LOCAL_STORAGE_KEY)
      ? (JSON.parse(
          localStorage.getItem(API_KEY_LOCAL_STORAGE_KEY) as string
        ) as string[])
      : [],
  selectedApiKey: global?.localStorage
    ? localStorage.getItem(SELECTED_API_KEY_LOCAL_STORAGE_KEY)
    : "",
};

export const apiKeySlice = createSlice({
  name: "api-key",
  initialState,
  reducers: {
    setApiKey: (state, action: PayloadAction<string>) => {
      if (state.apiKeys) {
        state.apiKeys.push(action.payload);
      } else {
        state.apiKeys = [action.payload];
        state.selectedApiKey = action.payload;
        localStorage.setItem(
          SELECTED_API_KEY_LOCAL_STORAGE_KEY,
          JSON.stringify(state.apiKeys)
        );
      }
      localStorage.setItem(
        API_KEY_LOCAL_STORAGE_KEY,
        JSON.stringify(state.apiKeys)
      );
    },
    setApiKeys: (state, action: PayloadAction<string[]>) => {
      state.apiKeys = action.payload;
      localStorage.setItem(
        API_KEY_LOCAL_STORAGE_KEY,
        JSON.stringify(action.payload)
      );
    },
    setSelectedApiKey: (state, action: PayloadAction<string | null>) => {
      state.selectedApiKey = action.payload;
      if (action.payload === null) {
        localStorage.removeItem(SELECTED_API_KEY_LOCAL_STORAGE_KEY);
        return;
      }
      localStorage.setItem(SELECTED_API_KEY_LOCAL_STORAGE_KEY, action.payload);
    },
    resetApiKey: (state) => {
      localStorage.removeItem(API_KEY_LOCAL_STORAGE_KEY);
      localStorage.removeItem(SELECTED_API_KEY_LOCAL_STORAGE_KEY);
      state.apiKeys = null;
      state.selectedApiKey = null;
    },
  },
});

export const { setApiKey, setSelectedApiKey, setApiKeys, resetApiKey } =
  apiKeySlice.actions;

export const selectApiKey = (state: RootState) => state.apiKey;

export default apiKeySlice.reducer;
