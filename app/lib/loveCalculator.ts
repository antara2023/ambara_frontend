export type ElementType = "Fire" | "Earth" | "Air" | "Water";

export type ZodiacInfo = {
  sign: string;
  element: ElementType;
  symbol: string;
  dates: string;
};

export type DimensionResult = {
  id: "love" | "chemistry" | "friendship" | "communication";
  name: string;
  separator: string;
  score: number;
  description: string;
  hue: number;
};

export type AstrologicalSynergy = {
  partner1: ZodiacInfo & { name: string; dob: string };
  partner2: ZodiacInfo & { name: string; dob: string };
  insight: string;
  relationType: "same" | "compatible" | "complementary";
};

export type LoveCompatibilityResult = {
  partner1Name: string;
  partner2Name: string;
  partner1Dob?: string;
  partner2Dob?: string;
  overallScore: number;
  overallTier: string;
  dimensions: DimensionResult[];
  astrologicalSynergy?: AstrologicalSynergy | null;
};

export const SEPARATORS = {
  love: "|",
  chemistry: "/",
  friendship: "{",
  communication: "}",
} as const;

export const ZODIAC_SIGNS: Record<string, { element: ElementType; symbol: string; dates: string }> = {
  Aries: { element: "Fire", symbol: "♈", dates: "Mar 21 – Apr 19" },
  Taurus: { element: "Earth", symbol: "♉", dates: "Apr 20 – May 20" },
  Gemini: { element: "Air", symbol: "♊", dates: "May 21 – Jun 20" },
  Cancer: { element: "Water", symbol: "♋", dates: "Jun 21 – Jul 22" },
  Leo: { element: "Fire", symbol: "♌", dates: "Jul 23 – Aug 22" },
  Virgo: { element: "Earth", symbol: "♍", dates: "Aug 23 – Sep 22" },
  Libra: { element: "Air", symbol: "♎", dates: "Sep 23 – Oct 22" },
  Scorpio: { element: "Water", symbol: "♏", dates: "Oct 23 – Nov 21" },
  Sagittarius: { element: "Fire", symbol: "♐", dates: "Nov 22 – Dec 21" },
  Capricorn: { element: "Earth", symbol: "♑", dates: "Dec 22 – Jan 19" },
  Aquarius: { element: "Air", symbol: "♒", dates: "Jan 20 – Feb 18" },
  Pisces: { element: "Water", symbol: "♓", dates: "Feb 19 – Mar 20" },
};

/**
 * Deterministic 32-bit string hashing bounded between min (70) and max (94-95).
 * Guarantees the same pair of names always yields the exact same result.
 */
export function calculateDimensionScore(name1: string, name2: string, separator: string, min = 70, max = 95): number {
  // Sort canonically so order of entry (A & B vs B & A) yields the same match
  const [n1, n2] = [name1.trim().toLowerCase(), name2.trim().toLowerCase()].sort();
  const combined = n1 + separator + n2;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return (Math.abs(hash) % (max - min)) + min;
}

export function getTierInterpretation(score: number): string {
  if (score >= 88) return "Exceptional synergy and soulmate-tier resonance.";
  if (score >= 80) return "Vibrant, high-energy bond with natural chemistry.";
  if (score >= 75) return "Harmonious connection with strong mutual respect.";
  return "Good baseline with potential to blossom through shared effort.";
}

export function getSunSign(dateStr?: string): ZodiacInfo | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  let month = 0;
  let day = 0;

  if (dateStr.includes("-")) {
    const parts = dateStr.split("-").map(Number);
    if (parts.length >= 3) {
      month = parts[1];
      day = parts[2];
    }
  } else if (dateStr.includes("/")) {
    const parts = dateStr.split("/").map(Number);
    if (parts.length >= 3) {
      day = parts[0];
      month = parts[1];
    }
  }
  if (!month || !day || isNaN(month) || isNaN(day)) return null;

  let sign = "";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) sign = "Aries";
  else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) sign = "Taurus";
  else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) sign = "Gemini";
  else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) sign = "Cancer";
  else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) sign = "Leo";
  else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) sign = "Virgo";
  else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) sign = "Libra";
  else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) sign = "Scorpio";
  else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) sign = "Sagittarius";
  else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) sign = "Capricorn";
  else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) sign = "Aquarius";
  else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) sign = "Pisces";

  if (!sign || !ZODIAC_SIGNS[sign]) return null;
  return {
    sign,
    element: ZODIAC_SIGNS[sign].element,
    symbol: ZODIAC_SIGNS[sign].symbol,
    dates: ZODIAC_SIGNS[sign].dates,
  };
}

