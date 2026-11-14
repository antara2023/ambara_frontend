// The four "life question" tools. Fields, options and defaults match the Vedaz tool pages; option values are
// sent in English (as Vedaz does) and only the labels are translated.
import type { IconName } from "./catalog";
import type { Lang } from "./types";

type L = Record<Lang, string>;

export type ToolOption = { value: string; label: L };

export type ToolField =
  | { name: string; kind: "select"; label: L; options: ToolOption[]; default: string }
  | { name: string; kind: "text"; label: L; placeholder: L; default: string; suggestions?: string[] }
  | { name: string; kind: "textarea"; label: L; placeholder: L; default: string };

export type ToolDef = {
  slug: string;
  icon: IconName;
  hue: number;
  title: L;
  tag: L;
  cta: L;
  description: L;
  /** Second-step questions */
  fields: ToolField[];
  /** The ex-return tool also asks for the partner's birth details */
  partner?: boolean;
  scoreKey: "compatibilityScore" | "yogaScore";
  scoreLabel: L;
  timeKey: "returnChance" | "predictionTimeline";
  timeLabel: L;
  sections: { key: string; title: L }[];
};

const o = (en: string, hi: string): ToolOption => ({ value: en, label: { en, hi } });

const COMMON_SECTIONS = {
  analysis: { key: "astrologicalAnalysis", title: { en: "Astrological analysis", hi: "ज्योतिषीय विश्लेषण" } },
  blockages: { key: "planetaryBlockages", title: { en: "Planetary blockages", hi: "ग्रह बाधाएं" } },
  remedies: { key: "recommendations", title: { en: "Remedies & guidance", hi: "उपाय एवं मार्गदर्शन" } },
};

