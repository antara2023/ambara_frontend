// Meta tags for every page: title, description, canonical + hreflang (EN/HI), Open Graph, robots, JSON-LD.
// Until ALLOW_INDEXING=true, every page is "noindex" so the copied articles never compete with Vedaz in search.
import type { MetaDescriptor } from "react-router";
import type { Faq, Lang, PublicEnv } from "./types";

type SeoInput = {
  env: PublicEnv | undefined;
  lang: Lang;
  title: string;
  description?: string;
  /** Path of this page without the language prefix, e.g. "/calculators/nakshatra-calculator" */
  path: string;
  /** Path of the other-language page (without its prefix); omit when that page does not exist */
  alternatePath?: Record<Lang, string | undefined>;
  noindex?: boolean;
  faqs?: Faq[];
  breadcrumbs?: { name: string; path: string }[];
};

const BRAND = "Ambara";

export function seo({ env, lang, title, description, path, alternatePath, noindex, faqs, breadcrumbs }: SeoInput): MetaDescriptor[] {
  const site = env?.siteUrl || "";
  const url = (l: Lang, p: string) => `${site}${l === "hi" ? (p === "/" ? "/hi" : `/hi${p}`) : p}`;
  const canonical = url(lang, path);
  const fullTitle = title.includes(BRAND) ? title : `${title} | ${BRAND}`;
  const indexable = env?.allowIndexing && !noindex;

  const tags: MetaDescriptor[] = [
    { title: fullTitle },
    { name: "robots", content: indexable ? "index, follow, max-image-preview:large" : "noindex, nofollow" },
    { tagName: "link", rel: "canonical", href: canonical },
    { property: "og:site_name", content: BRAND },
    { property: "og:type", content: "website" },
    { property: "og:title", content: fullTitle },
    { property: "og:url", content: canonical },
    { property: "og:locale", content: lang === "hi" ? "hi_IN" : "en_IN" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: fullTitle },
  ];
  if (env?.googleSiteVerification) {
    tags.push({ name: "google-site-verification", content: env.googleSiteVerification });
  }
  if (description) {
    tags.push({ name: "description", content: description }, { property: "og:description", content: description }, { name: "twitter:description", content: description });
  }

  const alt = alternatePath ?? { en: path, hi: path };
  if (alt.en) tags.push({ tagName: "link", rel: "alternate", hrefLang: "en", href: url("en", alt.en) });
  if (alt.hi) tags.push({ tagName: "link", rel: "alternate", hrefLang: "hi", href: url("hi", alt.hi) });
  if (alt.en) tags.push({ tagName: "link", rel: "alternate", hrefLang: "x-default", href: url("en", alt.en) });

  if (faqs?.length) {
    tags.push({
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
      },
    });
  }
  if (breadcrumbs?.length) {
    tags.push({
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.name, item: url(lang, b.path) })),
      },
    });
  }
  return tags;
}

/** The public settings from the root loader, for use inside meta functions. */
export const envFromMatches = (matches: readonly ({ id: string; loaderData?: unknown } | undefined)[]): PublicEnv | undefined =>
  (matches.find((m) => m?.id === "root")?.loaderData as { env?: PublicEnv } | undefined)?.env;
