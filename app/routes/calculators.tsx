import type { Route } from "./+types/calculators";
import { fetchCalculatorList } from "~/lib/api.server";
import { translate, useT } from "~/lib/i18n";
import { langFromRequest, useLang } from "~/lib/lang";
import { envFromMatches, seo } from "~/lib/seo";
import { Hub } from "~/components/calc/Hub";

export const headers: Route.HeadersFunction = () => ({
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
});

export async function loader({ request }: Route.LoaderArgs) {
  const lang = langFromRequest(request);
  return { lang, list: await fetchCalculatorList(lang) };
}

export const meta: Route.MetaFunction = ({ loaderData, matches }) => {
  const env = envFromMatches(matches);
  const lang = loaderData?.lang ?? "en";
  return seo({
    env,
    lang,
    path: "/calculators",
    title: lang === "hi" ? "वैदिक ज्योतिष कैलकुलेटर — कुंडली, दोष, दशा" : "Vedic Astrology Calculators — Kundli, Dosha & Dasha Tools",
    description: translate(lang, "heroText"),
    breadcrumbs: [
      { name: "Ambara", path: "/" },
      { name: translate(lang, "allCalculatorsTitle"), path: "/calculators" },
    ],
  });
};

export default function Calculators({ loaderData }: Route.ComponentProps) {
  const t = useT();
  const lang = useLang();
  return (
    <>
      <header className="mx-auto max-w-6xl px-4 pb-4 pt-12 text-center sm:px-6 md:pt-16">
        <p className="eyebrow rise">{t("heroEyebrow")}</p>
        <h1 className="rise mt-4 font-display text-4xl font-semibold tracking-tight text-star [animation-delay:80ms] sm:text-5xl">{t("allCalculatorsTitle")}</h1>
        <p className="rise mx-auto mt-4 max-w-2xl text-mist [animation-delay:160ms]">{t("heroText")}</p>
      </header>
      <Hub list={loaderData.list} lang={lang} sections={["popular", "categories"]} />
    </>
  );
}