export const TOOLS: ToolDef[] = [
  {
    slug: "will-my-ex-return",
    icon: "refresh",
    hue: 340,
    title: { en: "Will my ex come back?", hi: "क्या मेरा एक्स वापस आएगा?" },
    tag: { en: "Love", hi: "प्रेम" },
    cta: { en: "See the chances", hi: "संभावना देखें" },
    description: {
      en: "Reads both charts, Venus and the 7th house to judge whether — and when — reconciliation is likely.",
      hi: "दोनों कुंडलियों, शुक्र और सप्तम भाव से जानें कि सुलह की संभावना है या नहीं, और कब।",
    },
    partner: true,
    fields: [
      {
        name: "breakupPeriod",
        kind: "select",
        label: { en: "When did you break up?", hi: "ब्रेकअप कब हुआ?" },
        default: "1-3 months",
        options: [
          o("Less than a month", "एक महीने से कम"),
          o("1-3 months", "1-3 महीने"),
          o("3-6 months", "3-6 महीने"),
          o("6-12 months", "6-12 महीने"),
          o("1+ year", "1 वर्ष से अधिक"),
        ],
      },
      {
        name: "breakupReason",
        kind: "select",
        label: { en: "What was the main reason?", hi: "मुख्य कारण क्या था?" },
        default: "Ego Clashes & Frequent Arguments",
        options: [
          o("Ego Clashes & Frequent Arguments", "अहंकार का टकराव और झगड़े"),
          o("Trust Issues & Lack of Mutual Understanding", "भरोसे की कमी और समझ की कमी"),
          o("Long Distance & Lack of Quality Time", "दूरी और साथ समय की कमी"),
          o("Family Opposition & Social Differences", "परिवार का विरोध और सामाजिक अंतर"),
          o("Career Priorities & Financial Stress", "करियर प्राथमिकताएं और आर्थिक तनाव"),
          o("Emotional Disconnect & Lost Spark", "भावनात्मक दूरी"),
          o("Others (Type Custom Reason...)", "अन्य (अपना कारण लिखें...)"),
        ],
      },
      {
        name: "customReason",
        kind: "textarea",
        label: { en: "Tell us what happened", hi: "बताइए क्या हुआ था" },
        placeholder: {
          en: "Distance, trust issues, family opposition, ego clashes… Details help give a precise reading.",
          hi: "दूरी, भरोसे की कमी, परिवार का विरोध… विवरण से सटीक विश्लेषण मिलता है।",
        },
        default: "",
      },
    ],
    scoreKey: "compatibilityScore",
    scoreLabel: { en: "Compatibility", hi: "अनुकूलता" },
    timeKey: "returnChance",
    timeLabel: { en: "Chance of return", hi: "वापसी की संभावना" },
    sections: [COMMON_SECTIONS.analysis, COMMON_SECTIONS.blockages, COMMON_SECTIONS.remedies, { key: "reconciliationTips", title: { en: "Reconciliation tips", hi: "सुलह के सुझाव" } }],
  },
  {
    slug: "when-will-i-get-a-government-job",
    icon: "landmark",
    hue: 38,
    title: { en: "When will I get a government job?", hi: "मुझे सरकारी नौकरी कब मिलेगी?" },
    tag: { en: "Sarkari", hi: "सरकारी" },
    cta: { en: "Check my Sarkari Yog", hi: "सरकारी योग देखें" },
    description: {
      en: "Sun, Saturn, Rahu and the 10th house together show government-service potential and timing.",
      hi: "सूर्य, शनि, राहु और दशम भाव से सरकारी सेवा की संभावना और समय जानें।",
    },
    fields: [
      {
        name: "educationField",
        kind: "text",
        label: { en: "Your education / background", hi: "आपकी शिक्षा / पृष्ठभूमि" },
        placeholder: { en: "e.g. B.Tech CSE, BA History, MBA, 12th", hi: "जैसे, बी.टेक, बी.ए. इतिहास, एमबीए, 12वीं" },
        default: "",
      },
      {
        name: "targetField",
        kind: "select",
        label: { en: "Which government field?", hi: "कौन सा सरकारी क्षेत्र?" },
        default: "Civil Services (IAS/IPS/IFS)",
        options: [
          o("Civil Services (IAS/IPS/IFS)", "सिविल सेवा (IAS/IPS/IFS)"),
          o("Banking & Finance (IBPS/SBI)", "बैंकिंग एवं वित्त (IBPS/SBI)"),
          o("Railways (RRB)", "रेलवे (RRB)"),
          o("Defense & Police Services", "रक्षा एवं पुलिस सेवा"),
          o("Teaching & Academia (TET/NET)", "शिक्षण (TET/NET)"),
          o("State Government Exams (PSC)", "राज्य सरकार परीक्षाएं (PSC)"),
          o("Public Sector Undertakings (PSUs)", "सार्वजनिक उपक्रम (PSU)"),
          o("Others / General Government Job", "अन्य / सामान्य सरकारी नौकरी"),
        ],
      },
    ],
    scoreKey: "yogaScore",
    scoreLabel: { en: "Sarkari Yog strength", hi: "सरकारी योग बल" },
    timeKey: "predictionTimeline",
    timeLabel: { en: "Likely timing", hi: "संभावित समय" },
    sections: [COMMON_SECTIONS.analysis, COMMON_SECTIONS.blockages, COMMON_SECTIONS.remedies, { key: "preparationTips", title: { en: "Preparation tips", hi: "तैयारी के सुझाव" } }],
  },
  {
    slug: "when-will-i-get-married",
    icon: "rings",
    hue: 330,
    title: { en: "When will I get married?", hi: "मेरी शादी कब होगी?" },
    tag: { en: "Marriage", hi: "विवाह" },
    cta: { en: "Find my marriage window", hi: "विवाह का समय जानें" },
    description: {
      en: "A dasha-based estimate of your marriage window from the 7th house, Venus and Jupiter.",
      hi: "सप्तम भाव, शुक्र और गुरु के आधार पर दशा से विवाह के समय का अनुमान।",
    },
    fields: [
      {
        name: "relationshipStatus",
        kind: "select",
        label: { en: "Relationship status", hi: "संबंध की स्थिति" },
        default: "Single (Looking for partner)",
        options: [
          o("Single (Looking for partner)", "अविवाहित (साथी की तलाश में)"),
          o("Single (Not actively looking)", "अविवाहित (अभी तलाश नहीं)"),
          o("In a relationship / Dating", "रिश्ते में / डेटिंग"),
          o("Engaged / Committed", "सगाई / प्रतिबद्ध"),
          o("Complex relationship situation", "जटिल स्थिति"),
        ],
      },
      {
        name: "marriageType",
        kind: "select",
        label: { en: "Marriage preference", hi: "विवाह की पसंद" },
        default: "Love Marriage",
        options: [o("Love Marriage", "प्रेम विवाह"), o("Arranged Marriage", "अरेंज्ड विवाह"), o("No Preference / Whatever stars suggest", "कोई पसंद नहीं / जो सितारे कहें")],
      },
    ],
    scoreKey: "yogaScore",
    scoreLabel: { en: "Vivah Yog strength", hi: "विवाह योग बल" },
    timeKey: "predictionTimeline",
    timeLabel: { en: "Likely window", hi: "संभावित समय" },
    sections: [COMMON_SECTIONS.analysis, COMMON_SECTIONS.blockages, COMMON_SECTIONS.remedies, { key: "marriageTips", title: { en: "Marriage tips", hi: "विवाह के सुझाव" } }],
  },
  {
    slug: "when-will-i-get-a-job",
    icon: "briefcase",
    hue: 200,
    title: { en: "When will I get a job?", hi: "मुझे नौकरी कब मिलेगी?" },
    tag: { en: "Career", hi: "करियर" },
    cta: { en: "Predict my job timeline", hi: "नौकरी का समय जानें" },
    description: {
      en: "Your 10th house, Saturn and running dasha point to the most likely window for your next move.",
      hi: "दशम भाव, शनि और चल रही दशा से अगली नौकरी का संभावित समय।",
    },
    fields: [
      {
        name: "employmentStatus",
        kind: "select",
        label: { en: "Current status", hi: "वर्तमान स्थिति" },
        default: "Student (Looking for first job)",
        options: [
          o("Student (Looking for first job)", "छात्र (पहली नौकरी की तलाश)"),
          o("Unemployed (Actively searching)", "बेरोज़गार (सक्रिय तलाश)"),
          o("Employed (Looking for a better change)", "नौकरीपेशा (बेहतर बदलाव की तलाश)"),
          o("Freelancer / Self-Employed seeking stability", "फ्रीलांसर / स्वरोज़गार (स्थिरता की तलाश)"),
        ],
      },
      {
        name: "targetIndustry",
        kind: "text",
        label: { en: "Target industry", hi: "लक्षित क्षेत्र" },
        placeholder: { en: "e.g. Software, Finance, Healthcare", hi: "जैसे, सॉफ्टवेयर, वित्त, स्वास्थ्य" },
        default: "",
        suggestions: [
          "IT / Software / Tech",
          "Finance, Banking & Accounting",
          "Healthcare & Medicine",
          "Marketing, Creative & Media",
          "Engineering & Core Operations",
          "Education & Training",
          "Management & HR",
          "Others / General Industry",
        ],
      },
    ],
    scoreKey: "yogaScore",
    scoreLabel: { en: "Job Yog strength", hi: "नौकरी योग बल" },
    timeKey: "predictionTimeline",
    timeLabel: { en: "Likely timing", hi: "संभावित समय" },
    sections: [COMMON_SECTIONS.analysis, COMMON_SECTIONS.blockages, COMMON_SECTIONS.remedies, { key: "careerTips", title: { en: "Career tips", hi: "करियर के सुझाव" } }],
  },
];

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);

export const OTHER_REASON = "Others (Type Custom Reason...)";
