import type { Route } from "./+types/home";
import { fetchCalculatorList } from "~/lib/api.server";
import { translate } from "~/lib/i18n";
import { langFromRequest, useLang } from "~/lib/lang";
import { envFromMatches, seo } from "~/lib/seo";
import { PopHome } from "~/components/home/PopHome";

export const headers: Route.HeadersFunction = () => ({
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
});

export async function loader({ request }: Route.LoaderArgs) {
  const lang = langFromRequest(request);
  const list = await fetchCalculatorList(lang);
  return { lang, list };
}

export const meta: Route.MetaFunction = ({ loaderData, matches }) => {
  const env = envFromMatches(matches);
  const lang = loaderData?.lang ?? "en";
  return seo({
    env,
    lang,
    path: "/",
    title: lang === "hi" ? "Ambara — मुफ़्त वैदिक ज्योतिष कैलकुलेटर" : "Ambara — Free Vedic Astrology Calculators",
    description: translate(lang, "heroText"),
  });
};

export default function Home({ loaderData }: Route.ComponentProps) {
  const lang = useLang();
  return <PopHome list={loaderData.list} lang={lang} />;
}
