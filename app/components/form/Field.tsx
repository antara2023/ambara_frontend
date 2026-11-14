import { AnimatePresence, motion } from "motion/react";

/** Label + control + animated error/hint line. The control receives the ids it should reference. */
export function Field({
  id,
  label,
  error,
  hint,
  children,
  className = "",
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: (a11y: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => React.ReactNode;
  className?: string;
}) {
  const msgId = `${id}-msg`;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-[0.8rem] font-semibold text-mist">
        {label}
      </label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": error || hint ? msgId : undefined })}
      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p key="e" id={msgId} role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs font-semibold text-ember">
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p key="h" id={msgId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-haze">
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Pill-style radio group (used for gender). */
export function Segmented({
  name,
  value,
  options,
  onChange,
  invalid,
  labelledBy,
}: {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  invalid?: boolean;
  labelledBy: string;
}) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} aria-invalid={invalid || undefined} className={`relative grid grid-cols-3 gap-1 rounded-[0.9rem] border bg-ink/55 p-1 ${invalid ? "border-ember/80" : "border-fg/10"}`}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <label key={o.value} className={`relative cursor-pointer rounded-[0.65rem] px-2 py-2 text-center text-sm font-semibold transition-colors ${on ? "text-on-gold" : "text-mist hover:text-star"}`}>
            {on && <motion.span layoutId={`seg-${name}`} className="absolute inset-0 rounded-[0.65rem] bg-gradient-to-r from-gold-soft to-gold" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
            <input type="radio" name={name} value={o.value} checked={on} onChange={() => onChange(o.value)} className="sr-only" />
            <span className="relative">{o.label}</span>
          </label>
        );
      })}
    </div>
  );
}
