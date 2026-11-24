import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  BookOpen,
  Calendar,
  Clock,
  Search,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  ExternalLink,
} from "lucide-react";
import type { Route } from "./+types/blog";
import {
  fetchPosts,
  fetchCategories,
} from "~/lib/wordpress.server";
import {
  formatWpDate,
  type WordPressPost,
  type WordPressCategory,
} from "~/lib/wordpress";
import { langFromRequest, useLang, withLang } from "~/lib/lang";
import { envFromMatches, seo } from "~/lib/seo";
import { Reveal } from "~/components/ui/Reveal";

export const headers: Route.HeadersFunction = () => ({
  "Cache-Control": "public, max-age=120, s-maxage=600, stale-while-revalidate=1200",
});

export async function loader({ request }: Route.LoaderArgs) {
  const lang = langFromRequest(request);
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const search = url.searchParams.get("q") || "";
  const categorySlug = url.searchParams.get("cat") || undefined;

  const [{ posts, total, totalPages, isConfigured }, categories] = await Promise.all([
    fetchPosts({ page, perPage: 9, search, categorySlug }),
    fetchCategories(),
  ]);

  return {
    lang,
    posts,
    total,
    totalPages,
    currentPage: page,
    search,
    categorySlug,
    categories,
    isConfigured,
  };
}

export const meta: Route.MetaFunction = ({ loaderData, matches }) => {
  const env = envFromMatches(matches);
  const lang = loaderData?.lang ?? "en";
  const isHi = lang === "hi";

  return seo({
    env,
    lang,
    path: "/blogs",
    title: isHi ? "अम्बरा ब्लॉग — ज्योतिषीय लेख एवं मार्गदर्शन" : "Ambara Journal — Vedic & Western Astrology Insights",
    description: isHi
      ? "ज्योतिष, ग्रह चाल, नक्षत्र और संबंधों पर गहन लेख एवं मार्गदर्शन।"
      : "In-depth astrology articles, planetary transits, zodiac compatibility guides, and cosmic wisdom curated by Ambara.",
    breadcrumbs: [
      { name: "Ambara", path: "/" },
      { name: isHi ? "ब्लॉग" : "Blogs", path: "/blogs" },
    ],
  });
};

