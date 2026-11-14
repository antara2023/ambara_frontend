// Home page: Lumi floats in the bottom-right corner. After a moment a speech bubble grows out of it and cycles
// through questions Lumi can answer (fading between them, the bubble resizing to each). Clicking a question
// opens the chat and asks it; clicking Lumi opens the chat. The bubble can be closed for this visit.
// Small touches: Lumi waves hello when it appears, the bubble pops out with a sparkle burst, and after a while
// without any activity Lumi dozes off ("zzz", eyes closed) and wakes with a wave on hover or any activity.
// All of it is skipped for visitors who prefer reduced motion (only the closed eyes remain).
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import { LUMI_TEASERS } from "~/lib/lumi";
import { LumiMark } from "./LumiMark";

const HIDE_KEY = "ambara:lumi-bubble-hidden";
const SHOW_AFTER_MS = 2200;
const EACH_MS = 4200;
const IDLE_MS = 25_000; // no pointer, key, scroll or touch for this long: Lumi dozes off

const WAVE = { rotate: [0, -14, 12, -8, 5, 0] };

// Sparkles flying up out of Lumi, over the bubble's corner
const SPARKS = [
  { x: -30, y: -46, s: 13, c: "#ffd66b", d: 0 },
  { x: -4, y: -62, s: 10, c: "#b9a6f5", d: 0.04 },
  { x: -52, y: -30, s: 9, c: "#ff9fb8", d: 0.08 },
  { x: 18, y: -48, s: 9, c: "#7be0d0", d: 0.05 },
  { x: -22, y: -72, s: 8, c: "#ffd66b", d: 0.1 },
  { x: 30, y: -24, s: 7, c: "#ff9fb8", d: 0.12 },
];

function SparkleBurst() {
  return (
    <span aria-hidden className="pointer-events-none absolute left-1 top-1">
      {SPARKS.map((p, k) => (
        <motion.svg
          key={k}
          width={p.s}
          height={p.s}
          viewBox="0 0 10 10"
          className="absolute left-0 top-0"
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, scale: [0, 1.2, 0.8], opacity: [1, 1, 0], rotate: 90 }}
          transition={{ duration: 0.8, delay: p.d, ease: [0.22, 1, 0.36, 1] }}
        >
          <path d="M5 0l1.3 3.7L10 5 6.3 6.3 5 10 3.7 6.3 0 5l3.7-1.3Z" fill={p.c} stroke="var(--p-line)" strokeWidth="0.8" strokeLinejoin="round" />
        </motion.svg>
      ))}
    </span>
  );
}

export function LumiLauncher() {
  const reduce = useReducedMotion();
  const [showBubble, setShowBubble] = useState(false);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [burst, setBurst] = useState(0); // bumps each time the bubble pops out
  const [sleepy, setSleepy] = useState(false);
  const [wave, setWave] = useState(0); // bumps to replay the hello wave (on wake)
  const sleepyRef = useRef(false);
  const lastActive = useRef(Date.now());

  // Doze off after a quiet spell; any activity (or hovering Lumi) wakes it with a wave
  useEffect(() => {
    const wake = () => {
      lastActive.current = Date.now();
      if (sleepyRef.current) {
        sleepyRef.current = false;
        setSleepy(false);
        setWave((n) => n + 1);
      }
    };
    const events = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    const check = setInterval(() => {
      if (!sleepyRef.current && Date.now() - lastActive.current > IDLE_MS) {
        sleepyRef.current = true;
        setSleepy(true);
      }
    }, 2000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, wake));
      clearInterval(check);
    };
  }, []);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(HIDE_KEY) === "1";
    } catch {
      /* no storage */
    }
    if (hidden) return;
    const t = setTimeout(() => {
      setShowBubble(true);
      setBurst((n) => n + 1);
    }, SHOW_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!showBubble || paused || sleepy) return;
    const t = setInterval(() => setI((n) => (n + 1) % LUMI_TEASERS.length), reduce ? EACH_MS * 1.5 : EACH_MS);
    return () => clearInterval(t);
  }, [showBubble, paused, sleepy, reduce]);

  const hideBubble = () => {
    setShowBubble(false);
    try {
      sessionStorage.setItem(HIDE_KEY, "1");
    } catch {
      /* not remembered */
    }
  };

  const teaser = LUMI_TEASERS[i];

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {showBubble && (
          <motion.div
            key="bubble"
            layout
            initial={{ opacity: 0, scale: 0.6, x: 24 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.7, x: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            style={{ transformOrigin: "100% 100%" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            className="pointer-events-auto relative mb-3 max-w-[calc(100vw-7.5rem)] rounded-2xl rounded-br-md border-2 border-fg bg-[var(--p-card)] shadow-[4px_4px_0_var(--p-shadow)] sm:max-w-xs"
          >
            <Link to={`/lumi?q=${encodeURIComponent(teaser.q)}`} className="group block py-3 pl-4 pr-9">
              <span className="pop-mono block !text-[0.66rem] uppercase text-mist">Lumi · AI astrologer</span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={i}
                  layout="position"
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-0.5 block text-[0.98rem] font-extrabold leading-snug"
                >
                  {teaser.text}
                </motion.span>
              </AnimatePresence>
              <motion.span layout="position" className="mt-1 inline-flex items-center gap-1 text-[0.8rem] font-bold text-gold">
                Ask Lumi <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </motion.span>
            </Link>
            <button type="button" onClick={hideBubble} aria-label="Hide Lumi’s suggestions" className="absolute right-1.5 top-1.5 rounded-full p-1.5 text-mist hover:bg-fg/[0.08] hover:text-star">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="pointer-events-auto relative"
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={reduce ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, scale: 1, y: [0, -5, 0] }}
        transition={reduce ? { duration: 0.3 } : { opacity: { duration: 0.4 }, scale: { type: "spring", stiffness: 260, damping: 18 }, y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" } }}
      >
        <Link
          to="/lumi"
          aria-label="Chat with Lumi, Ambara’s AI astrologer"
          className="relative grid h-16 w-16 place-items-center rounded-full border-2 border-fg bg-[var(--p-card)] shadow-[4px_4px_0_var(--p-shadow)] transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--p-shadow)]"
        >
          {!reduce && !sleepy && <span aria-hidden className="lumi-ping absolute inset-0 rounded-full border-2 border-[var(--p-mark)]" />}
          <motion.span
            key={wave}
            className="grid place-items-center"
            style={{ transformOrigin: "50% 80%" }}
            initial={{ rotate: 0 }}
            animate={reduce ? undefined : WAVE}
            transition={{ duration: 1.1, delay: wave === 0 ? 0.7 : 0.05, ease: "easeInOut" }}
          >
            <LumiMark size={46} live={!sleepy} sleepy={sleepy} />
          </motion.span>
          {sleepy && !reduce && (
            <span aria-hidden className="pointer-events-none absolute -right-1 -top-2 font-[DM_Mono,monospace] font-bold text-star">
              <span className="lumi-z absolute text-[0.7rem]" style={{ animationDelay: "0s" }}>z</span>
              <span className="lumi-z absolute text-[0.85rem]" style={{ animationDelay: "0.8s" }}>z</span>
              <span className="lumi-z absolute text-[1rem]" style={{ animationDelay: "1.6s" }}>z</span>
            </span>
          )}
        </Link>
        {!reduce && burst > 0 && <SparkleBurst key={burst} />}
      </motion.div>
    </div>
  );
}
