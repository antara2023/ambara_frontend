// All browser-side backend calls (RTK Query): place search, results, tools and the admin API.
// Results are cached in the store by their inputs, so going back and forth never repeats an AI call.
import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { CalculatorAdmin, CalculatorResult, Lang } from "~/lib/types";
import type { RootState } from "./index";
import { loggedOut } from "./authSlice";

let apiBase = "http://localhost:5100";
/** Set once from the root loader (the public API address can differ per environment). */
export const setApiBase = (url: string) => {
  apiBase = url.replace(/\/+$/, "");
};
/** For calls RTK Query cannot make (the Lumi chat reads a streamed reply). */
export const getApiBase = () => apiBase;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "",
  timeout: 90_000,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set("authorization", `Bearer ${token}`);
    headers.set("accept", "application/json");
    return headers;
  },
});

// ---- Cold-start retry -----------------------------------------------------------------------------------
// The backend host (Render free plan) sleeps after ~15 min without traffic and takes 30-60 s to wake. A call
// that gets no answer while the backend may be asleep is made once more, ~1 s later.
// "May be asleep" = the backend has not answered this browser in the last 14 min. The last answer is kept in
// localStorage, so reopening the site a minute later does not retry, while coming back after 30 min does.
// Only when there was no answer (no connection / timeout / 502-504 from the host); real replies (400, 401,
// 404, 429 ...) are never retried, and a call the page cancelled is not repeated. At most one retry per call.
// To revert: delete this block and in baseQuery go back to
//   const res = await rawBaseQuery(withBase, api, extra);
const WARM_FOR_MS = 14 * 60_000;
const RETRY_DELAY_MS = 1_000;
const LAST_REPLY_KEY = "ambara:api-last-reply";

const readLastReply = () => {
  try {
    return Number(localStorage.getItem(LAST_REPLY_KEY)) || 0;
  } catch {
    return 0; // no storage (private mode, server): treat as "may be asleep"
  }
};
const saveLastReply = () => {
  try {
    localStorage.setItem(LAST_REPLY_KEY, String(Date.now()));
  } catch {
    /* not remembered: the next quiet-spell check just allows one retry */
  }
};
const noAnswer = (error?: FetchBaseQueryError) => {
  if (!error) return false;
  if (error.status === "FETCH_ERROR" || error.status === "TIMEOUT_ERROR") return true;
  // A host error page (502-504) is HTML, so it arrives as a PARSING_ERROR with the real status alongside
  const status = error.status === "PARSING_ERROR" ? error.originalStatus : error.status;
  return status === 502 || status === 503 || status === 504;
};

const callWithColdStartRetry: typeof rawBaseQuery = async (args, api, extra) => {
  let res = await rawBaseQuery(args, api, extra);
  if (noAnswer(res.error) && !api.signal.aborted && Date.now() - readLastReply() > WARM_FOR_MS) {
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    if (!api.signal.aborted) res = await rawBaseQuery(args, api, extra);
  }
  if (!noAnswer(res.error)) saveLastReply();
  return res;
};

// Wake-up ping: when someone opens the site and the backend may be asleep, ask it for /health once so it is
// already waking while the visitor reads the page. /health does no database or cache work and is outside
// the rate limit. Once per page visit (the flag), never repeated, and skipped when the backend answered in
// the last 14 min. Fire-and-forget: errors are ignored.
// To revert: delete this function and its call in root.tsx (marked "wake-up ping").
let wakeSent = false;
export const wakeBackendIfAsleep = () => {
  if (wakeSent || typeof window === "undefined") return;
  wakeSent = true;
  if (Date.now() - readLastReply() <= WARM_FOR_MS) return;
  fetch(`${apiBase}/health`, { cache: "no-store" })
    .then((r) => {
      if (r.status < 502 || r.status > 504) saveLastReply();
    })
    .catch(() => {});
};
// ---- end cold-start retry -------------------------------------------------------------------------------

/** Prefixes the API address, unwraps { success, data }, and logs the admin out when the token is rejected. */
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extra) => {
  const withBase = typeof args === "string" ? `${apiBase}/api/v1${args}` : { ...args, url: `${apiBase}/api/v1${args.url}` };
  const res = await callWithColdStartRetry(withBase, api, extra); // cold-start retry (see above to revert)
  if (res.error?.status === 401 && (api.getState() as RootState).auth.token) api.dispatch(loggedOut());
  if (res.data && typeof res.data === "object" && "data" in (res.data as object)) return { ...res, data: (res.data as { data: unknown }).data };
  return res;
};

