export type WordPressAuthor = {
  id: number;
  name: string;
  avatar?: string;
  description?: string;
};

export type WordPressMedia = {
  url: string;
  alt: string;
};

export type WordPressCategory = {
  id: number;
  name: string;
  slug: string;
  count?: number;
};

export type WordPressPost = {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  link: string;
  title: string;
  contentHtml: string;
  excerptHtml: string;
  excerptText: string;
  author: WordPressAuthor;
  featuredMedia?: WordPressMedia | null;
  categories: WordPressCategory[];
  readingTimeMinutes: number;
};

export type RankMathHead = {
  rawHtml?: string;
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  jsonLd?: string[];
};

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
