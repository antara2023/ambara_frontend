import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { useT } from "~/lib/i18n";

const STEPS = ["loading1", "loading2", "loading3", "loading4"] as const;
const STEP_MS = [2500, 3500, 5000];

/** Shown while the reading is prepared: planets circling a sun, and the steps the server is working through. */
export function LoadingOrbit({ steps = STEPS }: { steps?: readonly (typeof STEPS)[number][] }) {
  const t = useT();
  const [at, setAt] = useState(0);

  useEffect(() => {
    if (at >= steps.length - 1) return;
    const id = setTimeout(() => setAt((a) => a + 1), STEP_MS[at] ?? 5000);
    return () => clearTimeout(id);
  }, [at, steps.length]);

  return (
    <div className="panel flex flex-col items-center px-6 py-14 text-center" role="status" aria-live="polite">
      <OrbitSystem />

      <div className="mt-10 h-7">
        <AnimatePresence mode="wait">
          <motion.p key={at} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="font-display text-xl text-star">
            {t(steps[at])}…
          </motion.p>
        </AnimatePresence>
      </div>
      <ol className="mt-6 flex flex-col gap-2 text-left text-sm">
        {steps.map((s, i) => (
          <li key={s} className={`flex items-center gap-2.5 transition-colors duration-500 ${i < at ? "text-mist" : i === at ? "text-star" : "text-haze/60"}`}>
            <span className={`grid h-5 w-5 place-items-center rounded-full border transition-all duration-500 ${i < at ? "border-lagoon bg-lagoon/20 text-lagoon" : i === at ? "border-gold" : "border-fg/15"}`}>
              {i < at ? <Check size={12} strokeWidth={3} /> : i === at ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" /> : null}
            </span>
            {t(s)}
          </li>
        ))}
      </ol>
      <p className="mt-8 text-xs text-haze">{t("loadingNote")}</p>
    </div>
  );
}

const ORBIT_PLANETS = [
  { inset: 0, dur: 3.2, size: 10, color: "#8b7bff", rest: 50 },
  { inset: 28, dur: 2.1, size: 8, color: "#44d7c7", rest: 150 },
  { inset: 0, dur: 5.4, size: 7, color: "#ff6f9c", delay: -2, rest: 235 },
];

/**
 * Sun, two orbits and three planets. They revolve while a reading loads; with `still` the same picture is shown at
 * rest (error states), the planets parked apart on their orbits.
 */
export function OrbitSystem({ still = false }: { still?: boolean }) {
  return (
    <div className="relative h-44 w-44" aria-hidden={still || undefined}>
      <div className="absolute inset-0 rounded-full border border-fg/10" />
      <div className="absolute inset-7 rounded-full border border-dashed border-fg/10" />
      <div className="absolute inset-[34%] rounded-full bg-gradient-to-br from-[#f8d58e] via-[#f3b94d] to-[#ff7c5c] shadow-[0_0_50px_rgba(243,185,77,0.55)]" />
      {ORBIT_PLANETS.map((p, i) => {
        const planet = <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: p.size, height: p.size, background: p.color, boxShadow: `0 0 14px ${p.color}` }} />;
        return still ? (
          <div key={i} className="absolute" style={{ inset: p.inset, transform: `rotate(${p.rest}deg)` }}>
            {planet}
          </div>
        ) : (
          <motion.div
            key={i}
            className="absolute"
            style={{ inset: p.inset }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, ease: "linear", duration: p.dur, delay: p.delay ?? 0 }}
          >
            {planet}
          </motion.div>
        );
      })}
    </div>
  );
}
