import { useDeferredValue, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { buildHub, cardTitle, examKey, examLabel, type HubSections } from "~/lib/catalog";
import { useT } from "~/lib/i18n";
import { TOOLS } from "~/lib/tools";
import type { CalculatorListItem, Lang } from "~/lib/types";
import { IconBadge } from "~/components/ui/Icon";
import { Reveal } from "~/components/ui/Reveal";
import { CalculatorCard, ExamChip, ToolCard } from "./Cards";

function SectionHead({ id, eyebrow, title, text }: { id: string; eyebrow?: string; title: string; text: string }) {
  return (
    <Reveal className="mb-8 max-w-2xl">
      <h2 id={id} className="scroll-mt-24 font-display text-3xl font-semibold tracking-tight text-star sm:text-4xl">
        {eyebrow && <span className="eyebrow mb-3 block font-sans">{eyebrow}</span>}
        {title}
      </h2>
      <p className="mt-3 text-mist">{text}</p>
    </Reveal>
  );
}

const normalise = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}\s]/gu, " ");

function matches(item: CalculatorListItem, q: string) {
  const hay = normalise(`${cardTitle(item)} ${item.slug} ${examLabel(examKey(item))} ${item.hero?.subtitle || ""}`);
  return normalise(q).split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
}

export function Hub({ list, lang, sections = ["popular", "categories", "tools", "core", "sarkari", "jaimini"] }: { list: CalculatorListItem[]; lang: Lang; sections?: string[] }) {
  const t = useT();
  const hub: HubSections = useMemo(() => buildHub(list), [list]);
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query.trim());

  const results = useMemo(() => {
    if (!q) return null;
    const all = [...hub.categories.flatMap((c) => c.items), ...hub.core, ...hub.jaimini];
    return {
      calculators: all.filter((c) => matches(c, q)),
      exams: hub.sarkari.flatMap((g) => g.items.filter((c) => matches(c, q)).map((c) => ({ c, hue: g.group.hue }))),
      tools: TOOLS.filter((tool) => normalise(`${tool.title.en} ${tool.title.hi} ${tool.tag.en}`).includes(normalise(q))),
    };
  }, [q, hub]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Search */}
      <div className="relative z-30 mb-14">
        <label className="panel relative mx-auto flex max-w-2xl items-center gap-3 !rounded-full !bg-night/80 px-5 py-1.5 focus-within:border-gold/60">
          <Search size={18} className="shrink-0 text-gold" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full bg-transparent py-2.5 text-star outline-none placeholder:text-haze [&::-webkit-search-cancel-button]:hidden"
            aria-label={t("searchPlaceholder")}
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search" className="text-haze hover:text-star">
              <X size={18} />
            </button>
          )}
        </label>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {results ? (
          <motion.section key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} aria-live="polite">
            {results.calculators.length + results.exams.length + results.tools.length === 0 ? (
              <p className="py-16 text-center text-mist">{t("noMatches")}</p>
            ) : (
              <div className="space-y-10">
                {results.tools.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {results.tools.map((tool) => <ToolCard key={tool.slug} tool={tool} lang={lang} />)}
                  </div>
                )}
                {results.calculators.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results.calculators.map((c) => <CalculatorCard key={c.calculatorId} item={c} lang={lang} icon={c.icon} hue={c.hue} />)}
                  </div>
                )}
                {results.exams.length > 0 && (
                  <div className="flex flex-wrap gap-2.5">
                    {results.exams.map(({ c, hue }) => <ExamChip key={c.calculatorId} item={c} lang={lang} hue={hue} />)}
                  </div>
                )}
              </div>
            )}
          </motion.section>
        ) : (
          <motion.div key="sections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-24">
            {/* Most popular: a shortcut to cards that also appear in their category (same link and title) */}
            {sections.includes("popular") && hub.popular.length > 0 && (
              <section aria-labelledby="popular">
                <SectionHead id="popular" title={t("sectionPopular")} text={t("sectionPopularText")} />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {hub.popular.map((c, i) => (
                    <Reveal key={c.calculatorId} delay={(i % 3) * 0.06} className="h-full">
                      <CalculatorCard item={c} lang={lang} icon={c.icon} hue={c.hue} />
                    </Reveal>
                  ))}
                </div>
              </section>
            )}

            {sections.includes("categories") &&
              hub.categories.map((cat) => (
                <section key={cat.key} aria-labelledby={cat.key}>
                  <SectionHead id={cat.key} title={cat.title[lang]} text={cat.text[lang]} />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cat.items.map((c, i) => (
                      <Reveal key={c.calculatorId} delay={(i % 3) * 0.06} className="h-full">
                        <CalculatorCard item={c} lang={lang} icon={c.icon} hue={c.hue} />
                      </Reveal>
                    ))}
                  </div>
                </section>
              ))}

            {sections.includes("tools") && (
              <section aria-labelledby="tools">
                <SectionHead id="tools" title={t("sectionTools")} text={t("sectionToolsText")} />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {TOOLS.map((tool, i) => (
                    <Reveal key={tool.slug} delay={i * 0.05} className="h-full">
                      <ToolCard tool={tool} lang={lang} />
                    </Reveal>
                  ))}
                </div>
              </section>
            )}

            {sections.includes("core") && hub.core.length > 0 && (
              <section aria-labelledby="core">
                <SectionHead id="core" title={t("sectionCore")} text={t("sectionCoreText")} />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {hub.core.map((c, i) => (
                    <Reveal key={c.calculatorId} delay={(i % 3) * 0.06} className="h-full">
                      <CalculatorCard item={c} lang={lang} icon={c.icon} hue={c.hue} />
                    </Reveal>
                  ))}
                </div>
              </section>
            )}

            {/* Sarkari Naukri section hidden for now. To restore: remove the comment markers around this block.
            {sections.includes("sarkari") && hub.sarkari.length > 0 && (
              <section aria-labelledby="sarkari">
                <SectionHead id="sarkari" title={t("sectionSarkari")} text={t("sectionSarkariText")} />
                <div className="grid gap-4 md:grid-cols-2">
                  {hub.sarkari.map(({ group, items }, i) => (
                    <Reveal key={group.key} delay={(i % 2) * 0.06} className="panel h-full p-6">
                      <div className="flex items-start gap-4">
                        <IconBadge name={group.icon} hue={group.hue} size={40} />
                        <div>
                          <h3 className="font-display text-lg font-semibold text-star">{group.title[lang]}</h3>
                          <p className="mt-1 text-sm text-mist">{group.note[lang]}</p>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {items.map((c) => <ExamChip key={c.calculatorId} item={c} lang={lang} hue={group.hue} />)}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </section>
            )}
            */}

            {sections.includes("jaimini") && hub.jaimini.length > 0 && (
              <section aria-labelledby="jaimini">
                <SectionHead id="jaimini" title={t("sectionJaimini")} text={t("sectionJaiminiText")} />
                <div className="grid gap-4 sm:grid-cols-2">
                  {hub.jaimini.map((c, i) => (
                    <Reveal key={c.calculatorId} delay={i * 0.06} className="h-full">
                      <CalculatorCard item={c} lang={lang} icon={c.icon} hue={c.hue} />
                    </Reveal>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
