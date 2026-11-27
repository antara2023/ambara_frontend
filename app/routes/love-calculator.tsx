import { useState, useId } from "react";
import { Link, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  Sparkles,
  Share2,
  Copy,
  Flame,
  Globe,
  Wind,
  Droplets,
  User,
  ArrowRight,
  RotateCcw,
  Check,
  ChevronRight,
  HelpCircle,
  AlertTriangle,
  Flame as FlameIcon,
  MessageCircle,
} from "lucide-react";
import type { Route } from "./+types/love-calculator";
import {
  calculateLoveCompatibility,
  getSunSign,
  type LoveCompatibilityResult,
  type ElementType,
} from "~/lib/loveCalculator";
import { langFromRequest, useLang, withLang } from "~/lib/lang";
import { envFromMatches, seo } from "~/lib/seo";
import { useToast } from "~/components/ui/Toaster";
import { Reveal } from "~/components/ui/Reveal";
import { Faqs } from "~/components/content/Faqs";
import loveContent from "~/data/loveCalculatorContent.json";

export const headers: Route.HeadersFunction = () => ({
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
});

export async function loader({ request }: Route.LoaderArgs) {
  const lang = langFromRequest(request);
  const url = new URL(request.url);
  const p1 = url.searchParams.get("p1") || "";
  const p2 = url.searchParams.get("p2") || "";
  const dob1 = url.searchParams.get("dob1") || "";
  const dob2 = url.searchParams.get("dob2") || "";

  let initialResult: LoveCompatibilityResult | null = null;
  if (p1.trim() && p2.trim()) {
    try {
      initialResult = calculateLoveCompatibility({
        partner1Name: p1,
        partner2Name: p2,
        partner1Dob: dob1,
        partner2Dob: dob2,
      });
    } catch {
      // ignore
    }
  }

  return {
    lang,
    params: { p1, p2, dob1, dob2 },
    initialResult,
  };
}

export const meta: Route.MetaFunction = ({ loaderData, matches }) => {
  const env = envFromMatches(matches);
  const lang = loaderData?.lang ?? "en";
  const isHi = lang === "hi";

  return seo({
    env,
    lang,
    path: "/calculators/love-calculator",
    title: isHi
      ? "लव कैलकुलेटर — 4-D स्कोर एवं राशि तालमेल"
      : "Love Calculator — Deterministic Match & Zodiac Synergy",
    description: isHi
      ? "सच्चा और सटीक लव कम्पैटिबिलिटी स्कोर जानें। नाम और जन्मतिथि द्वारा प्रेम, आकर्षण, मित्रता और संवाद की गहराई का विश्लेषण।"
      : "Discover deterministic love compatibility across romance, chemistry, friendship, communication, and zodiac elements. Accurate, instant, and shareable.",
    breadcrumbs: [
      { name: "Ambara", path: "/" },
      { name: isHi ? "कैलकुलेटर" : "Calculators", path: "/calculators" },
      { name: isHi ? "लव कैलकुलेटर" : "Love Calculator", path: "/calculators/love-calculator" },
    ],
    faqs: isHi ? undefined : loveContent.faqs,
  });
};

function ElementIcon({ element, size = 18 }: { element: ElementType; size?: number }) {
  switch (element) {
    case "Fire":
      return <Flame size={size} className="text-amber-400" />;
    case "Earth":
      return <Globe size={size} className="text-emerald-400" />;
    case "Air":
      return <Wind size={size} className="text-sky-300" />;
    case "Water":
      return <Droplets size={size} className="text-blue-400" />;
  }
}

