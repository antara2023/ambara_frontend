// How the hub groups calculators. Calculators themselves come from the database; this file only decides
// sections, order and icons (Vedaz hard-codes the whole list in the page instead).
import type { CalculatorListItem, Lang } from "./types";
import { CATEGORIES, CATEGORY_IDS, popularIds } from "./western";

export type IconName =
  | "flame" | "clock" | "star" | "shield-alert" | "calendar-clock" | "gem" | "compass" | "scroll"
  | "grid" | "sparkles" | "calendar-days" | "calendar-heart" | "baby" | "orbit" | "sun" | "heart"
  | "landmark" | "banknote" | "train" | "shield" | "shield-check" | "graduation-cap" | "clipboard" | "receipt"
  | "briefcase" | "rings" | "refresh" | "moon" | "sunrise" | "merge" | "flower" | "moon-star" | "hash" | "map"
  | "coins" | "trending" | "clover" | "rewind";

/** Core calculators in display order (by calculatorId). Anything new and not listed shows at the end. */
export const CORE: { id: string; icon: IconName; hue: number }[] = [
  { id: "mangalik-dosh-calculator", icon: "flame", hue: 12 },
  { id: "sade-sati-calculator", icon: "clock", hue: 222 },
  { id: "nakshatra-calculator", icon: "star", hue: 42 },
  { id: "kaal-sarp-dosha", icon: "shield-alert", hue: 290 },
  { id: "vimshottari-dasha-calculator", icon: "calendar-clock", hue: 238 },
  { id: "gemstone-calculator", icon: "gem", hue: 165 },
  { id: "lagna-calculator", icon: "compass", hue: 262 },
  { id: "pitra-dosh-calculator", icon: "scroll", hue: 320 },
  { id: "navamsa-d9-chart-calculator", icon: "grid", hue: 340 },
  { id: "ishta-devata-calculator", icon: "sparkles", hue: 280 },
  { id: "varshphal-calculator", icon: "calendar-days", hue: 32 },
  { id: "vivah-muhurat-calculator", icon: "calendar-heart", hue: 350 },
  { id: "baby-name-by-nakshatra", icon: "baby", hue: 190 },
  { id: "gochar-calculator", icon: "orbit", hue: 205 },
];

export const JAIMINI: { id: string; icon: IconName; hue: number }[] = [
  { id: "atmakaraka", icon: "sun", hue: 38 },
  { id: "darakaraka", icon: "heart", hue: 345 },
];

/** Records that are not calculators and must not be listed. */
export const HIDDEN_IDS = new Set(["pillar-page"]);

/** Sarkari Naukri exam groups (same groups as the Vedaz hub). Exam key = calculatorId without the prefix. */
export const SARKARI_GROUPS: { key: string; icon: IconName; hue: number; title: Record<Lang, string>; note: Record<Lang, string>; exams: string[] }[] = [
  {
    key: "civil",
    icon: "landmark",
    hue: 38,
    title: { en: "Civil Services & State PSCs", hi: "सिविल सेवा एवं राज्य लोक सेवा आयोग" },
    note: { en: "Sun, Mercury and the 10th house for administrative service.", hi: "प्रशासनिक सेवा के लिए सूर्य, बुध और दशम भाव।" },
    exams: ["upsc", "uppsc", "bpsc", "mppsc", "rpsc-ras", "jpsc", "ukpsc", "hpsc-hcs", "hppsc-hpas", "cgpsc"],
  },
  {
    key: "banking",
    icon: "banknote",
    hue: 155,
    title: { en: "Banking & Finance", hi: "बैंकिंग एवं वित्त" },
    note: { en: "Mercury, Jupiter and the 2nd and 11th houses.", hi: "बुध, गुरु तथा द्वितीय और एकादश भाव।" },
    exams: ["bank-po", "ibps-clerk", "sbi-clerk", "rbi-grade-b", "rbi-assistant", "ibps-rrb"],
  },
  {
    key: "railways",
    icon: "train",
    hue: 215,
    title: { en: "Railways", hi: "रेलवे" },
    note: { en: "Saturn and Rahu for railway recruitment timing.", hi: "रेलवे भर्ती के समय के लिए शनि और राहु।" },
    exams: ["rrb-ntpc", "rrb-group-d"],
  },
  {
    key: "defence",
    icon: "shield",
    hue: 355,
    title: { en: "Defence & Armed Forces", hi: "रक्षा एवं सशस्त्र बल" },
    note: { en: "Mars and Sun strength for defence entry.", hi: "रक्षा सेवा के लिए मंगल और सूर्य का बल।" },
    exams: ["nda", "cds", "afcat", "agniveer"],
  },
  {
    key: "police",
    icon: "shield-check",
    hue: 230,
    title: { en: "Police & Paramilitary", hi: "पुलिस एवं अर्धसैनिक बल" },
    note: { en: "Mars–Saturn combinations for constable and SI posts.", hi: "सिपाही और दरोगा पदों के लिए मंगल-शनि योग।" },
    exams: ["up-police-constable", "bihar-police-constable", "mp-police-constable", "rajasthan-police-constable", "delhi-police-constable", "ssc-cpo"],
  },
  {
    key: "teaching",
    icon: "graduation-cap",
    hue: 270,
    title: { en: "Teaching Eligibility", hi: "शिक्षक पात्रता" },
    note: { en: "Jupiter, Mercury and the 5th house for teaching posts.", hi: "शिक्षण पदों के लिए गुरु, बुध और पंचम भाव।" },
    exams: ["ctet", "uptet", "reet", "mp-tet", "bihar-stet", "super-tet"],
  },
  {
    key: "ssc",
    icon: "clipboard",
    hue: 305,
    title: { en: "SSC & Staff Selection", hi: "एसएससी एवं कर्मचारी चयन" },
    note: { en: "10th house with Saturn and Mercury for staff posts.", hi: "कर्मचारी पदों के लिए दशम भाव, शनि और बुध।" },
    exams: ["ssc-gd", "ssc-cgl", "ssc-chsl", "ssc-mts", "ssc-stenographer", "ssc-je", "ssc-selection-post"],
  },
  {
    key: "state",
    icon: "receipt",
    hue: 172,
    title: { en: "Revenue & State Departments", hi: "राजस्व एवं राज्य विभाग" },
    note: { en: "6th and 10th house combinations for state jobs.", hi: "राज्य नौकरियों के लिए षष्ठ और दशम भाव।" },
    exams: ["upsssc-lekhpal"],
  },
];

