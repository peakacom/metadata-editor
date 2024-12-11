import { configureStore } from "@reduxjs/toolkit";

import { setupListeners } from "@reduxjs/toolkit/query";
import { metadataApi } from "./metadata";
import apiKeyReducer from "./apiKeySlice";
import { partnerApi } from "./partner";
import { aiApi } from "./ai";

export const store = configureStore({
  reducer: {
    [metadataApi.reducerPath]: metadataApi.reducer,
    [partnerApi.reducerPath]: partnerApi.reducer,
    [aiApi.reducerPath]: aiApi.reducer,
    apiKey: apiKeyReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(metadataApi.middleware)
      .concat(partnerApi.middleware)
      .concat(aiApi.middleware),
});
export type RootState = ReturnType<typeof store.getState>;
setupListeners(store.dispatch);
export type AppDispatch = typeof store.dispatch;
