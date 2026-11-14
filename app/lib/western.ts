// The 24 "popular astrology" calculators: which form each needs, the five hub categories and the
// "Most popular" strip. The calculators themselves (title, slug, content) come from the database.
import type { IconName } from "./catalog";
import type { Lang } from "./types";

/** What the form asks for (must match backend astro/western/western.service.js FORMS). */
export type FormKind = "natal" | "dateOnly" | "numerology" | "couple" | "coupleDate";

export const FORM_NEEDS: Record<FormKind, { time: boolean; place: boolean; partner: boolean }> = {
  natal: { time: true, place: true, partner: false },
  dateOnly: { time: false, place: false, partner: false },
  numerology: { time: false, place: false, partner: false },
  couple: { time: true, place: true, partner: true },
  coupleDate: { time: false, place: false, partner: true },
};

const FORM_OF: Record<string, FormKind> = {
  sunSign: "dateOnly",
  lifePath: "numerology",
  luckyNumber: "numerology",
  synastry: "couple",
  composite: "couple",
  zodiacCompatibility: "coupleDate",
};

/** Calculator types computed by the Western engine (everything else uses the Vedic API). */
export const WESTERN_TYPES = new Set([
  "birthChart", "bigThree", "sunSign", "moonSign", "risingSign", "zodiacCompatibility", "synastry", "composite",
  "venusSign", "marsSign", "lilith", "midheaven", "northNode", "lifePath", "astrocartography", "partOfFortune",
  "jupiterSign", "luckyNumber", "saturnReturn", "solarReturn", "transit", "mercuryRetrograde", "vedicSign",
]);

export const formOf = (calculatorType?: string): FormKind => FORM_OF[calculatorType || ""] || "natal";

type Def = { id: string; icon: IconName; hue: number };

/** Hub categories. Every calculator sits in exactly one. */
export const CATEGORIES: { key: string; title: Record<Lang, string>; text: Record<Lang, string>; items: Def[] }[] = [
  {
    key: "core-chart",
    title: { en: "Your Core Chart", hi: "आपकी मूल कुंडली" },
    text: { en: "Start here: your full birth chart and the three signs that describe you best.", hi: "यहां से शुरू करें: आपकी पूरी जन्म कुंडली और आपकी तीन मुख्य राशियां।" },
    items: [
      { id: "birth-chart-calculator", icon: "orbit", hue: 262 },
      { id: "big-three-calculator", icon: "sparkles", hue: 42 },
      { id: "sun-sign-calculator", icon: "sun", hue: 38 },
      { id: "moon-sign-calculator", icon: "moon", hue: 220 },
      { id: "rising-sign-calculator", icon: "sunrise", hue: 18 },
    ],
  },
  {
    key: "love",
    title: { en: "Love & Relationships", hi: "प्रेम और रिश्ते" },
    text: { en: "How you love, what attracts you, and how two charts work together.", hi: "आप कैसे प्रेम करते हैं, क्या आकर्षित करता है, और दो कुंडलियां कैसे मिलती हैं।" },
    items: [
      { id: "zodiac-compatibility-calculator", icon: "heart", hue: 345 },
      { id: "synastry-chart-calculator", icon: "rings", hue: 330 },
      { id: "composite-chart-calculator", icon: "merge", hue: 300 },
      { id: "venus-sign-calculator", icon: "flower", hue: 320 },
      { id: "mars-sign-calculator", icon: "flame", hue: 8 },
      { id: "black-moon-lilith-calculator", icon: "moon-star", hue: 280 },
    ],
  },
  {
    key: "career",
    title: { en: "Career, Money & Purpose", hi: "करियर, धन और उद्देश्य" },
    text: { en: "Your calling, your direction in life, your lucky numbers and the places that suit you.", hi: "आपका कार्यक्षेत्र, जीवन की दिशा, शुभ अंक और आपके लिए अनुकूल स्थान।" },
    items: [
      { id: "midheaven-calculator", icon: "briefcase", hue: 210 },
      { id: "north-node-calculator", icon: "compass", hue: 175 },
      { id: "life-path-number-calculator", icon: "hash", hue: 48 },
      { id: "astrocartography-calculator", icon: "map", hue: 195 },
      { id: "part-of-fortune-calculator", icon: "coins", hue: 52 },
      { id: "jupiter-sign-calculator", icon: "trending", hue: 30 },
      { id: "lucky-number-calculator", icon: "clover", hue: 140 },
    ],
  },
  {
    key: "timing",
    title: { en: "Timing & Forecasts", hi: "समय और भविष्यफल" },
    text: { en: "What the sky is doing to your chart now, and the big turning points ahead.", hi: "अभी ग्रह आपकी कुंडली पर क्या प्रभाव डाल रहे हैं, और आगे के बड़े मोड़।" },
    items: [
      { id: "saturn-return-calculator", icon: "clock", hue: 245 },
      { id: "solar-return-calculator", icon: "calendar-days", hue: 35 },
      { id: "transit-calculator", icon: "refresh", hue: 205 },
      { id: "mercury-retrograde-calculator", icon: "rewind", hue: 160 },
    ],
  },
  {
    key: "vedic",
    title: { en: "Vedic Astrology", hi: "वैदिक ज्योतिष" },
    text: { en: "Your sign in the sidereal zodiac used in India, and your birth star.", hi: "भारतीय (निरयण) राशिचक्र में आपकी राशि और आपका जन्म नक्षत्र।" },
    items: [
      { id: "vedic-zodiac-sign-calculator", icon: "star", hue: 25 },
      { id: "nakshatra-calculator", icon: "star", hue: 42 },
    ],
  },
];

export const CATEGORY_IDS = new Set(CATEGORIES.flatMap((c) => c.items.map((i) => i.id)));
export const categoryDef = (id: string) => CATEGORIES.flatMap((c) => c.items).find((d) => d.id === id);
export const categoryOf = (id: string) => CATEGORIES.find((c) => c.items.some((i) => i.id === id));

/** "Most popular" strip: a shortcut only, same URLs and titles as the category cards. */
const POPULAR = [
  "birth-chart-calculator",
  "big-three-calculator",
  "moon-sign-calculator",
  "rising-sign-calculator",
  "zodiac-compatibility-calculator",
  "saturn-return-calculator",
];

// Mercury retrograde periods (checked against our ephemeris and almanac.com). Extend this list each year.
const MERCURY_RETROGRADES: [string, string][] = [
  ["2026-10-24", "2026-11-13"],
  ["2027-02-09", "2027-03-03"],
  ["2027-06-10", "2027-07-04"],
  ["2027-10-07", "2027-10-28"],
];
const DAY = 864e5;

/** Mercury retrograde takes Saturn return's place in the strip from two weeks before a retrograde until it ends. */
export function popularIds(now = new Date()) {
  const t = now.getTime();
  const swap = MERCURY_RETROGRADES.some(([s, e]) => t >= Date.parse(s) - 14 * DAY && t <= Date.parse(e) + DAY);
  return swap ? POPULAR.map((id) => (id === "saturn-return-calculator" ? "mercury-retrograde-calculator" : id)) : POPULAR;
}
