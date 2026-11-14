// Lumi, Ambara's AI astrologer: a chat that streams replies, reads the visitor's own chart when they add birth
// details (shared with the calculators), and shows cards and follow-up questions under each reply.
// The conversation is kept on the server under an anonymous id this browser remembers (lib/lumi.ts).
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import Markdown from "react-markdown";
import { ArrowUp, History, Plus, RotateCw, Square, Trash2, UserRound, X } from "lucide-react";
import type { Route } from "./+types/lumi";
import { envFromMatches, seo } from "~/lib/seo";
import type { BirthDetails } from "~/lib/types";
import {
  deleteLumiSession,
  fetchLumiSession,
  fetchLumiSessions,
  LUMI_PROMPTS,
  readLumiState,
  streamLumi,
  writeLumiState,
  type LumiEvent,
  type LumiMessage,
  type LumiSessionSummary,
} from "~/lib/lumi";
import { useAppDispatch, useAppSelector } from "~/store";
import { birthCleared, birthSaved } from "~/store/birthSlice";
import { BirthFields, emptyBirth, validateBirth, type BirthErrors } from "~/components/form/BirthFields";
import { LumiMark } from "~/components/lumi/LumiMark";
import { LumiCards } from "~/components/lumi/LumiCards";

export const meta: Route.MetaFunction = ({ matches }) =>
  seo({
    env: envFromMatches(matches),
    lang: "en",
    path: "/lumi",
    alternatePath: { en: "/lumi", hi: undefined },
    title: "Lumi, your AI astrologer",
    description: "Ask Lumi about career, marriage, love, money or a baby name. Answers from your own Vedic and Western chart, in plain words.",
  });

const MAX_LEN = 1000;
const tile = (hue: number) => `hsl(${hue} 85% 84%)`;
let tmp = 0;
const tmpId = () => `tmp-${Date.now()}-${tmp++}`;

// ---------------------------------------------------------------------------------------------------------
function Reply({ text }: { text: string }) {
  return (
    <Markdown
      allowedElements={["p", "strong", "em", "ul", "ol", "li", "br"]}
      unwrapDisallowed
      components={{
        p: ({ children }) => <p className="mb-2.5 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-extrabold">{children}</strong>,
        ul: ({ children }) => <ul className="mb-2.5 list-disc space-y-1 pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2.5 list-decimal space-y-1 pl-5">{children}</ol>,
      }}
    >
      {text}
    </Markdown>
  );
}

function Thinking() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(t);
  }, []);
  return (
    <span className="flex items-center gap-3" role="status">
      <span className="flex gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-current"
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </span>
      <span className="text-sm font-semibold text-mist">{slow ? "Waking Lumi up, this can take a few seconds…" : "Reading the stars…"}</span>
    </span>
  );
}

