import { configureStore, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { api } from "./api";
import authReducer, { authHydrated, loggedIn, loggedOut } from "./authSlice";
import birthReducer, { birthCleared, birthHydrated, birthSaved } from "./birthSlice";
import uiReducer from "./uiSlice";

const BIRTH_KEY = "ambara:birth";
const ADMIN_KEY = "ambara:admin";

const storage = {
  read<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  write(key: string, value: unknown) {
    try {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode or storage full: the feature simply isn't remembered */
    }
  },
};

/** One store per page render on the server, one per browser tab on the client. */
export function makeStore() {
  const persist = createListenerMiddleware();

  persist.startListening({
    matcher: isAnyOf(birthSaved, birthCleared),
    effect: (_a, l) => storage.write(BIRTH_KEY, (l.getState() as RootState).birth.saved),
  });
  persist.startListening({
    matcher: isAnyOf(loggedIn, loggedOut),
    effect: (_a, l) => {
      const { token, admin } = (l.getState() as RootState).auth;
      storage.write(ADMIN_KEY, token ? { token, admin } : null);
      if (!token) l.dispatch(api.util.resetApiState());
    },
  });

  return configureStore({
    reducer: { [api.reducerPath]: api.reducer, auth: authReducer, birth: birthReducer, ui: uiReducer },
    middleware: (gDM) => gDM().prepend(persist.middleware).concat(api.middleware),
  });
}

/** Called once in the browser after the first render, so server and client HTML match. */
export function hydrateFromStorage(store: AppStore) {
  store.dispatch(birthHydrated(storage.read(BIRTH_KEY)));
  store.dispatch(authHydrated(storage.read(ADMIN_KEY)));
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
