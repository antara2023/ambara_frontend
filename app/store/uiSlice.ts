import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

export type Toast = { id: string; kind: "success" | "error" | "info"; text: string };
type UiState = { toasts: Toast[] };

const initialState: UiState = { toasts: [] };

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toastShown: {
      reducer: (s, a: PayloadAction<Toast>) => {
        s.toasts = [...s.toasts.slice(-2), a.payload];
      },
      prepare: (kind: Toast["kind"], text: string) => ({ payload: { id: nanoid(), kind, text } }),
    },
    toastDismissed: (s, a: PayloadAction<string>) => {
      s.toasts = s.toasts.filter((t) => t.id !== a.payload);
    },
  },
});

export const { toastShown, toastDismissed } = uiSlice.actions;
export default uiSlice.reducer;
