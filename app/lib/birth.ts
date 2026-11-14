// Birth details <-> URL. The result page reads everything from its URL (like Vedaz), so a reading survives a
// refresh and can be shared. Result pages are never indexed.
import type { BirthDetails } from "./types";

export const CUSTOM_PREFIX = "q.";
/** Second person (compatibility calculators) */
export const PARTNER_PREFIX = "p.";

export const birthToParams = (b: BirthDetails, answers: Record<string, string> = {}, partner?: BirthDetails) => {
  const p = new URLSearchParams({ name: b.name.trim(), gender: b.gender, d: b.dob });
  if (b.tob) p.set("t", b.tob);
  if (b.place.trim()) p.set("place", b.place.trim());
  if (partner) {
    p.set(`${PARTNER_PREFIX}name`, partner.name.trim());
    p.set(`${PARTNER_PREFIX}gender`, partner.gender);
    p.set(`${PARTNER_PREFIX}d`, partner.dob);
    if (partner.tob) p.set(`${PARTNER_PREFIX}t`, partner.tob);
    if (partner.place.trim()) p.set(`${PARTNER_PREFIX}place`, partner.place.trim());
  }
  for (const [k, v] of Object.entries(answers)) if (String(v).trim()) p.set(`${CUSTOM_PREFIX}${k}`, String(v).trim());
  return p;
};

const readBirth = (p: URLSearchParams, prefix = ""): BirthDetails => ({
  name: p.get(`${prefix}name`) || "",
  gender: p.get(`${prefix}gender`) || "",
  dob: p.get(`${prefix}d`) || "",
  tob: p.get(`${prefix}t`) || "",
  place: p.get(`${prefix}place`) || "",
});

export const paramsToBirth = (p: URLSearchParams): { birth: BirthDetails; partner: BirthDetails | null; answers: Record<string, string> } => {
  const answers: Record<string, string> = {};
  for (const [k, v] of p.entries()) if (k.startsWith(CUSTOM_PREFIX)) answers[k.slice(CUSTOM_PREFIX.length)] = v;
  return { birth: readBirth(p), partner: p.has(`${PARTNER_PREFIX}name`) ? readBirth(p, PARTNER_PREFIX) : null, answers };
};

/** Complete for what the calculator needs (time and place are not needed by date-only and numerology calculators). */
export const isCompleteBirth = (b: BirthDetails, needs: { time: boolean; place: boolean } = { time: true, place: true }) =>
  Boolean(b.name && b.dob && isValidDob(b.dob) && (!needs.time || /^\d{2}:\d{2}$/.test(b.tob)) && (!needs.place || b.place));

/** DD/MM/YYYY, a real calendar date, not in the future, after 1800. */
export function isValidDob(dob: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dob);
  if (!m) return false;
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d && y > 1800;
}

export const isFutureDob = (dob: string) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dob);
  if (!m) return false;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) > new Date();
};

/** <input type="date"> uses YYYY-MM-DD; the API uses DD/MM/YYYY. */
export const isoToDob = (iso: string) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split("-").reverse().join("/") : "");
export const dobToIso = (dob: string) => (/^\d{2}\/\d{2}\/\d{4}$/.test(dob) ? dob.split("/").reverse().join("-") : "");

export const formatDob = (dob: string, lang: "en" | "hi") => {
  const iso = dobToIso(dob);
  if (!iso) return dob;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" });
};

export const formatTob = (tob: string, lang: "en" | "hi") => {
  const m = /^(\d{2}):(\d{2})$/.exec(tob);
  if (!m) return tob;
  return new Date(2000, 0, 1, Number(m[1]), Number(m[2])).toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-IN", { hour: "numeric", minute: "2-digit" });
};
