import { useEffect, useState, type ReactNode } from "react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteLoaderData,
  type LinksFunction,
} from "react-router";
import { Provider } from "react-redux";
import { MotionConfig } from "motion/react";
import type { Route } from "./+types/root";
import { publicEnv } from "./lib/env.server";
import { langFromPath, withLang } from "./lib/lang";
import { translate } from "./lib/i18n";
import type { PublicEnv } from "./lib/types";
import { markHydrated } from "./lib/hydration";
import { hydrateFromStorage, makeStore } from "./store";
import { setApiBase, wakeBackendIfAsleep } from "./store/api";
import { Toaster } from "./components/ui/Toaster";
import { Starfield } from "./components/layout/Starfield";
import { OrbitSystem } from "./components/result/LoadingOrbit";
import { themeBootScript } from "./components/layout/ThemeToggle";
import "./app.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Manrope:wght@400..800&family=Noto+Sans+Devanagari:wght@400..700&family=Noto+Serif+Devanagari:wght@500..700&display=swap",
  },
  // Public site design ("pop", used inside .pop only; admin keeps Fraunces/Manrope)
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=DM+Mono:wght@400;500&display=swap",
  },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
];

export function loader() {
  return { env: publicEnv() };
}

export const useEnv = () => useRouteLoaderData<typeof loader>("root")?.env as PublicEnv | undefined;

export function Layout({ children }: { children: ReactNode }) {
  const lang = langFromPath(useLocation().pathname);
  const env = useEnv();
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#070a1c" />
        <meta
          name="google-site-verification"
          content={env?.googleSiteVerification || "ZpB_bgUfDaIX9RAGgiM6ivmABtryUKATLPweuvLEUVI"}
        />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <Meta />
        <Links />
      </head>
      <body className="sky">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const [store] = useState(makeStore);
  setApiBase(loaderData.env.apiUrl);

  useEffect(() => {
    markHydrated();
    hydrateFromStorage(store);
    wakeBackendIfAsleep(); // wake-up ping (see store/api.ts to revert)
  }, [store]);

  return (
    <Provider store={store}>
      <MotionConfig reducedMotion="user">
        <Starfield />
        <Outlet />
        <Toaster />
      </MotionConfig>
    </Provider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const { pathname } = useLocation();
  const lang = langFromPath(pathname);
  const t = (k: Parameters<typeof translate>[1]) => translate(lang, k);
  // Public pages get the site design; admin errors keep the admin look
  const pop = !/^\/admin(\/|$)/.test(pathname);
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const message = isRouteErrorResponse(error)
    ? (error.data as { message?: string } | undefined)?.message || error.statusText
    : import.meta.env.DEV && error instanceof Error
      ? error.message
      : "";

  return (
    <main className={`relative grid min-h-dvh place-items-center px-4 py-16 text-center ${pop ? "pop" : ""}`}>
      {!pop && <Starfield />}
      <div className="relative max-w-md">
        {/* Still (not moving) on errors; the loader is where planets revolve */}
        <div className="mb-8 grid place-items-center">
          <OrbitSystem still />
        </div>
        <p className="eyebrow mb-3">{notFound ? "404" : isRouteErrorResponse(error) ? error.status : "Error"}</p>
        <h1 className="font-display text-3xl font-semibold text-star">{notFound ? t("notFoundTitle") : t("errorTitle")}</h1>
        <p className="mt-3 text-mist">{notFound ? t("notFoundText") : message || (isRouteErrorResponse(error) ? t("networkError") : t("pageError"))}</p>
        <Link to={withLang(lang, "/calculators")} className="btn-primary mt-8">
          {t("goHome")}
        </Link>
      </div>
    </main>
  );
}
