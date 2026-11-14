// The visitor's birth details, remembered on this device so every calculator can pre-fill the form.
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BirthDetails } from "~/lib/types";

type BirthState = { saved: BirthDetails | null; hydrated: boolean };

const initialState: BirthState = { saved: null, hydrated: false };

const birthSlice = createSlice({
  name: "birth",
  initialState,
  reducers: {
    birthSaved: (s, a: PayloadAction<BirthDetails>) => {
      s.saved = a.payload;
    },
    birthCleared: (s) => {
      s.saved = null;
    },
    birthHydrated: (s, a: PayloadAction<BirthDetails | null>) => {
      if (a.payload) s.saved = a.payload;
      s.hydrated = true;
    },
  },
});

export const { birthSaved, birthCleared, birthHydrated } = birthSlice.actions;
export default birthSlice.reducer;
