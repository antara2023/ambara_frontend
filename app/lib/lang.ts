import { useLocation } from "react-router";
import type { Lang } from "./types";

export const langFromPath = (pathname: string): Lang => (pathname === "/hi" || pathname.startsWith("/hi/") ? "hi" : "en");

export const langFromRequest = (request: Request): Lang => langFromPath(new URL(request.url).pathname);

/** Prefix a site path with the language: ("hi", "/calculators") -> "/hi/calculators". */
export const withLang = (lang: Lang, path: string) => {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === "en") return clean;
  return clean === "/" ? "/hi" : `/hi${clean}`;
};

/** The same path without the language prefix: "/hi/calculators" -> "/calculators". */
export const stripLang = (pathname: string) => (langFromPath(pathname) === "hi" ? pathname.replace(/^\/hi(?=\/|$)/, "") || "/" : pathname);

export const useLang = (): Lang => langFromPath(useLocation().pathname);
