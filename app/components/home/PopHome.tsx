// Home page in the "pop" design (bold borders, offset shadows, pastel category colours). Light and dark versions
// follow the site theme toggle; all styles are scoped to `.pop` in app.css so other pages are unchanged.
// Calculators, titles and links come from the database (catalog.ts / western.ts), exactly as on /calculators.
import { useMemo } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { buildHub, cardTitle } from "~/lib/catalog";
import { useT } from "~/lib/i18n";
import { withLang } from "~/lib/lang";
import { TOOLS } from "~/lib/tools";
import type { CalculatorListItem, Lang } from "~/lib/types";
import { CalculatorForm } from "~/components/form/CalculatorForm";
import { LumiLauncher } from "~/components/lumi/LumiLauncher";

const VS = "︎"; // text (not emoji) presentation for the symbols below
const GLYPH: Record<string, string> = {
  "birth-chart-calculator": "☉",
  "big-three-calculator": "✶",
  "sun-sign-calculator": "☉",
  "moon-sign-calculator": "☽",
  "rising-sign-calculator": "↑",
  "zodiac-compatibility-calculator": "∞",
  "synastry-chart-calculator": "☍",
  "composite-chart-calculator": "⊕",
  "venus-sign-calculator": "♀",
  "mars-sign-calculator": "♂",
  "black-moon-lilith-calculator": "⚸",
  "midheaven-calculator": "MC",
  "north-node-calculator": "☊",
  "life-path-number-calculator": "7",
  "astrocartography-calculator": "⌖",
  "part-of-fortune-calculator": "⊗",
  "jupiter-sign-calculator": "♃",
  "lucky-number-calculator": "#",
  "saturn-return-calculator": "♄",
  "solar-return-calculator": "☀",
  "transit-calculator": "⟳",
  "mercury-retrograde-calculator": "☿",
  "vedic-zodiac-sign-calculator": "✦",
  "nakshatra-calculator": "✧",
  atmakaraka: "☉",
  darakaraka: "♡",
};
const glyphOf = (id: string) => (GLYPH[id] || "✦") + (GLYPH[id]?.length === 1 ? VS : "");

/** Pastel tile colour per section (same in both themes; text on tiles is always dark). */
const TILE: Record<string, string> = {
  "core-chart": "#ffe08a",
  love: "#ffc9dc",
  career: "#c8f0d8",
  timing: "#bfe0ff",
  vedic: "#d9ccff",
  more: "#ffd9b8",
  tools: "#b9ecef",
};
const POPULAR_TILES = ["#ffe08a", "#d9ccff", "#bfe0ff", "#ffc9dc", "#c8f0d8", "#ffd9b8"];

const descOf = (c: CalculatorListItem) => c.listing?.shortDescription || c.hero?.subtitle || "";

function Glyph({ id, size = 40, tile }: { id: string; size?: number; tile: string }) {
  const g = glyphOf(id);
  return (
    <span aria-hidden className="pop-glyph" style={{ width: size, height: size, background: tile, fontSize: g.length > 2 ? size * 0.36 : size * 0.44 }}>
      {g}
    </span>
  );
}

