import type { Lang } from "~/lib/types";

/**
 * AI answers don't always follow the requested shape: a field asked for as text can come back as a list or an
 * object. Turn any value into readable markdown text instead of crashing:
 *   text -> as is ("\n" written literally by the AI becomes a real line break)
 *   list -> one "- item" line per entry
 *   object -> one "**Label**: value" line per key
 */
export function toText(value: unknown, lang: Lang = "en"): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.replace(/\\n/g, "\n");
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? (lang === "hi" ? "हाँ" : "Yes") : lang === "hi" ? "नहीं" : "No";
  if (Array.isArray(value)) {
    return value
      .map((item) => toText(item, lang).trim())
      .filter(Boolean)
      .map((line) => (/^[-*]\s/.test(line) ? line : `- ${line.replace(/\n+/g, " ")}`))
      .join("\n");
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([k, v]) => `**${k}**: ${toText(v, lang).replace(/\n+/g, "; ")}`)
      .join("\n\n");
  }
  return String(value);
}

/** Same as toText but for one short line (no markdown): lists and objects are joined with commas. */
export function toLine(value: unknown, lang: Lang = "en"): string {
  if (Array.isArray(value)) return value.map((v) => toLine(v, lang)).filter(Boolean).join(", ");
  if (value && typeof value === "object") return Object.entries(value as Record<string, unknown>).map(([k, v]) => `${k}: ${toLine(v, lang)}`).join(", ");
  return toText(value, lang).replace(/\*\*/g, "");
}
