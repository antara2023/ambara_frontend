import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

// Server-side rendering on, so calculator pages (articles, FAQs, meta tags) are in the HTML for search engines.
// On Vercel (VERCEL=1 during its build) the preset builds the server for Vercel Functions; elsewhere the normal
// build is kept, so `npm start` (react-router-serve) still works.
export default {
  ssr: true,
  presets: process.env.VERCEL ? [vercelPreset()] : [],
} satisfies Config;