export function PopHome({ list, lang }: { list: CalculatorListItem[]; lang: Lang }) {
  const t = useT();
  const hub = useMemo(() => buildHub(list), [list]);
  const total = hub.categories.reduce((n, c) => n + c.items.length, 0) + hub.core.length + hub.jaimini.length;
  const more = [...hub.core, ...hub.jaimini];

  // Hero form: the Birth Chart calculator (Nakshatra on Hindi pages, where the Western calculators are not available yet)
  const heroCalc =
    list.find((c) => c.calculatorId === "birth-chart-calculator") || list.find((c) => c.calculatorId === "nakshatra-calculator") || list[0];
  const heroType = heroCalc?.calculatorId === "birth-chart-calculator" ? "birthChart" : undefined;

  const sections = [
    ...hub.categories.map((c) => ({ key: c.key, title: c.title[lang], text: c.text[lang], items: c.items })),
    ...(more.length ? [{ key: "more", title: t("homeMore"), text: t("homeMoreText"), items: more }] : []),
  ];

  const jump = (id: string) => (e: React.MouseEvent) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 130, behavior: "smooth" });
  };

  return (
    <div className="pop-home">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 md:pb-20 md:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="pop-pill" style={{ background: "#ffd66b" }}>
              {t("homeBadgeCount").replace("{n}", String(total))}
            </span>
            <span className="pop-pill" style={{ background: "#c8f0d8" }}>
              {t("homeBadgeSystems")}
            </span>
            <span className="pop-pill" style={{ background: "#ffc9dc" }}>
              {t("homeBadgeFree")}
            </span>
          </div>
          <h1 className="pop-h1 mt-6">
            {lang === "hi" ? (
              t("heroTitle")
            ) : (
              <>
                {/* drawn above the highlight below, so the tails of letters like "y" are never covered */}
                <span className="relative z-[1]">your chart,</span>
                <br />
                <span className="pop-mark">read with care.</span>
              </>
            )}
          </h1>
          <p className="mt-7 max-w-xl text-lg font-medium leading-relaxed text-mist sm:text-[1.2rem]">{t("heroText")}</p>
        </div>
        {heroCalc && (
          <div id="chart" className="pop-form">
            <CalculatorForm slug={heroCalc.slug} lang={lang} customFields={[]} calculatorType={heroType} heading={heroType ? t("homeFormTitle") : undefined} />
          </div>
        )}
      </section>

      {/* Most popular */}
      {hub.popular.length > 0 && (
        <section aria-labelledby="popular" className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="popular" className="pop-h2">
              {t("sectionPopular").toLowerCase()}
            </h2>
            <a href="#all" onClick={jump("all")} className="pop-mono underline underline-offset-4">
              {t("homeSeeAll").replace("{n}", String(total))} →
            </a>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hub.popular.map((c, i) => (
              <Link key={c.calculatorId} to={withLang(lang, `/calculators/${c.slug}`)} className="pop-card pop-card-big" style={{ background: POPULAR_TILES[i % POPULAR_TILES.length] }}>
                <span className="flex items-center justify-between">
                  <Glyph id={c.calculatorId} size={58} tile="#ffffff" />
                  <ArrowUpRight size={22} aria-hidden />
                </span>
                <span className="mt-auto flex flex-col gap-1.5">
                  <span className="text-2xl font-extrabold leading-tight tracking-tight">{cardTitle(c)}</span>
                  <span className="line-clamp-2 text-base font-medium leading-snug opacity-85">{descOf(c)}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All calculators by category */}
      <section id="all" aria-labelledby="all-title" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-20 sm:px-6">
        <h2 id="all-title" className="pop-h2">
          {t("homeAll")}
        </h2>
        <nav aria-label={t("homeAll")} className="pop-chips">
          {sections.map((s) => (
            <a key={s.key} href={`#${s.key}`} onClick={jump(s.key)} className="pop-chip">
              <span className="pop-dot" style={{ background: TILE[s.key] }} />
              {s.title}
              <span className="pop-mono text-xs">{s.items.length}</span>
            </a>
          ))}
          {/* Life questions navigation link hidden for now. To restore: uncomment below.
          <a href="#tools" onClick={jump("tools")} className="pop-chip">
            <span className="pop-dot" style={{ background: TILE.tools }} />
            {t("sectionTools")}
            <span className="pop-mono text-xs">{TOOLS.length}</span>
          </a>
          */}
        </nav>

        {sections.map((s) => (
          <div key={s.key} id={s.key} className="scroll-mt-32 pt-11">
            <div className="flex flex-wrap items-center gap-3">
              <span className="pop-dot !h-[18px] !w-[18px]" style={{ background: TILE[s.key] }} />
              <h3 className="text-[1.9rem] font-extrabold leading-tight tracking-tight">{s.title}</h3>
              <span className="font-medium text-mist">{s.text}</span>
            </div>
            <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {s.items.map((c) => (
                <Link key={c.calculatorId} to={withLang(lang, `/calculators/${c.slug}`)} className="pop-card pop-card-small" style={{ "--tile": TILE[s.key] } as React.CSSProperties}>
                  <Glyph id={c.calculatorId} tile={TILE[s.key]} />
                  <span className="text-lg font-extrabold leading-tight tracking-tight">{cardTitle(c)}</span>
                  <span className="line-clamp-3 text-[0.95rem] font-medium leading-snug text-mist">{descOf(c)}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Life questions (AI tools) hidden for now. To restore: uncomment below.
        <div id="tools" className="scroll-mt-32 pt-11">
          <div className="flex flex-wrap items-center gap-3">
            <span className="pop-dot !h-[18px] !w-[18px]" style={{ background: TILE.tools }} />
            <h3 className="text-[1.9rem] font-extrabold leading-tight tracking-tight">{t("sectionTools")}</h3>
            <span className="font-medium text-mist">{t("sectionToolsText")}</span>
          </div>
          <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((tool) => (
              <Link key={tool.slug} to={withLang(lang, `/tools/${tool.slug}`)} className="pop-card pop-card-small" style={{ "--tile": TILE.tools } as React.CSSProperties}>
                <span className="pop-mono self-start rounded-full border-[1.5px] border-current px-2.5 py-0.5 text-[0.7rem]">{tool.tag[lang]}</span>
                <span className="text-lg font-extrabold leading-tight tracking-tight">{tool.title[lang]}</span>
                <span className="line-clamp-3 text-[0.95rem] font-medium leading-snug text-mist">{tool.description[lang]}</span>
              </Link>
            ))}
          </div>
        </div>
        */}
      </section>

      {/* Lumi, the AI astrologer, floating bottom-right */}
      <LumiLauncher />
    </div>
  );
}