export type ResultArgs = {
  slug: string;
  body: {
    userName: string;
    userGender: string;
    userDob: string;
    userTob: string;
    userPob: string;
    partner?: { name: string; gender: string; dob: string; tob: string; pob: string };
    customAnswers?: Record<string, string>;
    lang: Lang;
  };
};

export type ToolArgs = { tool: string; body: Record<string, string> };

export type AdminListItem = Omit<CalculatorAdmin, "contentMarkdown" | "faqs" | "prompt">;

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Calculator"],
  keepUnusedDataFor: 600,
  endpoints: (b) => ({
    // ---- public
    searchPlaces: b.query<string[], string>({
      query: (q) => `/places?q=${encodeURIComponent(q)}`,
      keepUnusedDataFor: 1800,
    }),
    calculatorResult: b.query<CalculatorResult, ResultArgs>({
      query: ({ slug, body }) => ({ url: `/calculators/${encodeURIComponent(slug)}/result`, method: "POST", body }),
      keepUnusedDataFor: 3600,
    }),
    toolResult: b.query<Record<string, unknown>, ToolArgs>({
      query: ({ tool, body }) => ({ url: `/tools/${encodeURIComponent(tool)}`, method: "POST", body }),
      keepUnusedDataFor: 3600,
    }),

    // ---- admin
    login: b.mutation<{ token: string; admin: { id: string; email: string; name: string; role: string } }, { email: string; password: string }>({
      query: (body) => ({ url: "/admin/auth/login", method: "POST", body }),
    }),
    adminList: b.query<AdminListItem[], { lang?: Lang; q?: string }>({
      query: ({ lang, q }) => {
        const p = new URLSearchParams();
        if (lang) p.set("lang", lang);
        if (q) p.set("q", q);
        return `/admin/calculators?${p}`;
      },
      providesTags: [{ type: "Calculator", id: "LIST" }],
    }),
    adminGet: b.query<CalculatorAdmin, { calculatorId: string; lang: Lang }>({
      query: ({ calculatorId, lang }) => `/admin/calculators/${encodeURIComponent(calculatorId)}?lang=${lang}`,
      providesTags: (_r, _e, a) => [{ type: "Calculator", id: `${a.calculatorId}:${a.lang}` }],
      keepUnusedDataFor: 0,
    }),
    adminCreate: b.mutation<CalculatorAdmin, Partial<CalculatorAdmin>>({
      query: (body) => ({ url: "/admin/calculators", method: "POST", body }),
      invalidatesTags: [{ type: "Calculator", id: "LIST" }],
    }),
    adminUpdate: b.mutation<CalculatorAdmin, { calculatorId: string; lang: Lang; data: Partial<CalculatorAdmin> }>({
      query: ({ calculatorId, lang, data }) => ({ url: `/admin/calculators/${encodeURIComponent(calculatorId)}?lang=${lang}`, method: "PUT", body: data }),
      invalidatesTags: (_r, _e, a) => [{ type: "Calculator", id: "LIST" }, { type: "Calculator", id: `${a.calculatorId}:${a.lang}` }],
    }),
    adminDelete: b.mutation<void, { calculatorId: string; lang: Lang }>({
      query: ({ calculatorId, lang }) => ({ url: `/admin/calculators/${encodeURIComponent(calculatorId)}?lang=${lang}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Calculator", id: "LIST" }],
    }),
  }),
});

export const {
  useSearchPlacesQuery,
  useCalculatorResultQuery,
  useToolResultQuery,
  useLoginMutation,
  useAdminListQuery,
  useAdminGetQuery,
  useAdminCreateMutation,
  useAdminUpdateMutation,
  useAdminDeleteMutation,
} = api;

/** Readable message from an RTK Query error, using the backend's own message when it sent one. */
export function errorMessage(err: unknown, fallback: { network: string; tooMany: string; generic: string }): string {
  if (!err || typeof err !== "object") return fallback.generic;
  const e = err as FetchBaseQueryError;
  if (e.status === "FETCH_ERROR" || e.status === "TIMEOUT_ERROR") return fallback.network;
  if (e.status === 429) return fallback.tooMany;
  const body = "data" in e ? (e.data as { message?: string; details?: { message: string }[] } | undefined) : undefined;
  if (body?.details?.length) return body.details.map((d) => d.message).join(". ");
  return body?.message || fallback.generic;
}
