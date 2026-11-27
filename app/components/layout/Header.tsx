import { useEffect, useState } from "react";
import { Link, useLocation, useMatches } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Languages, Menu, X } from "lucide-react";
import { stripLang, useLang, withLang } from "~/lib/lang";
import { useT } from "~/lib/i18n";
import { TOOLS } from "~/lib/tools";
import type { Lang } from "~/lib/types";
import { LumiMark } from "~/components/lumi/LumiMark";
import { Wordmark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

/** Pages can expose { alternate: { en, hi } } in their loader data when the other language has a different URL. */
function useAlternatePaths(): Record<Lang, string | null> {
  const { pathname, search } = useLocation();
  const matches = useMatches();
  for (let i = matches.length - 1; i >= 0; i--) {
    const d = matches[i].loaderData as { alternate?: Record<Lang, string | null> } | undefined;
    if (d?.alternate) return d.alternate;
  }
  const base = stripLang(pathname) + search;
  return { en: base, hi: base };
}

function LanguageSwitch({ compact }: { compact?: boolean }) {
  const lang = useLang();
  const alt = useAlternatePaths();
  const t = useT();
  const target: Lang = lang === "en" ? "hi" : "en";
  const path = alt[target];
  const label = target === "hi" ? "हिन्दी" : "English";

  if (!path) {
    return (
      <span className="btn-ghost cursor-not-allowed !px-3 !py-2 text-sm opacity-50" title={t("notInHindi")}>
        <Languages size={16} /> {!compact && label}
      </span>
    );
  }
  return (
    <Link to={withLang(target, path)} hrefLang={target} className="btn-ghost !px-3 !py-2 text-sm" aria-label={`${t("language")}: ${label}`}>
      <Languages size={16} /> {label}
    </Link>
  );
}

export function Header() {
  const lang = useLang();
  const t = useT();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Which section the visitor is in (the Sarkari item is a jump link, never "current")
  const section = stripLang(pathname);
  const nav = [
    { to: withLang(lang, "/"), label: t("navHome"), active: section === "/" || section === "" },
    { to: withLang(lang, "/calculators"), label: t("navCalculators"), active: section === "/calculators" || section.startsWith("/calculators/") },
    // Life questions hidden for now. To restore: uncomment the next line.
    // { to: withLang(lang, `/tools/${TOOLS[0].slug}`), label: t("navTools"), active: section.startsWith("/tools/") },
    { to: withLang(lang, "/blogs"), label: t("navBlog"), active: section === "/blogs" || section.startsWith("/blogs") || section.startsWith("/blog/") },
    // Sarkari Naukri nav item hidden for now. To restore: uncomment the next line.
    // { to: `${withLang(lang, "/calculators")}#sarkari`, label: t("navSarkari"), active: false },
  ];
  // Lumi (AI astrologer): on the home page it floats in the corner instead; hidden on its own page
  const showLumi = section !== "/" && section !== "" && section !== "/lumi";

  return (
    <header
      className={`sticky top-0 z-50 transition-[background,border-color,backdrop-filter] duration-300 ${
        scrolled || open ? "border-b-2 border-fg bg-ink/90 backdrop-blur-xl" : "border-b-2 border-fg bg-ink"
      }`}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-gold focus:px-3 focus:py-2 focus:text-on-gold">
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to={withLang(lang, "/")} aria-label="Ambara home" className="shrink-0">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              aria-current={n.active ? "page" : undefined}
              className={`relative rounded-full px-4 py-2 text-[0.95rem] font-bold transition-colors ${n.active ? "text-on-gold" : "text-star hover:bg-fg/[0.08]"}`}
            >
              {n.active && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full border-2 border-fg bg-gold" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {showLumi && (
            <Link
              to="/lumi"
              aria-label="Ask Lumi, Ambara’s AI astrologer"
              className="group flex items-center gap-2 rounded-full border-2 border-fg bg-[var(--p-card)] p-0.5 text-[0.9rem] font-extrabold transition-colors hover:bg-[#ffd66b] hover:text-[#17131f] sm:py-0.5 sm:pl-0.5 sm:pr-3.5"
            >
              <LumiMark size={32} />
              <span className="hidden sm:inline">Ask Lumi</span>
            </Link>
          )}
          <ThemeToggle />
          {/* Language switch hidden for now (English only). To restore: remove the comment markers around this block.
          <div className="hidden sm:block">
            <LanguageSwitch />
          </div>
          */}
          <button
            className="btn-ghost !p-2.5 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden md:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 pb-6 pt-2" aria-label="Mobile">
              {[
                ...nav,
                { to: "/lumi", label: "Ask Lumi (AI astrologer)" },
                // Life questions hidden for now. To restore: uncomment the lines below.
                // ...TOOLS.slice(1).map((tool) => ({ to: withLang(lang, `/tools/${tool.slug}`), label: tool.title[lang] })),
              ].map((n, i) => (
                <motion.div key={n.to + n.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                  <Link to={n.to} className="block rounded-xl px-3 py-3 text-base font-semibold text-star hover:bg-fg/5">
                    {n.label}
                  </Link>
                </motion.div>
              ))}
              {/* Language switch hidden for now (English only). To restore: remove the comment markers around this block.
              <div className="mt-3 px-3">
                <LanguageSwitch />
              </div>
              */}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
