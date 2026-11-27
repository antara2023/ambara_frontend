import { useMemo } from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import type { Route } from "./+types/calculator";
import { fetchCalculator, fetchCalculatorList } from "~/lib/api.server";
import { buildHub, CORE, examKey, JAIMINI, SARKARI_GROUPS, type IconName } from "~/lib/catalog";
import { translate, useT } from "~/lib/i18n";
import { langFromRequest, withLang } from "~/lib/lang";
import { buildSlugIndex } from "~/lib/links";
import { envFromMatches, seo } from "~/lib/seo";
import type { CalculatorListItem, Lang } from "~/lib/types";
import { categoryDef } from "~/lib/western";
import { CalculatorForm } from "~/components/form/CalculatorForm";
import { Article, headingsOf } from "~/components/content/Article";
import { Faqs } from "~/components/content/Faqs";
import { Toc } from "~/components/content/Toc";
import { CalculatorCard } from "~/components/calc/Cards";
import { IconBadge } from "~/components/ui/Icon";
import { Reveal } from "~/components/ui/Reveal";

export const headers: Route.HeadersFunction = () => ({
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
});

const lite = (l: CalculatorListItem[]) => l.map(({ slug, calculatorId }) => ({ slug, calculatorId }));

function lookOf(c: Pick<CalculatorListItem, "calculatorId"> & Partial<CalculatorListItem>): { icon: IconName; hue: number } {
  const def = categoryDef(c.calculatorId) || [...CORE, ...JAIMINI].find((d) => d.id === c.calculatorId);
  if (def) return def;
  const group = SARKARI_GROUPS.find((g) => g.exams.includes(examKey(c)));
  return group ? { icon: group.icon, hue: group.hue } : { icon: "sparkles", hue: 250 };
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const lang = langFromRequest(request);
  const otherLang: Lang = lang === "en" ? "hi" : "en";
  const [content, list, otherList] = await Promise.all([
    fetchCalculator(params.slug, lang),
    fetchCalculatorList(lang),
    fetchCalculatorList(otherLang).catch(() => [] as CalculatorListItem[]),
  ]);

  // "Try next": neighbours from the same section
  const hub = buildHub(list);
  const group = hub.sarkari.find((g) => g.items.some((c) => c.calculatorId === content.calculatorId));
  const category = hub.categories.find((g) => g.items.some((c) => c.calculatorId === content.calculatorId));
  const pool = group ? group.items : category ? category.items : [...hub.core, ...hub.jaimini];
  const at = pool.findIndex((c) => c.calculatorId === content.calculatorId);
  const related = [1, 2, 3].map((n) => pool[(Math.max(at, 0) + n) % pool.length]).filter((c, i, a) => c && c.calculatorId !== content.calculatorId && a.indexOf(c) === i);

  const self = `/calculators/${content.slug}`;
  const other = content.alternate ? `/calculators/${content.alternate.slug}` : null;
  return {
    lang,
    content,
    related: related.map((c) => ({ ...c, ...lookOf(c) })),
    look: lookOf(content),
    slugs: { [lang]: lite(list), [otherLang]: lite(otherList) } as Record<Lang, { slug: string; calculatorId: string }[]>,
    alternate: { en: lang === "en" ? self : other, hi: lang === "hi" ? self : other },
  };
}

export const meta: Route.MetaFunction = ({ loaderData, matches }) => {
  if (!loaderData) return [{ title: "Ambara" }];
  const { content, lang, alternate } = loaderData;
  return seo({
    env: envFromMatches(matches),
    lang,
    path: `/calculators/${content.slug}`,
    alternatePath: { en: alternate.en ?? undefined, hi: alternate.hi ?? undefined },
    title: content.seo?.metaTitle || content.hero?.h1 || content.name,
    description: content.seo?.metaDescription || content.hero?.subtitle,
    faqs: content.faqs,
    breadcrumbs: [
      { name: "Ambara", path: "/" },
      { name: translate(lang, "allCalculatorsTitle"), path: "/calculators" },
      { name: content.hero?.h1 || content.name, path: `/calculators/${content.slug}` },
    ],
  });
};

export default function CalculatorPage({ loaderData }: Route.ComponentProps) {
  const { content, lang, related, look, slugs } = loaderData;
  const t = useT();
  const slugIndex = useMemo(() => buildSlugIndex(slugs), [slugs]);
  const headings = useMemo(() => headingsOf(content.contentMarkdown || ""), [content.contentMarkdown]);

  return (
    <>
      {/* Hero + form */}
      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:pt-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Breadcrumb" className="rise mb-6 flex flex-wrap items-center gap-1 text-sm text-haze">
            <Link to={withLang(lang, "/calculators")} className="hover:text-star">
              {t("navCalculators")}
            </Link>
            <ChevronRight size={14} />
            <span className="text-mist" aria-current="page">
              {content.hero?.h1?.split(/[:|–—]\s/)[0] || content.name}
            </span>
          </nav>
          <div className="rise [animation-delay:60ms]">
            <IconBadge name={look.icon} hue={look.hue} size={56} />
          </div>
          <h1 className="rise mt-6 font-display text-[2.1rem] font-semibold leading-[1.1] tracking-tight text-star [animation-delay:120ms] sm:text-5xl">{content.hero?.h1 || content.name}</h1>
          {content.hero?.subtitle && <p className="rise mt-5 max-w-xl text-lg leading-relaxed text-mist [animation-delay:180ms]">{content.hero.subtitle}</p>}
        </div>
        <div className="rise [animation-delay:160ms]">
          <CalculatorForm slug={content.slug} lang={lang} customFields={content.customFields || []} calculatorType={content.compute?.calculatorType} />
        </div>
      </section>

      {/* Static Article content & On This Page table of contents commented out for all calculators.
          To restore: uncomment the section below.
      {content.contentMarkdown && (
        <section aria-label={t("readArticle")} className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[230px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Toc headings={headings} />
            </div>
          </aside>
          <div className="panel min-w-0 p-6 sm:p-10">
            <Article markdown={content.contentMarkdown} slugIndex={slugIndex} />
          </div>
        </section>
      )}
      */}

      {/* Static FAQs section commented out for all calculators.
          To restore: uncomment the section below.
      {content.faqs?.length > 0 && (
        <section className="mx-auto mt-20 max-w-3xl px-4 sm:px-6" aria-labelledby="faq">
          <Reveal>
            <h2 id="faq" className="mb-8 text-center font-display text-3xl font-semibold text-star">
              {t("faqTitle")}
            </h2>
          </Reveal>
          <Faqs faqs={content.faqs} />
        </section>
      )}
      */}

      {/* Try next section commented out. To restore: uncomment below.
      {related.length > 0 && (
        <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6" aria-labelledby="related">
          <h2 id="related" className="mb-6 font-display text-2xl font-semibold text-star">
            {t("related")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c, i) => (
              <Reveal key={c.calculatorId} delay={i * 0.06} className="h-full">
                <CalculatorCard item={c} lang={lang} icon={c.icon} hue={c.hue} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
      */}
    </>
  );
}
