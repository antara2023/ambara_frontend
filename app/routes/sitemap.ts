import { fetchCalculatorList } from "~/lib/api.server";
import { HIDDEN_IDS } from "~/lib/catalog";
import { serverEnv } from "~/lib/env.server";
import { TOOLS } from "~/lib/tools";
import type { CalculatorListItem } from "~/lib/types";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Every public page in both languages, with hreflang pairs. Result pages are personal and never listed.
export async function loader() {
  const site = serverEnv.siteUrl;
  const [en, hi] = await Promise.all([fetchCalculatorList("en"), fetchCalculatorList("hi").catch(() => [] as CalculatorListItem[])]);
  const hiById = new Map(hi.map((c) => [c.calculatorId, c.slug]));

  type Entry = { en?: string; hi?: string };
  const entries: Entry[] = [
    { en: "/", hi: "/hi" },
    { en: "/calculators", hi: "/hi/calculators" },
    { en: "/calculators/love-calculator", hi: "/hi/calculators/love-calculator" },
    ...TOOLS.map((t) => ({ en: `/tools/${t.slug}`, hi: `/hi/tools/${t.slug}` })),
    ...en
      .filter((c) => !HIDDEN_IDS.has(c.calculatorId) && c.slug !== "love-calculator")
      .map((c) => ({ en: `/calculators/${c.slug}`, hi: hiById.has(c.calculatorId) ? `/hi/calculators/${hiById.get(c.calculatorId)}` : undefined })),
    ...hi
      .filter((c) => !HIDDEN_IDS.has(c.calculatorId) && c.slug !== "love-calculator" && !en.some((e) => e.calculatorId === c.calculatorId))
      .map((c) => ({ hi: `/hi/calculators/${c.slug}` })),
  ];

  const urls = entries.flatMap((e) =>
    (["en", "hi"] as const)
      .filter((l) => e[l])
      .map((l) => {
        const alts = (["en", "hi"] as const)
          .filter((x) => e[x])
          .map((x) => `<xhtml:link rel="alternate" hreflang="${x}" href="${esc(site + e[x])}"/>`)
          .join("");
        return `<url><loc>${esc(site + e[l]!)}</loc>${alts}</url>`;
      }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
