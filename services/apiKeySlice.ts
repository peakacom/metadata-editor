"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { API_KEY_LOCAL_STORAGE_KEY } from "@/config/config";

export interface ApiKeyState {
  apiKey: string | null;
}

const initialState: ApiKeyState = {
  apiKey: global?.localStorage
    ? localStorage.getItem(API_KEY_LOCAL_STORAGE_KEY)
    : "",
};

export const apiKeySlice = createSlice({
  name: "api-key",
  initialState,
  reducers: {
    setApiKey: (state, action: PayloadAction<string>) => {
      localStorage.setItem(
        API_KEY_LOCAL_STORAGE_KEY,
        action.payload.toString()
      );
      state.apiKey = action.payload;
    },
    resetApiKey: (state) => {
      localStorage.removeItem(API_KEY_LOCAL_STORAGE_KEY);
      state.apiKey = null;
    },
  },
});

export const { setApiKey, resetApiKey } = apiKeySlice.actions;

export const selectApiKey = (state: RootState) => state.apiKey;

export default apiKeySlice.reducer;
