import { serverEnv } from "./env.server";
import type {
  WordPressAuthor,
  WordPressMedia,
  WordPressCategory,
  WordPressPost,
  RankMathHead,
} from "./wordpress";

export type {
  WordPressAuthor,
  WordPressMedia,
  WordPressCategory,
  WordPressPost,
  RankMathHead,
};

const TIMEOUT_MS = 6000;

export function getWordPressUrl(): string {
  return serverEnv.wordpressUrl || process.env.WORDPRESS_API_URL?.trim() || "";
}

const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, "").trim();

const cleanTitle = (html: string) =>
  html
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();

function parsePost(raw: any): WordPressPost {
  const content = raw.content?.rendered || "";
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(words / 200));

  const authorRaw = raw._embedded?.author?.[0];
  const author: WordPressAuthor = {
    id: authorRaw?.id || raw.author || 0,
    name: authorRaw?.name || "Ambara Editorial",
    avatar: authorRaw?.avatar_urls?.["96"] || authorRaw?.avatar_urls?.["48"],
    description: authorRaw?.description,
  };

  const mediaRaw = raw._embedded?.["wp:featuredmedia"]?.[0];
  const featuredMedia: WordPressMedia | null = mediaRaw?.source_url
    ? {
        url: mediaRaw.source_url,
        alt: mediaRaw.alt_text || cleanTitle(raw.title?.rendered || ""),
      }
    : null;

  const termsRaw = raw._embedded?.["wp:term"]?.[0] || [];
  const categories: WordPressCategory[] = termsRaw.map((t: any) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
  }));

  const excerptHtml = raw.excerpt?.rendered || "";
  const excerptText = stripHtml(excerptHtml).replace(/\[&hellip;\]$/, "…");

  return {
    id: raw.id,
    date: raw.date,
    modified: raw.modified,
    slug: raw.slug,
    status: raw.status,
    link: raw.link,
    title: cleanTitle(raw.title?.rendered || ""),
    contentHtml: content,
    excerptHtml,
    excerptText,
    author,
    featuredMedia,
    categories,
    readingTimeMinutes: readingTime,
  };
}

export async function fetchPosts(options: {
  page?: number;
  perPage?: number;
  search?: string;
  categorySlug?: string;
} = {}): Promise<{
  posts: WordPressPost[];
  total: number;
  totalPages: number;
  isConfigured: boolean;
}> {
  const wpUrl = getWordPressUrl();
  if (!wpUrl) {
    return { posts: [], total: 0, totalPages: 0, isConfigured: false };
  }

  const { page = 1, perPage = 9, search = "", categorySlug } = options;

  try {
    const params = new URLSearchParams({
      _embed: "1",
      page: String(page),
      per_page: String(perPage),
      status: "publish",
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (categorySlug) {
      // Resolve category slug to ID
      const catRes = await fetch(`${wpUrl}/wp-json/wp/v2/categories?slug=${encodeURIComponent(categorySlug)}`, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (catRes.ok) {
        const cats = await catRes.json();
        if (cats?.[0]?.id) {
          params.set("categories", String(cats[0].id));
        }
      }
    }

    const res = await fetch(`${wpUrl}/wp-json/wp/v2/posts?${params.toString()}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      return { posts: [], total: 0, totalPages: 0, isConfigured: true };
    }

    const total = Number(res.headers.get("X-WP-Total") || 0);
    const totalPages = Number(res.headers.get("X-WP-TotalPages") || 1);
    const data = await res.json();

    const posts = Array.isArray(data) ? data.map(parsePost) : [];
    return { posts, total, totalPages, isConfigured: true };
  } catch (err) {
    return { posts: [], total: 0, totalPages: 0, isConfigured: true };
  }
}

export async function fetchPostBySlug(slug: string): Promise<{
  post: WordPressPost | null;
  rankMath: RankMathHead | null;
  isConfigured: boolean;
}> {
  const wpUrl = getWordPressUrl();
  if (!wpUrl) {
    return { post: null, rankMath: null, isConfigured: false };
  }

  try {
    const res = await fetch(
      `${wpUrl}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1&status=publish`,
      {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    );

    if (!res.ok) {
      return { post: null, rankMath: null, isConfigured: true };
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return { post: null, rankMath: null, isConfigured: true };
    }

    const post = parsePost(data[0]);

    // Fetch Rank Math Head tags for this post
    let rankMath: RankMathHead | null = null;
    try {
      const rmUrl = `${wpUrl}/wp-json/rankmath/v1/getHead?url=${encodeURIComponent(post.link)}`;
      const rmRes = await fetch(rmUrl, { signal: AbortSignal.timeout(3000) });
      if (rmRes.ok) {
        const rmData = await rmRes.json();
        if (rmData && rmData.head) {
          rankMath = parseRankMathHtml(rmData.head);
        }
      }
    } catch {
      // Rank Math endpoint optional fallback
    }

    return { post, rankMath, isConfigured: true };
  } catch {
    return { post: null, rankMath: null, isConfigured: true };
  }
}

export async function fetchCategories(): Promise<WordPressCategory[]> {
  const wpUrl = getWordPressUrl();
  if (!wpUrl) return [];

  try {
    const res = await fetch(`${wpUrl}/wp-json/wp/v2/categories?per_page=30&hide_empty=true`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((c: any) => ({
      id: c.id,
      name: cleanTitle(c.name),
      slug: c.slug,
      count: c.count,
    }));
  } catch {
    return [];
  }
}

function parseRankMathHtml(html: string): RankMathHead {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i);

  // Extract JSON-LD scripts
  const jsonLdScripts: string[] = [];
  const scriptRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(html)) !== null) {
    if (match[1]) jsonLdScripts.push(match[1].trim());
  }

  return {
    rawHtml: html,
    title: titleMatch ? cleanTitle(titleMatch[1]) : undefined,
    description: descMatch ? descMatch[1] : undefined,
    canonical: canonicalMatch ? canonicalMatch[1] : undefined,
    ogTitle: ogTitleMatch ? ogTitleMatch[1] : undefined,
    ogDescription: ogDescMatch ? ogDescMatch[1] : undefined,
    ogImage: ogImgMatch ? ogImgMatch[1] : undefined,
    jsonLd: jsonLdScripts,
  };
}

export function formatWpDate(dateStr: string, locale = "en-US"): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