function BlogCard({ post, lang }: { post: WordPressPost; lang: "en" | "hi" }) {
  const primaryCat = post.categories[0];
  const postUrl = withLang(lang, `/blog/${post.slug}`);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/40 hover:shadow-xl hover:shadow-pink-950/20">
      {/* Featured Media */}
      <Link to={postUrl} className="relative block aspect-[16/10] overflow-hidden bg-white/5">
        {post.featuredMedia ? (
          <img
            src={post.featuredMedia.url}
            alt={post.featuredMedia.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-950/30 via-night to-amber-950/30 text-haze">
            <Sparkles size={36} className="text-pink-400/40" />
          </div>
        )}
        {primaryCat && (
          <span className="absolute left-4 top-4 rounded-full bg-night/80 px-3 py-1 text-xs font-semibold text-pink-300 backdrop-blur-md border border-white/10">
            {primaryCat.name}
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-xs text-mist mb-3">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={13} className="text-haze" />
            <time dateTime={post.date}>{formatWpDate(post.date)}</time>
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} className="text-haze" />
            <span>{post.readingTimeMinutes} min read</span>
          </span>
        </div>

        <h2 className="font-display text-xl font-bold tracking-tight text-star transition-colors group-hover:text-pink-300 line-clamp-2">
          <Link to={postUrl}>{post.title}</Link>
        </h2>

        <p className="mt-2.5 flex-1 text-xs leading-relaxed text-mist line-clamp-3">
          {post.excerptText}
        </p>

        {/* Author & Read More */}
        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
          <span className="inline-flex items-center gap-2 text-xs text-mist font-medium">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-6 w-6 rounded-full object-cover border border-white/10"
              />
            ) : (
              <User size={14} className="text-haze" />
            )}
            <span className="truncate max-w-[130px]">{post.author.name}</span>
          </span>

          <Link
            to={postUrl}
            className="inline-flex items-center gap-1 text-xs font-semibold text-pink-400 transition group-hover:translate-x-0.5"
          >
            <span>Read</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function BlogIndex({ loaderData }: Route.ComponentProps) {
  const lang = useLang();
  const isHi = lang === "hi";
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(loaderData.search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set("q", searchInput.trim());
      params.set("page", "1");
    } else {
      params.delete("q");
    }
    setSearchParams(params);
  };

  const handleCategoryClick = (catSlug?: string) => {
    const params = new URLSearchParams(searchParams);
    if (catSlug) {
      params.set("cat", catSlug);
      params.set("page", "1");
    } else {
      params.delete("cat");
    }
    setSearchParams(params);
  };

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen py-10 sm:py-16">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mx-auto mb-8 max-w-6xl px-4 sm:px-6">
        <ol className="flex items-center gap-2 text-xs text-mist sm:text-sm">
          <li>
            <Link to={withLang(lang, "/")} className="hover:text-star">
              Ambara
            </Link>
          </li>
          <ChevronRight size={14} className="text-haze" />
          <li className="font-medium text-star" aria-current="page">
            {isHi ? "ब्लॉग" : "Blog"}
          </li>
        </ol>
      </nav>

      {/* Hero Header */}
      <header className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/25 bg-pink-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-pink-300">
          <BookOpen size={14} />
          <span>{isHi ? "अम्बरा पत्रिका" : "Ambara Journal"}</span>
        </div>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-star sm:text-5xl md:text-6xl">
          {isHi ? "ज्योतिष एवं ज्ञान" : "Cosmic Insights & Guides"}
        </h1>
        <p className="mt-4 text-base text-mist sm:text-lg">
          {isHi
            ? "वैदिक एवं पाश्चात्य ज्योतिष, ग्रह गोचर, अनुकूलता और जीवन पथ पर विचारशील लेख।"
            : "Deep dives into Vedic and Western astrology, relationship dynamics, planetary transits, and practical cosmic guidance."}
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mx-auto mt-8 max-w-lg">
          <div className="relative flex items-center rounded-2xl border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur-md transition focus-within:border-pink-500/60 focus-within:bg-white/[0.08]">
            <Search size={18} className="text-haze shrink-0 mr-3" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={isHi ? "लेख खोजें..." : "Search articles..."}
              className="w-full bg-transparent py-2 text-sm text-star outline-none placeholder:text-haze"
            />
            <button
              type="submit"
              className="ml-2 rounded-xl bg-pink-500/20 px-3.5 py-1.5 text-xs font-semibold text-pink-300 hover:bg-pink-500/30 transition"
            >
              {isHi ? "खोजें" : "Search"}
            </button>
          </div>
        </form>

        {/* Category Pills */}
        {loaderData.categories.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleCategoryClick(undefined)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                !loaderData.categorySlug
                  ? "bg-pink-500 text-white shadow-md shadow-pink-500/30"
                  : "bg-white/5 text-mist hover:bg-white/10 hover:text-star"
              }`}
            >
              All Articles
            </button>
            {loaderData.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  loaderData.categorySlug === cat.slug
                    ? "bg-pink-500 text-white shadow-md shadow-pink-500/30"
                    : "bg-white/5 text-mist hover:bg-white/10 hover:text-star"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
        {loaderData.posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {loaderData.posts.map((post) => (
                <BlogCard key={post.id} post={post} lang={lang} />
              ))}
            </div>

            {/* Pagination Controls */}
            {loaderData.totalPages > 1 && (
              <div className="mt-14 flex items-center justify-center gap-3">
                <button
                  disabled={loaderData.currentPage <= 1}
                  onClick={() => changePage(loaderData.currentPage - 1)}
                  className="btn-secondary inline-flex items-center gap-1.5 !rounded-xl !px-4 !py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <span className="font-mono text-xs text-mist px-3">
                  Page {loaderData.currentPage} of {loaderData.totalPages}
                </span>

                <button
                  disabled={loaderData.currentPage >= loaderData.totalPages}
                  onClick={() => changePage(loaderData.currentPage + 1)}
                  className="btn-secondary inline-flex items-center gap-1.5 !rounded-xl !px-4 !py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty or Setup State */
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center backdrop-blur-xl sm:p-12">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-pink-500/10 text-pink-400">
              <Sparkles size={28} />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold text-star">
              {loaderData.search
                ? "No articles matched your search"
                : "Astrology Articles Coming Soon"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              {loaderData.search
                ? `We couldn't find any articles matching "${loaderData.search}". Try searching another keyword or clear the filter.`
                : "Our writers are preparing articles on planetary alignments, kundli matching, and zodiac wisdom."}
            </p>

            {!loaderData.isConfigured && (
              <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-left text-xs leading-relaxed text-amber-200">
                <p className="font-semibold text-amber-300">
                  ⚡ Ready for WordPress &amp; Rank Math:
                </p>
                <p className="mt-1 text-mist">
                  To stream articles into this page, set <code className="text-amber-300">WORDPRESS_API_URL</code> in your <code className="text-amber-300">.env</code> (e.g. <code className="text-amber-300">https://cms.ambara.io</code>). Posts published in WordPress will instantly appear here with Rank Math SEO!
                </p>
              </div>
            )}

            <div className="mt-8 flex justify-center gap-4">
              <Link to={withLang(lang, "/calculators")} className="btn-primary !rounded-xl !px-6 !py-2.5 text-xs">
                Explore Calculators
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
