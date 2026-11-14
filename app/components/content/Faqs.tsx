import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import type { Faq } from "~/lib/types";

/** Accordion of questions. Answers are in the HTML (hidden attribute) so search engines and no-JS readers get them. */
export function Faqs({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <div className="divide-y divide-fg/[0.07] overflow-hidden rounded-[var(--radius-card)] border border-fg/[0.08] bg-fg/[0.02]">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        const panelId = `${base}-p${i}`;
        return (
          <div key={i}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left font-semibold text-star transition-colors hover:bg-fg/[0.03] sm:px-6"
              >
                <span>{f.question}</span>
                <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 26 }} className={`mt-0.5 shrink-0 ${isOpen ? "text-gold" : "text-haze"}`}>
                  <Plus size={18} />
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-6 leading-relaxed text-mist sm:px-6">{f.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!isOpen && (
              <p id={panelId} hidden>
                {f.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
