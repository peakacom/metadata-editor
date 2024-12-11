import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface SchemaViewerState {
  selectedCatalog?: string;
  selectedSchema?: string;
}

const initialState: SchemaViewerState = {
  selectedCatalog: undefined,
  selectedSchema: undefined,
};

export const schemaViewerSlice = createSlice({
  name: "schema-viewer",
  initialState,
  reducers: {
    setSelectedCatalog: (state, action: PayloadAction<string | undefined>) => {
      state.selectedCatalog = action.payload;
    },
    setSelectedSchema: (state, action: PayloadAction<string | undefined>) => {
      state.selectedSchema = action.payload;
    },
    reset: (state) => {
      state.selectedCatalog = undefined;
      state.selectedSchema = undefined;
    },
  },
});

export const { setSelectedCatalog, setSelectedSchema, reset } =
  schemaViewerSlice.actions;

export const selectSelectedCatalog = (state: RootState) =>
  state.schemaViewer.selectedCatalog;
export const selectSelectedSchema = (state: RootState) =>
  state.schemaViewer.selectedSchema;

export default schemaViewerSlice.reducer;
