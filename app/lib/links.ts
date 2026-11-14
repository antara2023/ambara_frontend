// Articles were written for Vedaz and link to vedaz.io pages. When showing them on Ambara (without changing the
// stored text), links to calculators/tools that exist here point to the Ambara page; links to pages Ambara does
// not have (chat, kundli matching, …) are shown as plain text. Other websites' links open in a new tab.
import { TOOLS } from "./tools";
import { withLang } from "./lang";
import type { CalculatorListItem, Lang } from "./types";

export type LinkTarget = { kind: "internal"; to: string } | { kind: "external"; href: string } | { kind: "none" };

const VEDAZ_HOST = /^(?:https?:)?\/\/(?:www\.)?vedaz\.io(?=\/|$|\?|#)/i;

// Old Vedaz tool paths -> Ambara tool slugs
const TOOL_PATHS: Record<string, string> = {
  "when-will-my-ex-return": "will-my-ex-return",
  "will-my-ex-return": "will-my-ex-return",
  "when-will-i-get-a-government-job": "when-will-i-get-a-government-job",
  "when-will-i-get-married": "when-will-i-get-married",
  "when-will-i-get-a-job": "when-will-i-get-a-job",
};

export type SlugIndex = { slugs: Record<Lang, Set<string>>; byId: Record<Lang, Map<string, string>> };

export const buildSlugIndex = (lists: Partial<Record<Lang, Pick<CalculatorListItem, "slug" | "calculatorId">[]>>): SlugIndex => {
  const idx: SlugIndex = { slugs: { en: new Set(), hi: new Set() }, byId: { en: new Map(), hi: new Map() } };
  for (const lang of ["en", "hi"] as Lang[]) {
    for (const c of lists[lang] || []) {
      idx.slugs[lang].add(c.slug);
      idx.byId[lang].set(c.calculatorId, c.slug);
    }
  }
  return idx;
};

export function resolveLink(href: string | undefined, idx: SlugIndex): LinkTarget {
  if (!href) return { kind: "none" };
  if (href.startsWith("#")) return { kind: "internal", to: href };

  let path: string;
  if (VEDAZ_HOST.test(href)) path = href.replace(VEDAZ_HOST, "") || "/";
  else if (href.startsWith("/")) path = href;
  else if (/^(https?:)?\/\//i.test(href) || /^mailto:/i.test(href)) return { kind: "external", href };
  else return { kind: "none" };

  const [pathname, hash = ""] = path.split("#");
  const clean = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  const lang: Lang = /^\/hi(\/|$)/.test(clean) ? "hi" : "en";
  const rest = clean.replace(/^\/hi(?=\/|$)/, "") || "/";
  const anchor = hash ? `#${hash}` : "";
  const parts = rest.split("/").filter(Boolean);

  const calculatorPath = (slug: string) => {
    if (idx.slugs[lang].has(slug)) return withLang(lang, `/calculators/${slug}`) + anchor;
    const viaId = idx.byId[lang].get(slug) || idx.byId[lang].get(`sarkari-naukri-yog-${slug}`);
    return viaId ? withLang(lang, `/calculators/${viaId}`) + anchor : null;
  };

  if (parts.length === 0) return { kind: "internal", to: withLang(lang, "/") };

  if (parts[0] === "calculators") {
    if (parts.length === 1) return { kind: "internal", to: withLang(lang, "/calculators") + anchor };
    if (parts[1] === "sarkari-naukri-yog") {
      if (parts.length === 2) return { kind: "internal", to: withLang(lang, "/calculators") + "#sarkari" };
      const to = calculatorPath(parts[2]);
      return to ? { kind: "internal", to } : { kind: "none" };
    }
    const to = calculatorPath(parts[parts.length - 1]);
    return to ? { kind: "internal", to } : { kind: "none" };
  }

  if (parts.length === 1) {
    if (TOOL_PATHS[parts[0]] && TOOLS.some((t) => t.slug === TOOL_PATHS[parts[0]])) {
      return { kind: "internal", to: withLang(lang, `/tools/${TOOL_PATHS[parts[0]]}`) };
    }
    const to = calculatorPath(parts[0]);
    if (to) return { kind: "internal", to };
    if (parts[0] === "sarkari-naukri-yog") return { kind: "internal", to: withLang(lang, "/calculators") + "#sarkari" };
  }

  return { kind: "none" };
}
