import { serverEnv } from "~/lib/env.server";

// Crawling is blocked until ALLOW_INDEXING=true (launch on ambara.io). Admin and personal results are never crawled.
export function loader() {
  const body = serverEnv.allowIndexing
    ? `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /*/result\n\nSitemap: ${serverEnv.siteUrl}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
