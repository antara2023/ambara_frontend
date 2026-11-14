// Backend calls made by the website server (loaders). Errors become proper HTTP responses for the error boundary.
import { data } from "react-router";
import { serverEnv } from "./env.server";
import type { CalculatorContent, CalculatorListItem, Lang } from "./types";

type Envelope<T> = { success: boolean; data: T; message?: string };

const TIMEOUT_MS = 10_000;

// ---- Cold-start retry -----------------------------------------------------------------------------------
// The backend host (Render free plan) puts the backend to sleep after ~15 min without traffic, and waking it
// takes 30-60 s, so the first page load after a quiet spell timed out and showed "try again". That first call
// has already started the wake-up, so one more call with a longer wait usually gets through.
// Only when the backend may be asleep: it has not answered this server in the last 14 min (or ever, e.g. a
// fresh server instance). Once it has answered recently, a failure is a real one and is shown as before.
// Only when the backend did not answer at all (timeout / no connection / 502-504 from the host); real
// replies such as 404 are never retried. At most one retry per call; both tries stay under ~60 s.
// To revert: delete this block, and in get() put back the original single call in place of the
// `callWithColdStartRetry` line and the `if (!res)` check:
//   let res: Response;
//   try {
//     res = await fetch(`${serverEnv.apiUrl}/api/v1${path}`, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(TIMEOUT_MS) });
//   } catch {
//     throw data({ message: "Our servers are not responding right now. Please try again in a moment." }, { status: 503 });
//   }
const WARM_FOR_MS = 14 * 60_000;
const RETRY_DELAY_MS = 1_000;
const RETRY_TIMEOUT_MS = 45_000;
// Last time the backend answered this server instance (shared by all visitors: it is the backend's state)
let lastBackendReplyAt = 0;

const callBackend = (path: string, timeoutMs: number): Promise<Response | null> =>
  fetch(`${serverEnv.apiUrl}/api/v1${path}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
  }).catch(() => null);

const noAnswer = (res: Response | null) => !res || res.status === 502 || res.status === 503 || res.status === 504;

async function callWithColdStartRetry(path: string): Promise<Response | null> {
  let res = await callBackend(path, TIMEOUT_MS);
  if (noAnswer(res) && Date.now() - lastBackendReplyAt > WARM_FOR_MS) {
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    res = await callBackend(path, RETRY_TIMEOUT_MS);
  }
  if (!noAnswer(res)) lastBackendReplyAt = Date.now();
  return res;
}
// ---- end cold-start retry -------------------------------------------------------------------------------

async function get<T>(path: string): Promise<T> {
  const res = await callWithColdStartRetry(path); // cold-start retry (see above to revert)
  if (!res) {
    // Same message as before when the backend never answered
    throw data({ message: "Our servers are not responding right now. Please try again in a moment." }, { status: 503 });
  }
  const body = (await res.json().catch(() => null)) as Envelope<T> | null;
  if (!res.ok || !body?.success) {
    throw data({ message: body?.message || "Something went wrong." }, { status: res.status === 404 ? 404 : 502 });
  }
  return body.data;
}

export const fetchCalculatorList = (lang: Lang) => get<CalculatorListItem[]>(`/calculators?lang=${lang}`);

export const fetchCalculator = (slug: string, lang: Lang) =>
  get<CalculatorContent>(`/calculators/${encodeURIComponent(slug)}?lang=${lang}`);
