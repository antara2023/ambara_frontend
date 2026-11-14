import { useEffect, useId, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

/** Circular score that sweeps in and counts up. Colour moves from ember (low) to gold to lagoon (high). */
export function ScoreRing({ score, max = 100, size = 180, label }: { score: number; max?: number; size?: number; label?: string }) {
  const value = Math.max(0, Math.min(max, Number.isFinite(score) ? score : 0));
  const pct = value / max;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = useMotionValue(0);
  const dash = useTransform(progress, (p) => `${p * c} ${c}`);
  const [shown, setShown] = useState(0);
  const gradId = `ring-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const a = animate(progress, pct, { duration: 1.6, ease: [0.22, 1, 0.36, 1] });
    const unsub = progress.on("change", (p) => setShown(Math.round(p * max)));
    return () => {
      a.stop();
      unsub();
    };
  }, [pct, max, progress]);

  const hue = pct < 0.4 ? 14 : pct < 0.7 ? 40 : 172;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={`hsl(${hue} 95% 72%)`} />
            <stop offset="100%" stopColor={`hsl(${hue + 25} 90% 55%)`} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" style={{ stroke: "rgb(var(--fg-rgb) / 0.07)" }} strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gradId})`} strokeWidth={stroke} strokeLinecap="round" style={{ strokeDasharray: dash }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-5xl font-semibold tabular-nums text-star" aria-label={`${value} / ${max}`}>
            {shown}
            <span className="text-xl text-haze">/{max}</span>
          </p>
          {label && <p className="mt-1 px-6 text-xs font-semibold uppercase tracking-wider text-mist">{label}</p>}
        </div>
      </div>
      <div aria-hidden className="absolute inset-6 -z-10 rounded-full blur-2xl" style={{ background: `hsl(${hue} 90% 60% / 0.18)` }} />
    </div>
  );
}
