export type Lang = "en" | "hi";

export type CustomField = {
  name: string;
  label: string;
  type: "text" | "number" | "select";
  placeholder?: string;
  options?: string[];
};

export type Faq = { question: string; answer: string };

export type Listing = { group: string; sortOrder: number; shortDescription: string; icon: string };

export type CalculatorListItem = {
  _id: string;
  calculatorId: string;
  name: string;
  slug: string;
  lang: Lang;
  category?: string;
  hero?: { h1?: string; subtitle?: string };
  listing?: Listing;
};

export type CalculatorContent = CalculatorListItem & {
  isActive: boolean;
  seo: { metaTitle: string; metaDescription: string };
  hero: { h1: string; subtitle: string };
  contentMarkdown: string;
  faqs: Faq[];
  customFields: CustomField[];
  relatedCalculators: unknown[];
  /** "generic" | "charaKarakas" | a Western type (see lib/western.ts) */
  compute: { chartEndpoint: string; calculatorType: string };
  alternate: { lang: Lang; slug: string; category?: string } | null;
  updatedAt?: string;
};

/** Admin view of a calculator: everything, including the AI prompt. */
export type CalculatorAdmin = Omit<CalculatorContent, "alternate"> & { prompt: string; createdAt?: string };

export type BirthDetails = {
  name: string;
  gender: string;
  /** DD/MM/YYYY */
  dob: string;
  /** HH:mm */
  tob: string;
  place: string;
};

export type KarakaRank = {
  planet: string;
  degree: number;
  formattedDegree: string;
  sign: string;
  signNumber: number;
  longitude: number;
  karaka: string;
  description: string;
  rankAbbr: string;
  isRetro: boolean;
};

export type CalculatorResult = {
  calculator: { calculatorId: string; slug: string; name: string; lang: Lang; calculatorType?: string };
  result: { primary: unknown; all: KarakaRank[] };
  analysis: Record<string, unknown>;
  cached: boolean;
};

export type ApiErrorBody = { success: false; message: string; details?: { field: string; message: string }[] };

export type PublicEnv = { apiUrl: string; siteUrl: string; allowIndexing: boolean };
