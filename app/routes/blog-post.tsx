import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Copy,
  Check,
  User,
  Sparkles,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import type { Route } from "./+types/blog-post";
import { fetchPostBySlug } from "~/lib/wordpress.server";
import { formatWpDate } from "~/lib/wordpress";
import { langFromRequest, useLang, withLang } from "~/lib/lang";
import { envFromMatches, seo } from "~/lib/seo";
import { useToast } from "~/components/ui/Toaster";
import { Reveal } from "~/components/ui/Reveal";

export const headers: Route.HeadersFunction = () => ({
  "Cache-Control": "public, max-age=120, s-maxage=600, stale-while-revalidate=1200",
});

export async function loader({ request, params }: Route.LoaderArgs) {
  const lang = langFromRequest(request);
  const slug = params.slug || "";

  const { post, rankMath } = await fetchPostBySlug(slug);
  if (!post) {
    throw new Response("Post Not Found", { status: 404 });
  }

  return { lang, post, rankMath };
}

export const meta: Route.MetaFunction = ({ loaderData, matches }) => {
  const env = envFromMatches(matches);
  const lang = loaderData?.lang ?? "en";
  const post = loaderData?.post;
  const rankMath = loaderData?.rankMath;

  if (!post) {
    return [{ title: "Post Not Found | Ambara" }];
  }

  // Prefer Rank Math's exact compiled SEO tags if available
  const title = rankMath?.title || `${post.title} | Ambara`;
  const description = rankMath?.description || post.excerptText;

  const baseTags = seo({
    env,
    lang,
    path: `/blog/${post.slug}`,
    title,
    description,
    breadcrumbs: [
      { name: "Ambara", path: "/" },
      { name: "Blogs", path: "/blogs" },
      { name: post.title, path: `/blog/${post.slug}` },
    ],
  });

  // Inject any custom Rank Math JSON-LD Schema scripts
  if (rankMath?.jsonLd && rankMath.jsonLd.length > 0) {
    rankMath.jsonLd.forEach((jsonStr) => {
      try {
        const parsed = JSON.parse(jsonStr);
        baseTags.push({
          "script:ld+json": parsed,
        });
      } catch {
        // ignore
      }
    });
  }

  return baseTags;
};

export default function BlogPostRoute({ loaderData }: Route.ComponentProps) {
  const { post, rankMath } = loaderData;
  const lang = useLang();
  const isHi = lang === "hi";
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Article link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy link.");
    }
  };

  const handleWhatsAppShare = () => {
    const text = `📖 Read this on Ambara: ${post.title}\n\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const primaryCat = post.categories[0];

  return (
    <article className="relative min-h-screen py-10 sm:py-16">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mx-auto mb-8 max-w-3xl px-4 sm:px-6">
        <ol className="flex items-center gap-2 text-xs text-mist sm:text-sm">
          <li>
            <Link to={withLang(lang, "/")} className="hover:text-star">
              Ambara
            </Link>
          </li>
          <ChevronRight size={14} className="text-haze" />
          <li>
            <Link to={withLang(lang, "/blogs")} className="hover:text-star">
              {isHi ? "ब्लॉग" : "Blogs"}
            </Link>
          </li>
          <ChevronRight size={14} className="text-haze" />
          <li className="font-medium text-star truncate max-w-[200px]" aria-current="page">
            {post.title}
          </li>
        </ol>
      </nav>

      {/* Article Header */}
      <header className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          {primaryCat && (
            <span className="rounded-full bg-pink-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-pink-300 border border-pink-500/20">
              {primaryCat.name}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs text-mist">
            <Calendar size={13} className="text-haze" />
            <time dateTime={post.date}>{formatWpDate(post.date)}</time>
          </span>
          <span className="text-haze">•</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-mist">
            <Clock size={13} className="text-haze" />
            <span>{post.readingTimeMinutes} min read</span>
          </span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-star sm:text-4xl md:text-5xl leading-tight">
          {post.title}
        </h1>

        {/* Author Bio Bar */}
        <div className="mt-6 flex items-center justify-between border-y border-white/10 py-4">
          <div className="flex items-center gap-3">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-10 w-10 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-full bg-pink-500/10 font-bold text-pink-300">
                <User size={18} />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-star">{post.author.name}</p>
              <p className="text-xs text-mist">Ambara Astrological Contributor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Copy link"
              className="btn-ghost !p-2 text-mist hover:text-star"
              aria-label="Copy article link"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>
            <button
              onClick={handleWhatsAppShare}
              title="Share on WhatsApp"
              className="btn-ghost !p-2 text-mist hover:text-emerald-400"
              aria-label="Share on WhatsApp"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Featured Media */}
      {post.featuredMedia && (
        <div className="mx-auto mt-8 max-w-4xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-pink-950/20">
            <img
              src={post.featuredMedia.url}
              alt={post.featuredMedia.alt}
              className="w-full object-cover max-h-[500px]"
            />
          </div>
        </div>
      )}

      {/* Main Post Content */}
      <main className="mx-auto mt-10 max-w-3xl px-4 sm:px-6">
        <div
          className="prose prose-invert prose-pink max-w-none text-base leading-relaxed text-mist [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-star [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-star [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1.5 [&_blockquote]:border-l-4 [&_blockquote]:border-pink-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-pink-200 [&_blockquote]:bg-pink-500/5 [&_blockquote]:py-2 [&_blockquote]:rounded-r-xl [&_a]:text-pink-400 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-pink-300 [&_table]:w-full [&_table]:my-6 [&_th]:border [&_th]:border-white/10 [&_th]:p-3 [&_th]:bg-white/5 [&_th]:text-star [&_td]:border [&_td]:border-white/10 [&_td]:p-3 [&_img]:rounded-2xl [&_img]:my-6"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* Share & Action Bar */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
          <Link
            to={withLang(lang, "/blog")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-mist hover:text-star transition"
          >
            <ArrowLeft size={14} />
            <span>Back to All Articles</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="btn-secondary inline-flex items-center gap-2 !rounded-xl !px-4 !py-2 text-xs"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? "Link Copied" : "Copy Link"}</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-500"
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Explore Calculators Callout Banner */}
        <div className="mt-12 rounded-3xl border border-pink-500/30 bg-gradient-to-br from-pink-950/20 via-night to-amber-950/20 p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex items-center gap-2.5 text-pink-300">
            <Sparkles size={20} />
            <h3 className="font-display text-lg font-bold text-star sm:text-xl">
              Calculate Your Own Celestial Alignments
            </h3>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-mist">
            Ambara provides 60+ free Vedic and Western astrology calculators — from full birth charts and Big Three to Kundli matching and Love Compatibility.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to={withLang(lang, "/calculators")}
              className="btn-primary !rounded-xl !px-5 !py-2.5 text-xs font-semibold inline-flex items-center gap-2"
            >
              <span>Explore All Calculators</span>
              <ChevronRight size={14} />
            </Link>
            <Link
              to={withLang(lang, "/lumi")}
              className="btn-secondary !rounded-xl !px-5 !py-2.5 text-xs font-semibold inline-flex items-center gap-2"
            >
              <MessageCircle size={14} />
              <span>Ask Lumi (AI Astrologer)</span>
            </Link>
          </div>
        </div>
      </main>
    </article>
  );
}