function Bubble({
  m,
  last,
  onSuggestion,
  onAddBirth,
  onRetry,
}: {
  m: LumiMessage;
  last: boolean;
  onSuggestion: (q: string) => void;
  onAddBirth: () => void;
  onRetry: () => void;
}) {
  // While Lumi has not written anything yet, the bubble appears after a short pause and is only as wide as the indicator
  const waiting = m.role === "assistant" && !!m.streaming && !m.content;
  const [visible, setVisible] = useState(!waiting);
  useEffect(() => {
    if (!waiting) return setVisible(true);
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, [waiting]);

  if (m.role === "user") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md border-2 border-fg bg-[#ffd66b] px-4 py-2.5 text-[1rem] font-semibold text-[var(--p-ink)]">
          {m.content}
        </div>
      </motion.div>
    );
  }
  if (!visible) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5 sm:gap-3">
      <LumiMark size={34} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className={`panel !rounded-2xl !rounded-tl-md text-[1rem] leading-relaxed !shadow-[4px_4px_0_var(--p-shadow)] ${waiting ? "w-fit px-4 py-2.5" : "px-4 py-3"}`}>
          {m.content ? <Reply text={m.content} /> : m.streaming ? <Thinking /> : null}
          {m.streaming && m.content && <span aria-hidden className="ml-0.5 inline-block h-4 w-[3px] translate-y-0.5 animate-pulse bg-current" />}
          {m.stopped && <p className="pop-mono mt-1 !text-[0.72rem] text-mist">Stopped</p>}
          {m.error && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-ember">{m.error}</span>
              {last && (
                <button type="button" onClick={onRetry} className="btn-ghost !px-3 !py-1.5 text-sm">
                  <RotateCw size={14} /> Try again
                </button>
              )}
            </div>
          )}
        </div>
        {m.cards && m.cards.length > 0 && <LumiCards cards={m.cards} onAddBirth={onAddBirth} />}
        {last && !m.streaming && m.suggestions && m.suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-3 flex flex-wrap gap-2">
            {m.suggestions.map((s) => (
              <button key={s} type="button" onClick={() => onSuggestion(s)} className="pop-chip !h-auto !whitespace-normal !py-2 text-left !text-[0.9rem]">
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function Welcome({ birth, onAsk, onAddBirth }: { birth: BirthDetails | null; onAsk: (q: string) => void; onAddBirth: () => void }) {
  return (
    <div className="flex flex-col items-center pt-6 text-center sm:pt-10">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
        <LumiMark size={92} live />
      </motion.div>
      <h1 className="pop-h2 mt-4">Hi, I’m Lumi</h1>
      <p className="mt-3 max-w-xl text-lg font-medium text-mist">
        Your AI astrologer. Ask about career, love, marriage, money or a baby name, and I’ll answer from your own Vedic and Western chart.
      </p>
      <button type="button" onClick={onAddBirth} className="pop-chip mt-5">
        <UserRound size={16} aria-hidden />
        {birth?.name ? `Reading for ${birth.name.split(" ")[0]} · change` : "Add birth details for personal readings"}
      </button>
      <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
        {LUMI_PROMPTS.map((p, i) => (
          <motion.button
            key={p.q}
            type="button"
            onClick={() => onAsk(p.q)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i + 0.15 }}
            className="pop-card pop-card-small !min-h-0 text-left"
            style={{ "--tile": tile(p.hue) } as React.CSSProperties}
          >
            <span className="flex items-center gap-2">
              <span className="pop-dot" style={{ background: tile(p.hue) }} />
              <span className="pop-mono !text-[0.72rem] uppercase">{p.label}</span>
            </span>
            <span className="text-[1rem] font-bold leading-snug">{p.q}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function BirthDialog({ initial, onSave, onRemove, onClose }: { initial: BirthDetails | null; onSave: (b: BirthDetails) => void; onRemove: () => void; onClose: () => void }) {
  const [value, setValue] = useState<BirthDetails>(initial || emptyBirth);
  const [errors, setErrors] = useState<BirthErrors>({});
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    // Time and place are optional for Lumi (without them it reads the Moon sign, nakshatra and dashas)
    const errs = validateBirth(value, "en", { time: false, place: false });
    if (value.tob && !/^\d{2}:\d{2}$/.test(value.tob)) errs.tob = "Please enter a valid time";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave(value);
  };

  return (
    <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form
        role="dialog"
        aria-modal="true"
        aria-labelledby="lumi-birth-title"
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="panel max-h-[92dvh] w-full max-w-xl overflow-y-auto !rounded-b-none p-5 sm:!rounded-3xl sm:p-7"
      >
        <div className="mb-1 flex items-start justify-between gap-3">
          <h2 id="lumi-birth-title" className="text-2xl font-extrabold tracking-tight">
            Your birth details
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="btn-ghost !p-2">
            <X size={18} />
          </button>
        </div>
        <p className="mb-5 text-sm font-medium text-mist">Time and place are optional, but Lumi needs them for your Lagna and houses. Saved on this device and used by the calculators too.</p>
        <BirthFields value={value} onChange={setValue} errors={errors} prefix="lumi" />
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-primary">
            Save details
          </button>
          {initial && (
            <button type="button" onClick={onRemove} className="btn-ghost text-sm">
              Remove
            </button>
          )}
        </div>
      </motion.form>
    </motion.div>
  );
}

function HistoryMenu({ clientId, current, onOpen, onDeleted, onClose }: { clientId: string; current?: string; onOpen: (id: string) => void; onDeleted: (id: string) => void; onClose: () => void }) {
  const [list, setList] = useState<LumiSessionSummary[] | null>(null);
  useEffect(() => {
    fetchLumiSessions(clientId).then((l) => setList(l || []));
  }, [clientId]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6 }}
        className="panel absolute right-0 top-full z-[61] mt-2 w-[min(22rem,calc(100vw-2rem))] !rounded-2xl p-2"
      >
        <div className="pop-mono px-2 pb-1 pt-1 !text-[0.72rem] uppercase text-mist">Recent chats</div>
        {list === null && <div className="px-2 py-3 text-sm text-mist">Loading…</div>}
        {list?.length === 0 && <div className="px-2 py-3 text-sm text-mist">No chats yet.</div>}
        <ul className="max-h-80 overflow-y-auto">
          {list?.map((s) => (
            <li key={s.id} className="group flex items-center gap-1">
              <button
                type="button"
                onClick={() => onOpen(s.id)}
                className={`min-w-0 flex-1 truncate rounded-xl px-2.5 py-2 text-left text-sm font-semibold hover:bg-fg/[0.08] ${s.id === current ? "bg-fg/[0.08]" : ""}`}
              >
                {s.title || "Untitled chat"}
              </button>
              <button
                type="button"
                aria-label={`Delete ${s.title}`}
                onClick={async () => {
                  await deleteLumiSession(clientId, s.id);
                  setList((l) => (l || []).filter((x) => x.id !== s.id));
                  onDeleted(s.id);
                }}
                className="rounded-lg p-2 text-mist opacity-70 hover:bg-fg/[0.08] hover:opacity-100"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------
export default function LumiPage() {
  const dispatch = useAppDispatch();
  const birth = useAppSelector((s) => s.birth.saved);
  const birthReady = useAppSelector((s) => s.birth.hydrated);
  const [params, setParams] = useSearchParams();

  const [clientId, setClientId] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<LumiMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [birthOpen, setBirthOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sessionRef = useRef<string | undefined>(undefined);
  const qHandled = useRef(false);
  sessionRef.current = sessionId;

  const remember = useCallback(
    (id: string | undefined) => {
      setSessionId(id);
      sessionRef.current = id;
      if (clientId) writeLumiState({ clientId, sessionId: id });
    },
    [clientId],
  );

  const update = (id: string, patch: Partial<LumiMessage> | ((m: LumiMessage) => Partial<LumiMessage>)) =>
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, ...(typeof patch === "function" ? patch(m) : patch) } : m)));

  const send = useCallback(
    async (raw: string, cid = clientId, withBirth: BirthDetails | null = birth) => {
      const text = raw.trim().slice(0, MAX_LEN);
      if (!text || !cid || abortRef.current) return;
      const replyId = tmpId();
      setMessages((list) => [...list, { id: tmpId(), role: "user", content: text }, { id: replyId, role: "assistant", content: "", streaming: true }]);
      setInput("");
      setStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;

      const onEvent = (e: LumiEvent) => {
        if (e.type === "session") {
          sessionRef.current = e.sessionId;
          setSessionId(e.sessionId);
          writeLumiState({ clientId: cid, sessionId: e.sessionId });
        } else if (e.type === "delta") update(replyId, (m) => ({ content: m.content + e.text }));
        else if (e.type === "cards") update(replyId, { cards: e.cards });
        else if (e.type === "suggestions") update(replyId, { suggestions: e.suggestions });
        else if (e.type === "done") update(replyId, { streaming: false, stopped: e.stopped });
        else if (e.type === "error") update(replyId, { streaming: false, error: e.message });
      };

      try {
        await streamLumi({ clientId: cid, sessionId: sessionRef.current, message: text, birth: withBirth }, onEvent, controller.signal);
        update(replyId, { streaming: false });
      } catch {
        if (controller.signal.aborted) update(replyId, (m) => ({ streaming: false, stopped: true, error: m.content ? undefined : "Stopped before Lumi replied." }));
        else update(replyId, { streaming: false, error: "Couldn’t reach Lumi. Check your connection and try again." });
      } finally {
        abortRef.current = null;
        setStreaming(false);
        inputRef.current?.focus({ preventScroll: true });
      }
    },
    [clientId, birth],
  );

  const stop = () => abortRef.current?.abort();

  const newChat = () => {
    stop();
    setMessages([]);
    remember(undefined);
    setHistoryOpen(false);
    inputRef.current?.focus();
  };

  const openSession = async (id: string, cid = clientId) => {
    stop();
    setHistoryOpen(false);
    setLoading(true);
    const s = await fetchLumiSession(cid, id);
    setLoading(false);
    if (!s) {
      remember(undefined);
      setMessages([]);
      return;
    }
    setMessages(s.messages);
    sessionRef.current = s.id;
    setSessionId(s.id);
    writeLumiState({ clientId: cid, sessionId: s.id });
  };

  // First load: this browser's id, then either the question from ?q= (a new chat) or the last conversation
  useEffect(() => {
    const state = readLumiState();
    setClientId(state.clientId);
    if (params.get("q")) {
      setLoading(false);
      return;
    }
    if (state.sessionId) openSession(state.sessionId, state.clientId);
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ?q= from the home launcher: ask it once, after the saved birth details are loaded
  useEffect(() => {
    const q = params.get("q");
    if (!q || qHandled.current || !clientId || !birthReady) return;
    qHandled.current = true;
    writeLumiState({ clientId });
    sessionRef.current = undefined;
    setSessionId(undefined);
    setParams((p) => {
      p.delete("q");
      return p;
    }, { replace: true });
    send(q, clientId);
  }, [params, clientId, birthReady, send, setParams]);

  // Keep the newest message in view while it streams
  const lastText = messages[messages.length - 1]?.content.length ?? 0;
  useEffect(() => {
    if (!messages.length) return;
    endRef.current?.scrollIntoView({ block: "end", behavior: lastText < 4 ? "smooth" : "auto" });
  }, [messages.length, lastText]);

  // Grow the box with its text (up to ~6 lines)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [input]);

  const lastUserText = [...messages].reverse().find((m) => m.role === "user")?.content;
  const retry = () => {
    if (!lastUserText) return;
    setMessages((list) => list.slice(0, -2));
    setTimeout(() => send(lastUserText), 0);
  };

  const saveBirth = (b: BirthDetails) => {
    const changed = JSON.stringify(b) !== JSON.stringify(birth);
    dispatch(birthSaved(b));
    setBirthOpen(false);
    // In a running conversation, let Lumi read the new chart straight away
    if (changed && messages.length && !streaming) setTimeout(() => send("Here are my birth details.", clientId, b), 0);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl flex-col px-4 sm:px-6">
      {/* Top bar */}
      <div className="sticky top-16 z-20 -mx-4 flex items-center justify-between gap-3 border-b-2 border-fg bg-[var(--p-bg)] px-4 py-3 sm:-mx-6 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <LumiMark size={40} live={streaming} />
          <div className="min-w-0">
            <div className="text-lg font-extrabold leading-tight tracking-tight">Lumi</div>
            <div className="pop-mono truncate !text-[0.7rem] uppercase text-mist">{streaming ? "Typing…" : "AI astrologer · Vedic & Western"}</div>
          </div>
        </div>
        <div className="relative flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={() => setBirthOpen(true)} className="btn-ghost !px-3 !py-2 text-sm" aria-label="Your birth details">
            <UserRound size={16} /> <span className="hidden max-w-[7rem] truncate sm:inline">{birth?.name ? birth.name.split(" ")[0] : "My details"}</span>
          </button>
          <button type="button" onClick={() => setHistoryOpen((v) => !v)} className="btn-ghost !p-2.5" aria-label="Recent chats" aria-expanded={historyOpen}>
            <History size={16} />
          </button>
          <button type="button" onClick={newChat} className="btn-ghost !p-2.5" aria-label="New chat" title="New chat">
            <Plus size={16} />
          </button>
          <AnimatePresence>
            {historyOpen && clientId && (
              <HistoryMenu
                clientId={clientId}
                current={sessionId}
                onOpen={(id) => openSession(id)}
                onDeleted={(id) => id === sessionId && newChat()}
                onClose={() => setHistoryOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 py-6" aria-live="polite">
        {loading ? (
          <div className="flex justify-center pt-16">
            <LumiMark size={56} live />
          </div>
        ) : messages.length === 0 ? (
          <Welcome birth={birth} onAsk={(q) => send(q)} onAddBirth={() => setBirthOpen(true)} />
        ) : (
          <div className="flex flex-col gap-5">
            {messages.map((m, i) => (
              <Bubble key={m.id} m={m} last={i === messages.length - 1} onSuggestion={(q) => send(q)} onAddBirth={() => setBirthOpen(true)} onRetry={retry} />
            ))}
          </div>
        )}
        <div ref={endRef} className="scroll-mb-40" />
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 z-20 -mx-4 bg-[var(--p-bg)] px-4 pb-4 pt-2 sm:-mx-6 sm:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2 rounded-[1.4rem] border-2 border-fg bg-[var(--p-card)] p-2 shadow-[4px_4px_0_var(--p-shadow)]"
        >
          <label htmlFor="lumi-input" className="sr-only">
            Ask Lumi
          </label>
          <textarea
            id="lumi-input"
            ref={inputRef}
            rows={1}
            value={input}
            maxLength={MAX_LEN}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder={birth?.name ? `Ask anything, ${birth.name.split(" ")[0]}…` : "Ask about career, love, marriage…"}
            className="max-h-42 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[1rem] font-medium outline-none placeholder:text-haze"
          />
          {streaming ? (
            <button type="button" onClick={stop} aria-label="Stop" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-fg bg-[var(--p-card)] hover:bg-fg/[0.08]">
              <Square size={15} fill="currentColor" />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send"
              disabled={!input.trim() || !clientId}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-fg bg-[#ffd66b] text-[#17131f] transition-opacity disabled:opacity-40"
            >
              <ArrowUp size={19} strokeWidth={2.6} />
            </button>
          )}
        </form>
        <p className="mt-2 text-center text-[0.72rem] font-medium text-haze">
          Lumi is an AI guide for reflection, not a replacement for medical, legal or financial advice.
          {input.length > MAX_LEN - 100 && <span className="ml-2 font-bold">{MAX_LEN - input.length} left</span>}
        </p>
      </div>

      <AnimatePresence>
        {birthOpen && (
          <BirthDialog
            initial={birth}
            onSave={saveBirth}
            onRemove={() => {
              dispatch(birthCleared());
              setBirthOpen(false);
            }}
            onClose={() => setBirthOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