function DimensionProgressBar({
  name,
  score,
  description,
  hue,
}: {
  name: string;
  score: number;
  description: string;
  hue: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4.5 backdrop-blur-md transition-all hover:border-white/20">
      <div className="flex items-center justify-between gap-4">
        <span className="font-medium text-star">{name}</span>
        <span
          className="font-mono text-lg font-bold tabular-nums"
          style={{ color: `hsl(${hue} 95% 72%)` }}
        >
          {score}%
        </span>
      </div>
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, hsl(${hue} 85% 55%), hsl(${hue + 25} 95% 68%))`,
          }}
        />
      </div>
      <p className="mt-2 text-xs text-mist">{description}</p>
    </div>
  );
}

export default function LoveCalculatorRoute({ loaderData }: Route.ComponentProps) {
  const lang = useLang();
  const isHi = lang === "hi";
  const toast = useToast();
  const [, setSearchParams] = useSearchParams();

  const [partner1Name, setPartner1Name] = useState(loaderData.params.p1);
  const [partner2Name, setPartner2Name] = useState(loaderData.params.p2);
  const [partner1Dob, setPartner1Dob] = useState(loaderData.params.dob1);
  const [partner2Dob, setPartner2Dob] = useState(loaderData.params.dob2);

  const [result, setResult] = useState<LoveCompatibilityResult | null>(loaderData.initialResult);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const p1Sign = getSunSign(partner1Dob);
  const p2Sign = getSunSign(partner2Dob);

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    const p1 = partner1Name.trim();
    const p2 = partner2Name.trim();

    if (!p1 || !p2) {
      setError(
        isHi
          ? "कृपया दोनों पार्टनर्स के नाम दर्ज करें।"
          : "Please enter both partner names to calculate compatibility."
      );
      return;
    }

    try {
      const computed = calculateLoveCompatibility({
        partner1Name: p1,
        partner2Name: p2,
        partner1Dob,
        partner2Dob,
      });
      setResult(computed);
      setIsEditing(false);

      // Update URL query parameters for shareability
      const params = new URLSearchParams();
      params.set("p1", p1);
      params.set("p2", p2);
      if (partner1Dob) params.set("dob1", partner1Dob);
      if (partner2Dob) params.set("dob2", partner2Dob);
      setSearchParams(params, { replace: true });

      // Smooth scroll to top of result
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Calculation failed.");
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(isHi ? "लिंक कॉपी हो गया!" : "Result link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error(isHi ? "कॉपी नहीं हो सका।" : "Could not copy link.");
    }
  };

  const handleWhatsAppShare = () => {
    if (!result) return;
    const text = isHi
      ? `💖 ${result.partner1Name} और ${result.partner2Name} का लव कम्पैटिबिलिटी स्कोर ${result.overallScore}% है!\n\nअपनी अनुकूलता यहां चेक करें: ${shareUrl}`
      : `💖 Love Compatibility Match for ${result.partner1Name} & ${result.partner2Name}: ${result.overallScore}% Match!\n\nCheck yours here: ${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleReset = () => {
    setResult(null);
    setIsEditing(false);
    setPartner1Name("");
    setPartner2Name("");
    setPartner1Dob("");
    setPartner2Dob("");
    setSearchParams(new URLSearchParams(), { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const heartId = useId().replace(/:/g, "");

  return (
    <div className="relative min-h-screen py-10 sm:py-16">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mx-auto mb-8 max-w-4xl px-4 sm:px-6">
        <ol className="flex items-center gap-2 text-xs text-mist sm:text-sm">
          <li>
            <Link to={withLang(lang, "/")} className="hover:text-star">
              Ambara
            </Link>
          </li>
          <ChevronRight size={14} className="text-haze" />
          <li>
            <Link to={withLang(lang, "/calculators")} className="hover:text-star">
              {isHi ? "कैलकुलेटर" : "Calculators"}
            </Link>
          </li>
          <ChevronRight size={14} className="text-haze" />
          <li className="font-medium text-star" aria-current="page">
            {isHi ? "लव कैलकुलेटर" : "Love Calculator"}
          </li>
        </ol>
      </nav>

      {/* Hero Header */}
      <header className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/25 bg-pink-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-pink-300">
          <Heart size={14} className="fill-pink-400 text-pink-400 animate-pulse" />
          <span>{isHi ? "सटीक लव कम्पैटिबिलिटी" : "Deterministic Cosmic Synergy"}</span>
        </div>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-star sm:text-5xl md:text-6xl">
          {isHi ? "लव कैलकुलेटर" : "Love Calculator"}
        </h1>
        <p className="mt-4 text-base text-mist sm:text-lg">
          {isHi
            ? "चार प्रमुख आयामों (प्रेम, शारीरिक आकर्षण, मित्रता, एवं संवाद) में अपनी सच्ची अनुकूलता और राशि तालमेल जानें।"
            : "Explore your multi-dimensional compatibility across love, chemistry, friendship, and communication with optional zodiac insights."}
        </p>
      </header>

      {/* Main Interactive Form Card: hidden on result screen */}
      {(!result || isEditing) && (
        <section className="mx-auto mt-10 max-w-3xl px-4 sm:px-6">
          <div className="panel relative overflow-hidden !rounded-3xl !bg-night/70 p-6 sm:p-10 backdrop-blur-xl">
            {/* Decorative Background Glows */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-pink-600/15 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl"
            />

            <form onSubmit={handleCalculate} className="relative z-10 space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                {/* Partner 1 Card */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm sm:p-6 transition-colors focus-within:border-pink-500/50">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold text-pink-300">
                      <User size={16} />
                      {isHi ? "पार्टनर 1 (आप)" : "Partner 1 (You)"}
                    </span>
                    {p1Sign && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-mist">
                        <span>{p1Sign.symbol}</span>
                        <span>{p1Sign.sign}</span>
                        <ElementIcon element={p1Sign.element} size={14} />
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="p1Name" className="block text-xs font-medium text-mist">
                        {isHi ? "पहला नाम" : "Full Name"}{" "}
                        <span className="text-pink-400">*</span>
                      </label>
                      <input
                        id="p1Name"
                        type="text"
                        required
                        value={partner1Name}
                        onChange={(e) => setPartner1Name(e.target.value)}
                        placeholder={isHi ? "उदा. राहुल" : "e.g. Alex"}
                        className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-star outline-none transition focus:border-pink-400 focus:bg-white/[0.08]"
                      />
                    </div>

                    <div>
                      <label htmlFor="p1Dob" className="flex items-center justify-between text-xs font-medium text-mist">
                        <span>{isHi ? "जन्मतिथि (वैकल्पिक)" : "Date of Birth (Optional)"}</span>
                        <span className="text-[10px] text-haze">{isHi ? "राशि हेतु" : "For Zodiac"}</span>
                      </label>
                      <div className="relative mt-1.5">
                        <input
                          id="p1Dob"
                          type="date"
                          value={partner1Dob}
                          onChange={(e) => setPartner1Dob(e.target.value)}
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-star outline-none transition focus:border-pink-400 focus:bg-white/[0.08]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Partner 2 Card */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm sm:p-6 transition-colors focus-within:border-pink-500/50">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold text-pink-300">
                      <User size={16} />
                      {isHi ? "पार्टनर 2" : "Partner 2"}
                    </span>
                    {p2Sign && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-mist">
                        <span>{p2Sign.symbol}</span>
                        <span>{p2Sign.sign}</span>
                        <ElementIcon element={p2Sign.element} size={14} />
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="p2Name" className="block text-xs font-medium text-mist">
                        {isHi ? "दूसरा नाम" : "Full Name"}{" "}
                        <span className="text-pink-400">*</span>
                      </label>
                      <input
                        id="p2Name"
                        type="text"
                        required
                        value={partner2Name}
                        onChange={(e) => setPartner2Name(e.target.value)}
                        placeholder={isHi ? "उदा. प्रिया" : "e.g. Jordan"}
                        className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-star outline-none transition focus:border-pink-400 focus:bg-white/[0.08]"
                      />
                    </div>

                    <div>
                      <label htmlFor="p2Dob" className="flex items-center justify-between text-xs font-medium text-mist">
                        <span>{isHi ? "जन्मतिथि (वैकल्पिक)" : "Date of Birth (Optional)"}</span>
                        <span className="text-[10px] text-haze">{isHi ? "राशि हेतु" : "For Zodiac"}</span>
                      </label>
                      <div className="relative mt-1.5">
                        <input
                          id="p2Dob"
                          type="date"
                          value={partner2Dob}
                          onChange={(e) => setPartner2Dob(e.target.value)}
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-star outline-none transition focus:border-pink-400 focus:bg-white/[0.08]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Central Heart Animation Indicator */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    boxShadow: [
                      "0 0 10px rgba(244, 63, 94, 0.2)",
                      "0 0 25px rgba(244, 63, 94, 0.6)",
                      "0 0 10px rgba(244, 63, 94, 0.2)",
                    ],
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-pink-500/40 bg-night text-pink-400"
                >
                  <Heart size={22} className="fill-pink-500" />
                </motion.div>
              </div>

              {error && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-center text-sm text-red-300">
                  {error}
                </p>
              )}

              {/* Submit Button */}
              <div className="pt-2 text-center flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="btn-primary group relative inline-flex items-center gap-3 overflow-hidden !rounded-2xl !bg-gradient-to-r !from-pink-600 !via-rose-600 !to-amber-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-500/25 transition hover:scale-[1.02] hover:shadow-pink-500/40 active:scale-[0.98]"
                >
                  <Sparkles size={18} className="transition-transform group-hover:rotate-12" />
                  <span>{isHi ? "अनुकूलता स्कोर देखें" : "Calculate Compatibility"}</span>
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
                {result && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-ghost !rounded-xl !px-5 !py-3 text-xs text-mist hover:text-star transition"
                  >
                    {isHi ? "रद्द करें एवं परिणाम देखें" : "Cancel & View Result"}
                  </button>
                )}
              </div>
              <p className="text-center text-xs text-haze">
                {isHi
                  ? "समान नाम हमेशा 100% स्थिर (deterministic) परिणाम देते हैं।"
                  : "Same names always yield the exact same deterministic result. No random generators."}
              </p>
            </form>
          </div>
        </section>
      )}

      {/* Result Section */}
      <AnimatePresence>
        {result && !isEditing && (
          <motion.section
            id="love-result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-14 max-w-4xl px-4 sm:px-6"
          >
            <div className="panel relative overflow-hidden !rounded-3xl !bg-night/85 p-6 sm:p-10 backdrop-blur-xl border border-pink-500/30 shadow-2xl shadow-pink-950/30">
              {/* Header */}
              <div className="text-center">
                <span className="inline-block rounded-full bg-pink-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-pink-300">
                  {isHi ? "अनुकूलता परिणाम" : "Compatibility Report"}
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-star sm:text-4xl md:text-5xl">
                  {result.partner1Name} & {result.partner2Name}:{" "}
                  <span className="text-pink-400">{result.overallScore}% Match</span>
                </h2>
                <p className="mt-3 text-base text-mist sm:text-lg">{result.overallTier}</p>
              </div>

              {/* Gauge & Main Percentage Display */}
              <div className="my-10 flex flex-col items-center justify-center">
                <div className="relative grid place-items-center">
                  <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
                    <defs>
                      <linearGradient id={heartId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f43f5e" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                    {/* Background Ring */}
                    <circle
                      cx="110"
                      cy="110"
                      r="90"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="14"
                    />
                    {/* Animated Progress Ring */}
                    <motion.circle
                      cx="110"
                      cy="110"
                      r="90"
                      fill="none"
                      stroke={`url(#${heartId})`}
                      strokeWidth="14"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 565.48" }}
                      animate={{
                        strokeDasharray: `${(result.overallScore / 100) * 565.48} 565.48`,
                      }}
                      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </svg>

                  {/* Inside Circle Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <Heart size={26} className="fill-pink-500 text-pink-500 animate-pulse" />
                    <span className="font-display text-5xl font-extrabold tracking-tight text-star">
                      {result.overallScore}%
                    </span>
                    <span className="text-xs uppercase tracking-wider text-haze">
                      {isHi ? "कुल स्कोर" : "Overall Match"}
                    </span>
                  </div>

                  <div
                    aria-hidden
                    className="absolute inset-8 -z-10 rounded-full bg-pink-500/20 blur-2xl"
                  />
                </div>
              </div>

              {/* 4 Multi-dimensional Breakdowns */}
              <div className="mt-8">
                <h3 className="mb-4 text-center font-display text-xl font-semibold text-star sm:text-2xl">
                  {isHi ? "चार प्रमुख आयामों का विश्लेषण" : "Multi-Dimensional Compatibility Breakdown"}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {result.dimensions.map((dim) => (
                    <DimensionProgressBar
                      key={dim.id}
                      name={dim.name}
                      score={dim.score}
                      description={dim.description}
                      hue={dim.hue}
                    />
                  ))}
                </div>
              </div>

              {/* Optional Astrological / Elemental Synergy */}
              {result.astrologicalSynergy && (
                <div className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 backdrop-blur-md">
                  <div className="flex items-center gap-2.5 text-amber-300">
                    <Sparkles size={18} />
                    <h3 className="font-display text-lg font-semibold sm:text-xl">
                      {isHi ? "राशि एवं तत्वीय अनुकूलता (Zodiac Synergy)" : "Zodiac & Elemental Synergy"}
                    </h3>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Partner 1 Sign */}
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs text-mist">{result.partner1Name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-2xl">{result.astrologicalSynergy.partner1.symbol}</span>
                        <div>
                          <p className="font-semibold text-star">
                            {result.astrologicalSynergy.partner1.sign}
                          </p>
                          <p className="flex items-center gap-1.5 text-xs text-mist">
                            <ElementIcon element={result.astrologicalSynergy.partner1.element} size={13} />
                            <span>{result.astrologicalSynergy.partner1.element} Element</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Partner 2 Sign */}
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs text-mist">{result.partner2Name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-2xl">{result.astrologicalSynergy.partner2.symbol}</span>
                        <div>
                          <p className="font-semibold text-star">
                            {result.astrologicalSynergy.partner2.sign}
                          </p>
                          <p className="flex items-center gap-1.5 text-xs text-mist">
                            <ElementIcon element={result.astrologicalSynergy.partner2.element} size={13} />
                            <span>{result.astrologicalSynergy.partner2.element} Element</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-center sm:text-left">
                    <p className="text-sm font-medium text-amber-200">
                      ✨ {result.astrologicalSynergy.insight}
                    </p>
                  </div>
                </div>
              )}

              {/* Action & Sharing Buttons */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4 border-t border-white/10 pt-8">
                <button
                  onClick={handleCopyLink}
                  className="btn-secondary inline-flex items-center gap-2 !rounded-xl !px-5 !py-2.5 text-sm"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  <span>{copied ? (isHi ? "कॉपी हो गया!" : "Copied!") : isHi ? "लिंक कॉपी करें" : "Copy Result Link"}</span>
                </button>

                <button
                  onClick={handleWhatsAppShare}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 active:scale-95 shadow-md shadow-emerald-950/40"
                >
                  <Share2 size={16} />
                  <span>{isHi ? "WhatsApp पर शेयर करें" : "Share on WhatsApp"}</span>
                </button>

                <button
                  onClick={() => {
                    setIsEditing(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="btn-secondary inline-flex items-center gap-2 !rounded-xl !px-5 !py-2.5 text-sm"
                >
                  <RotateCcw size={15} />
                  <span>{isHi ? "विवरण बदलें" : "Edit Names"}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="btn-ghost inline-flex items-center gap-2 !rounded-xl !px-4 !py-2.5 text-sm text-mist hover:text-star"
                >
                  <RotateCcw size={15} />
                  <span>{isHi ? "नया मिलान देखें" : "Calculate Another"}</span>
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Editorial Article Section commented out. To restore: set showEditorial to true */}
      {false && (
        <article className="mx-auto mt-24 max-w-4xl px-4 sm:px-6">
        <Reveal>
          <div className="border-t border-white/10 pt-12">
            {/* Author Byline */}
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-sm font-semibold tracking-wide text-star">
                {loveContent.title}
              </span>
              <span className="text-xs font-medium text-pink-300">
                {loveContent.author.byline}
              </span>
            </div>

            {/* Introduction */}
            <div className="space-y-4 text-base leading-relaxed text-mist">
              {loveContent.intro.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* How to Use Ambara's Love Calculator */}
            <div className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-star sm:text-3xl">
                {loveContent.howToUse.title}
              </h2>
              <p className="mt-2 text-sm text-mist">{loveContent.howToUse.description}</p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {loveContent.howToUse.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-pink-500/10 font-mono text-xs font-bold text-pink-300">
                      {idx + 1}
                    </span>
                    <h3 className="mt-3 text-sm font-semibold text-star">{step.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-mist">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Love Calculator by Name */}
            <div className="mt-14">
              <h2 className="font-display text-2xl font-semibold text-star sm:text-3xl">
                {loveContent.byName.title}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-mist">
                {loveContent.byName.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            {/* Love Calculator by Date of Birth */}
            <div className="mt-14">
              <h2 className="font-display text-2xl font-semibold text-star sm:text-3xl">
                {loveContent.byDob.title}
              </h2>
              <p className="mt-3 text-sm text-mist">{loveContent.byDob.lead}</p>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {loveContent.byDob.methods.map((method, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/10 font-mono text-sm font-bold text-amber-300">
                        {method.number}
                      </span>
                      <h3 className="text-base font-semibold text-star">{method.name}</h3>
                    </div>
                    <div className="mt-4 space-y-2.5 text-xs leading-relaxed text-mist">
                      {method.paragraphs.map((p, pIdx) => (
                        <p key={pIdx}>{p}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What Is FLAMES? The Classic Indian Love Game */}
            <div className="mt-14 rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] p-6 sm:p-8 backdrop-blur-md">
              <div className="flex items-center gap-2.5 text-rose-300">
                <FlameIcon size={20} />
                <h2 className="font-display text-xl font-semibold sm:text-2xl">
                  {loveContent.flames.title}
                </h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-mist">{loveContent.flames.lead}</p>

              <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-star">
                {loveContent.flames.howToPlayTitle}
              </h3>
              <ol className="mt-3 space-y-2 text-xs leading-relaxed text-mist">
                {loveContent.flames.steps.map((st, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="inline-block h-5 w-5 shrink-0 rounded-full bg-rose-500/10 text-center font-mono text-[11px] font-bold text-rose-300 leading-5">
                      {i + 1}
                    </span>
                    <span>{st}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs leading-relaxed text-rose-200">
                <p>{loveContent.flames.example}</p>
              </div>
            </div>

            {/* What Does Your Love Percentage Mean? (Table) */}
            <div className="mt-14">
              <h2 className="font-display text-2xl font-semibold text-star sm:text-3xl">
                {loveContent.scoreMeaning.title}
              </h2>
              <p className="mt-3 text-sm text-mist">{loveContent.scoreMeaning.lead}</p>

              <div className="not-prose mt-6 overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-star">
                    <tr>
                      <th className="px-5 py-3.5">Love Percentage</th>
                      <th className="px-5 py-3.5">What It Suggests</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-mist">
                    {loveContent.scoreMeaning.table.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="px-5 py-3.5 font-mono font-medium text-pink-300">
                          {row.range}
                        </td>
                        <td className="px-5 py-3.5">{row.suggestion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-haze">
                {loveContent.scoreMeaning.note}
              </p>
            </div>

            {/* Vedic Love Compatibility: Understanding Guna Milan */}
            <div className="mt-14">
              <h2 className="font-display text-2xl font-semibold text-star sm:text-3xl">
                {loveContent.gunaMilan.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-mist">
                {loveContent.gunaMilan.lead}
              </p>

              {/* Kootas Table */}
              <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-star">
                {loveContent.gunaMilan.kootasTableTitle}
              </h3>
              <div className="not-prose mt-3 overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[500px] text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-star">
                    <tr>
                      <th className="px-5 py-3.5">Koota</th>
                      <th className="px-5 py-3.5">What It Examines</th>
                      <th className="px-5 py-3.5 text-right">Max Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-mist">
                    {loveContent.gunaMilan.kootas.map((k, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="px-5 py-3 font-medium text-star">{k.koota}</td>
                        <td className="px-5 py-3">{k.examines}</td>
                        <td className="px-5 py-3 text-right font-mono font-semibold text-amber-300">
                          {k.points}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-white/20 bg-white/[0.03] font-semibold text-star">
                      <td className="px-5 py-3.5" colSpan={2}>
                        Total
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-amber-300">
                        {loveContent.gunaMilan.totalPoints}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Marriage Compatibility Table */}
              <h3 className="mt-8 text-lg font-semibold text-star">
                {loveContent.gunaMilan.marriageTitle}
              </h3>
              <p className="mt-2 text-sm text-mist">{loveContent.gunaMilan.marriageLead}</p>
              <div className="not-prose mt-4 overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-star">
                    <tr>
                      <th className="px-5 py-3.5">Gunas Matched</th>
                      <th className="px-5 py-3.5">Traditional Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-mist">
                    {loveContent.gunaMilan.marriageTable.map((m, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="px-5 py-3.5 font-mono font-medium text-amber-300">
                          {m.gunas}
                        </td>
                        <td className="px-5 py-3.5">{m.interpretation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-haze">
                {loveContent.gunaMilan.additionalFactors}
              </p>

              {/* CTA Box */}
              <div className="mt-6 rounded-2xl border border-pink-500/25 bg-pink-500/[0.05] p-5 sm:p-6 backdrop-blur-sm">
                <p className="text-sm font-medium text-pink-200">
                  {loveContent.gunaMilan.ctaText}
                </p>
                <div className="mt-3">
                  <Link
                    to={withLang(lang, "/calculators/kundli-matching")}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-pink-400 hover:text-pink-300 transition"
                  >
                    <span>{isHi ? "कुंडली मिलान देखें" : "Explore Kundli Matching"}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* What Is Manglik Dosha? */}
            <div className="mt-14">
              <h2 className="font-display text-2xl font-semibold text-star sm:text-3xl">
                {loveContent.manglikDosha.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-mist">
                {loveContent.manglikDosha.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            {/* Name Test vs Date-of-Birth Test vs Kundli Matching (Comparison Table) */}
            <div className="mt-14">
              <h2 className="font-display text-2xl font-semibold text-star sm:text-3xl">
                {loveContent.comparison.title}
              </h2>
              <p className="mt-3 text-sm text-mist">{loveContent.comparison.lead}</p>

              <div className="not-prose mt-6 overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-star">
                    <tr>
                      <th className="px-4 py-3.5">Basis of Comparison</th>
                      <th className="px-4 py-3.5">Name Test</th>
                      <th className="px-4 py-3.5">Numerology (DOB)</th>
                      <th className="px-4 py-3.5">Vedic Kundli Matching</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-mist">
                    {loveContent.comparison.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3.5 font-medium text-star">{row.basis}</td>
                        <td className="px-4 py-3.5">{row.nameTest}</td>
                        <td className="px-4 py-3.5">{row.dobTest}</td>
                        <td className="px-4 py-3.5 font-medium text-amber-200">{row.kundli}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-haze">
                {loveContent.comparison.summary}
              </p>
            </div>

            {/* What Really Makes Two People Compatible? */}
            <div className="mt-14">
              <h2 className="font-display text-2xl font-semibold text-star sm:text-3xl">
                {loveContent.realCompatibility.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-mist">
                {loveContent.realCompatibility.lead}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {loveContent.realCompatibility.aspects.map((asp, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm"
                  >
                    <h3 className="text-sm font-semibold text-star">{asp.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-mist">{asp.desc}</p>
                  </div>
                ))}
              </div>

              <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm leading-relaxed text-mist">
                {loveContent.realCompatibility.closing}
              </p>
            </div>

            {/* Common Mistakes to Avoid When Using a Love Calculator */}
            <div className="mt-14 rounded-2xl border border-amber-500/25 bg-amber-500/[0.03] p-6 sm:p-8 backdrop-blur-md">
              <div className="flex items-center gap-2.5 text-amber-300">
                <AlertTriangle size={20} />
                <h2 className="font-display text-xl font-semibold sm:text-2xl">
                  {loveContent.mistakes.title}
                </h2>
              </div>
              <p className="mt-3 text-sm text-mist">{loveContent.mistakes.lead}</p>

              <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-mist">
                {loveContent.mistakes.items.map((it, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-amber-500/15 pt-3 text-xs font-medium text-amber-200">
                ⚠️ {loveContent.mistakes.warning}
              </p>
            </div>

            {/* Frequently Asked Questions */}
            <div className="mt-14">
              <div className="mb-6 flex items-center gap-2.5 text-star">
                <HelpCircle size={22} className="text-pink-400" />
                <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                  Frequently Asked Questions About Love Calculators
                </h2>
              </div>
              <Faqs faqs={loveContent.faqs} />
            </div>

            {/* Try It With Someone Special & Astrologer Consultation */}
            <div className="mt-14 rounded-3xl border border-pink-500/30 bg-gradient-to-br from-pink-950/20 via-night to-amber-950/20 p-8 sm:p-10 backdrop-blur-xl text-center sm:text-left">
              <h2 className="font-display text-2xl font-bold text-star sm:text-3xl">
                {loveContent.tryWithSpecial.title}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-mist">
                {loveContent.tryWithSpecial.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-star text-base">
                    {loveContent.tryWithSpecial.consultation.heading}
                  </h3>
                  <p className="mt-1 text-xs text-mist leading-relaxed">
                    {loveContent.tryWithSpecial.consultation.text}
                  </p>
                </div>
                <Link
                  to={withLang(lang, "/lumi")}
                  className="btn-primary shrink-0 !rounded-xl !px-5 !py-2.5 text-xs font-semibold inline-flex items-center gap-2"
                >
                  <MessageCircle size={15} />
                  <span>{isHi ? "ज्योतिषी से बात करें" : "Talk to Astrologer"}</span>
                </Link>
              </div>
            </div>

            {/* About the Author */}
            <div className="mt-14 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-pink-500/10 font-display text-lg font-bold text-pink-300">
                PS
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-haze">About the Author</p>
                <h3 className="text-base font-semibold text-star mt-0.5">
                  {loveContent.author.name}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-mist">
                  {loveContent.author.bio}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </article>
      )}
    </div>
  );
}