export const examKey = (c: Pick<CalculatorListItem, "calculatorId">) => c.calculatorId.replace(/^sarkari-naukri-yog-/, "");

export const isSarkari = (c: CalculatorListItem) => c.listing?.group === "sarkari" || c.category === "sarkari-naukri-yog";

/** Short display name for an exam, e.g. "rpsc-ras" -> "RPSC RAS", "bank-po" -> "Bank PO". */
const SMALL_WORDS = new Set(["police", "constable", "clerk", "assistant", "grade", "group", "selection", "post", "stenographer", "lekhpal", "super", "bihar", "delhi", "rajasthan", "bank"]);
export const examLabel = (key: string) =>
  key
    .split("-")
    .map((w) => (SMALL_WORDS.has(w) ? w[0].toUpperCase() + w.slice(1) : w.toUpperCase()))
    .join(" ");

/** Calculator title for cards: the page heading without the trailing "Calculator"/SEO tail. */
export const cardTitle = (c: CalculatorListItem) => {
  const h1 = (c.hero?.h1 || c.name || c.slug).split(/[:|–—-]\s/)[0].trim();
  return h1.length > 60 ? `${h1.slice(0, 57)}…` : h1;
};

type Item = CalculatorListItem & { icon: IconName; hue: number };

export type HubSections = {
  popular: Item[];
  categories: { key: string; title: Record<Lang, string>; text: Record<Lang, string>; items: Item[] }[];
  core: Item[];
  jaimini: (CalculatorListItem & { icon: IconName; hue: number })[];
  sarkari: { group: (typeof SARKARI_GROUPS)[number]; items: CalculatorListItem[] }[];
  sarkariCount: number;
  total: number;
};

export function buildHub(list: CalculatorListItem[]): HubSections {
  const visible = [...list.filter((c) => !HIDDEN_IDS.has(c.calculatorId))];
  if (!visible.some((c) => c.calculatorId === "love-calculator")) {
    visible.unshift({
      _id: "love-calculator",
      calculatorId: "love-calculator",
      name: "Love Calculator",
      slug: "love-calculator",
      lang: "en",
      category: "love",
      hero: {
        h1: "Love Calculator",
        subtitle: "Discover your true compatibility score across love, chemistry, friendship, and communication.",
      },
      listing: {
        group: "categories",
        sortOrder: 0,
        shortDescription: "Deterministic 4-D compatibility and elemental zodiac synergy.",
        icon: "heart",
      },
    });
  }
  const byId = new Map(visible.map((c) => [c.calculatorId, c]));

  const pick = (defs: typeof CORE) =>
    defs.flatMap((d) => {
      const c = byId.get(d.id);
      return c ? [{ ...c, icon: d.icon, hue: d.hue }] : [];
    });

  const sarkariItems = visible.filter(isSarkari);
  // Calculators in the five categories are shown there only (each calculator appears in one section)
  const listedIds = new Set([...CORE, ...JAIMINI].map((d) => d.id).concat([...CATEGORY_IDS]));
  const categories = CATEGORIES.map((c) => ({ key: c.key, title: c.title, text: c.text, items: pick(c.items) })).filter((c) => c.items.length);
  const inCategories = new Map(categories.flatMap((c) => c.items).map((c) => [c.calculatorId, c]));
  const popular = popularIds().flatMap((id) => (inCategories.has(id) ? [inCategories.get(id)!] : []));
  const extras = visible
    .filter((c) => !isSarkari(c) && !listedIds.has(c.calculatorId))
    .map((c) => ({ ...c, icon: "sparkles" as IconName, hue: 250 }));

  const byExam = new Map(sarkariItems.map((c) => [examKey(c), c]));
  const grouped = SARKARI_GROUPS.map((group) => ({
    group,
    items: group.exams.flatMap((k) => (byExam.has(k) ? [byExam.get(k)!] : [])),
  }));
  const groupedKeys = new Set(SARKARI_GROUPS.flatMap((g) => g.exams));
  const ungrouped = sarkariItems.filter((c) => !groupedKeys.has(examKey(c)));
  if (ungrouped.length) grouped[grouped.length - 1].items.push(...ungrouped);

  return {
    popular,
    categories,
    core: [...pick(CORE.filter((d) => !CATEGORY_IDS.has(d.id))), ...extras],
    jaimini: pick(JAIMINI),
    sarkari: grouped.filter((g) => g.items.length),
    sarkariCount: sarkariItems.length,
    total: visible.length,
  };
}
