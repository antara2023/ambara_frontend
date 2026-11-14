// Lumi, Ambara's AI astrologer: types, the browser's anonymous id, and the calls to the backend.
// The reply streams as newline-delimited JSON events (backend modules/lumi/lumi.routes.js).
import { getApiBase } from "~/store/api";
import type { BirthDetails } from "./types";

export type LumiCard =
  | { type: "chart"; name: string; sun: string; moon: string; rising: string | null; rashi: string; lagna: string | null; nakshatra: string }
  | {
      type: "dasha";
      maha: string;
      mahaEnds: string;
      antar: string;
      antarStart: string;
      antarEnds: string;
      antarStartIso?: string;
      antarEndIso?: string;
      next: { lord: string; from: string }[];
    }
  | { type: "calculator"; key: string; slug: string; title: string; description: string; icon: string }
  | { type: "tool"; key: string; slug: string }
  | { type: "birthForm" };

export type LumiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  cards?: LumiCard[];
  suggestions?: string[];
  stopped?: boolean;
  /** client only */
  streaming?: boolean;
  error?: string;
};

export type LumiEvent =
  | { type: "session"; sessionId: string; title: string }
  | { type: "delta"; text: string }
  | { type: "cards"; cards: LumiCard[] }
  | { type: "suggestions"; suggestions: string[] }
  | { type: "done"; messageId: string; stopped: boolean; interrupted?: boolean }
  | { type: "error"; message: string };

export type LumiSessionSummary = { id: string; title: string; lastInteractionAt: string };

// ---- This browser's id and current conversation (localStorage; nothing personal is stored here) ----
const STATE_KEY = "ambara:lumi";
type Stored = { clientId: string; sessionId?: string };

const randomId = () => {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 32);
};

export function readLumiState(): Stored {
  try {
    const raw = JSON.parse(localStorage.getItem(STATE_KEY) || "null") as Stored | null;
    if (raw?.clientId && /^[A-Za-z0-9_-]{16,64}$/.test(raw.clientId)) return raw;
  } catch {
    /* no storage: a fresh id per visit */
  }
  const fresh = { clientId: randomId() };
  writeLumiState(fresh);
  return fresh;
}

export function writeLumiState(s: Stored) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(s));
  } catch {
    /* not remembered */
  }
}

// ---- Backend calls ----
const url = (path: string) => `${getApiBase()}/api/v1/lumi${path}`;

const toApiBirth = (b: BirthDetails) => ({ name: b.name.trim(), gender: b.gender, dob: b.dob, tob: b.tob || "", pob: b.place.trim() });

/** Sends one message and calls `onEvent` for each event as it arrives. Resolves when the reply ends. */
export async function streamLumi(
  body: { clientId: string; sessionId?: string; message: string; birth?: BirthDetails | null },
  onEvent: (e: LumiEvent) => void,
  signal: AbortSignal,
) {
  const res = await fetch(url("/chat"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId: body.clientId, sessionId: body.sessionId, message: body.message, ...(body.birth ? { birth: toApiBirth(body.birth) } : {}), lang: "en" }),
    signal,
  });
  if (!res.ok || !res.body) {
    let message = "Lumi could not answer just now. Please try again.";
    try {
      const j = await res.json();
      if (j?.message) message = j.message;
    } catch {
      /* host error page */
    }
    onEvent({ type: "error", message });
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        onEvent(JSON.parse(line) as LumiEvent);
      } catch {
        /* partial line: ignored */
      }
    }
  }
}

async function getJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url(path), { cache: "no-store", ...init });
    if (!res.ok) return null;
    return ((await res.json()) as { data: T }).data ?? null;
  } catch {
    return null;
  }
}

export const fetchLumiSession = (clientId: string, id: string) =>
  getJson<{ id: string; title: string; messages: LumiMessage[] }>(`/sessions/${id}?clientId=${encodeURIComponent(clientId)}`);

export const fetchLumiSessions = (clientId: string) => getJson<LumiSessionSummary[]>(`/sessions?clientId=${encodeURIComponent(clientId)}`);

export const deleteLumiSession = async (clientId: string, id: string) => {
  try {
    await fetch(url(`/sessions/${id}?clientId=${encodeURIComponent(clientId)}`), { method: "DELETE" });
  } catch {
    /* ignored */
  }
};

// ---- Questions Lumi invites (home launcher bubble and the empty chat) ----
export const LUMI_PROMPTS: { q: string; label: string; hue: number }[] = [
  { label: "Baby name", q: "Can you suggest a name for my baby based on the nakshatra?", hue: 190 },
  { label: "Job issues", q: "I'm having issues at my job. What does my chart say?", hue: 210 },
  { label: "Marriage", q: "When will I get married?", hue: 345 },
  { label: "Compatibility", q: "Are my partner and I compatible?", hue: 320 },
  { label: "Government job", q: "Will I get a government job?", hue: 42 },
  { label: "Money", q: "When will my finances improve?", hue: 52 },
  { label: "Saturn", q: "Am I in Sade Sati, and what does Saturn mean for me now?", hue: 245 },
  { label: "My chart", q: "What does my birth chart say about me?", hue: 262 },
];

/** Short lines for the home launcher's speech bubble (each opens the chat with its question). */
export const LUMI_TEASERS: { text: string; q: string }[] = [
  { text: "Looking for a baby name? Ask me", q: LUMI_PROMPTS[0].q },
  { text: "Having job issues?", q: LUMI_PROMPTS[1].q },
  { text: "When will you get married?", q: LUMI_PROMPTS[2].q },
  { text: "Are you two compatible?", q: LUMI_PROMPTS[3].q },
  { text: "Will you get a government job?", q: LUMI_PROMPTS[4].q },
  { text: "Curious what your chart says?", q: LUMI_PROMPTS[7].q },
];
