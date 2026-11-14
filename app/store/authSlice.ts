import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AdminUser = { id: string; email: string; name: string; role: string };
type AuthState = { token: string | null; admin: AdminUser | null; hydrated: boolean };

const initialState: AuthState = { token: null, admin: null, hydrated: false };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loggedIn: (s, a: PayloadAction<{ token: string; admin: AdminUser }>) => {
      s.token = a.payload.token;
      s.admin = a.payload.admin;
    },
    loggedOut: (s) => {
      s.token = null;
      s.admin = null;
    },
    authHydrated: (s, a: PayloadAction<{ token: string; admin: AdminUser } | null>) => {
      if (a.payload) {
        s.token = a.payload.token;
        s.admin = a.payload.admin;
      }
      s.hydrated = true;
    },
  },
});

export const { loggedIn, loggedOut, authHydrated } = authSlice.actions;
export default authSlice.reducer;
