// Server-only settings. Read once; values the browser needs are passed through the root loader (publicEnv).
import type { PublicEnv } from "./types";

// Load frontend/.env when present (real environment variables take precedence)
try {
  process.loadEnvFile?.(".env");
} catch {
  /* no .env file: use the environment */
}

const trimSlash = (v: string) => v.replace(/\/+$/, "");

export const serverEnv = {
  apiUrl: trimSlash(process.env.API_URL || "http://localhost:5100"),
  publicApiUrl: trimSlash(process.env.PUBLIC_API_URL || process.env.API_URL || "http://localhost:5100"),
  siteUrl: trimSlash(process.env.SITE_URL || "http://localhost:5173"),
  allowIndexing: process.env.ALLOW_INDEXING === "true",
};

export const publicEnv = (): PublicEnv => ({
  apiUrl: serverEnv.publicApiUrl,
  siteUrl: serverEnv.siteUrl,
  allowIndexing: serverEnv.allowIndexing,
});
