import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useT } from "~/lib/i18n";

/** "On this page" list that highlights the section being read. */
export function Toc({ headings }: { headings: { id: string; text: string }[] }) {
  const t = useT();
  const [active, setActive] = useState(headings[0]?.id);

  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;
  return (
    <nav aria-label={t("onThisPage")} className="text-sm">
      <p className="eyebrow mb-4">{t("onThisPage")}</p>
      <ul className="relative space-y-1 border-l border-fg/10">
        {headings.map((h) => (
          <li key={h.id} className="relative">
            {active === h.id && <motion.span layoutId="toc-bar" className="absolute -left-px top-0 h-full w-0.5 bg-gold" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
            <a href={`#${h.id}`} className={`block py-1.5 pl-4 leading-snug transition-colors ${active === h.id ? "text-star" : "text-haze hover:text-mist"}`}>
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