export function getElementalSynergy(
  el1: ElementType,
  el2: ElementType
): { insight: string; relationType: "same" | "compatible" | "complementary" } {
  if (el1 === el2) {
    return {
      insight: `Both share the same element (${el1}), creating instant mutual understanding.`,
      relationType: "same",
    };
  }

  const isCompatible =
    (el1 === "Fire" && el2 === "Air") ||
    (el1 === "Air" && el2 === "Fire") ||
    (el1 === "Earth" && el2 === "Water") ||
    (el1 === "Water" && el2 === "Earth");

  if (isCompatible) {
    return {
      insight: "Your elements naturally nurture and support one another.",
      relationType: "compatible",
    };
  }

  return {
    insight: "Opposite elements provide balance and exciting contrast in your dynamic.",
    relationType: "complementary",
  };
}

export function calculateLoveCompatibility(params: {
  partner1Name: string;
  partner2Name: string;
  partner1Dob?: string;
  partner2Dob?: string;
}): LoveCompatibilityResult {
  const p1 = params.partner1Name.trim();
  const p2 = params.partner2Name.trim();
  if (!p1 || !p2) {
    throw new Error("Both partner names are required.");
  }

  const loveScore = calculateDimensionScore(p1, p2, SEPARATORS.love);
  const chemistryScore = calculateDimensionScore(p1, p2, SEPARATORS.chemistry);
  const friendshipScore = calculateDimensionScore(p1, p2, SEPARATORS.friendship);
  const commScore = calculateDimensionScore(p1, p2, SEPARATORS.communication);

  const overall = Math.round((loveScore + chemistryScore + friendshipScore + commScore) / 4);

  const dimensions: DimensionResult[] = [
    {
      id: "love",
      name: "Love Compatibility",
      separator: SEPARATORS.love,
      score: loveScore,
      description: getTierInterpretation(loveScore),
      hue: 345, // Romantic rose/crimson
    },
    {
      id: "chemistry",
      name: "Physical / Chemistry Compatibility",
      separator: SEPARATORS.chemistry,
      score: chemistryScore,
      description: getTierInterpretation(chemistryScore),
      hue: 15, // Passionate amber/fire
    },
    {
      id: "friendship",
      name: "Friendship Compatibility",
      separator: SEPARATORS.friendship,
      score: friendshipScore,
      description: getTierInterpretation(friendshipScore),
      hue: 168, // Harmonious emerald/teal
    },
    {
      id: "communication",
      name: "Communication Compatibility",
      separator: SEPARATORS.communication,
      score: commScore,
      description: getTierInterpretation(commScore),
      hue: 220, // Serene cosmic sapphire
    },
  ];

  let astrologicalSynergy: AstrologicalSynergy | null = null;
  const sign1 = getSunSign(params.partner1Dob);
  const sign2 = getSunSign(params.partner2Dob);

  if (sign1 && sign2 && params.partner1Dob && params.partner2Dob) {
    const synergy = getElementalSynergy(sign1.element, sign2.element);
    astrologicalSynergy = {
      partner1: { ...sign1, name: p1, dob: params.partner1Dob },
      partner2: { ...sign2, name: p2, dob: params.partner2Dob },
      insight: synergy.insight,
      relationType: synergy.relationType,
    };
  }

  return {
    partner1Name: p1,
    partner2Name: p2,
    partner1Dob: params.partner1Dob?.trim() || undefined,
    partner2Dob: params.partner2Dob?.trim() || undefined,
    overallScore: overall,
    overallTier: getTierInterpretation(overall),
    dimensions,
    astrologicalSynergy,
  };
}
