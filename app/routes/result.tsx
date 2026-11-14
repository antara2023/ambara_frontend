import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft, CalendarHeart, RotateCw } from "lucide-react";
import type { Route } from "./+types/result";
import { fetchCalculator } from "~/lib/api.server";
import { isCompleteBirth, paramsToBirth } from "~/lib/birth";
import { useT } from "~/lib/i18n";
import { langFromRequest, withLang } from "~/lib/lang";
import { mapCalculatorResultToBlocks } from "~/lib/result/mapBlocks";
import { toLine } from "~/lib/result/toText";
import type { ScoreBlock } from "~/lib/result/blocks.types";
import { envFromMatches, seo } from "~/lib/seo";
import type { KarakaRank } from "~/lib/types";
import { errorMessage, useCalculatorResultQuery } from "~/store/api";
import { LoadingOrbit, OrbitSystem } from "~/components/result/LoadingOrbit";
import { ScoreRing } from "~/components/result/ScoreRing";
import { Blocks } from "~/components/result/Blocks";
import { KarakaPanel } from "~/components/result/KarakaPanel";
import { WesternPanel } from "~/components/result/WesternPanel";
import { FORM_NEEDS, formOf, WESTERN_TYPES } from "~/lib/western";
import { ProfileCard, ResultButtons } from "~/components/result/ResultActions";

export async function loader({ request, params }: Route.LoaderArgs) {
  const lang = langFromRequest(request);
  const content = await fetchCalculator(params.slug, lang);
  const self = `/calculators/${content.slug}/result`;
  const other = content.alternate ? `/calculators/${content.alternate.slug}/result` : null;
  const search = new URL(request.url).search;
  return {
    lang,
    calc: { slug: content.slug, calculatorId: content.calculatorId, name: content.name, title: content.hero?.h1 || content.name, type: content.compute?.calculatorType },
    questions: (content.customFields || []).map((f) => ({ name: f.name, label: f.label })),
    alternate: { en: lang === "en" ? self + search : other && other + search, hi: lang === "hi" ? self + search : other && other + search },
  };
}

// Personal readings are never indexed
export const meta: Route.MetaFunction = ({ loaderData, matches }) =>
  loaderData
    ? seo({ env: envFromMatches(matches), lang: loaderData.lang, path: `/calculators/${loaderData.calc.slug}/result`, title: loaderData.calc.title, noindex: true })
    : [{ title: "Ambara" }];

export default function ResultPage({ loaderData }: Route.ComponentProps) {
  const { lang, calc, questions } = loaderData;
  const t = useT();
  const [params] = useSearchParams();
  const { birth, partner, answers } = useMemo(() => paramsToBirth(params), [params]);
  const needs = FORM_NEEDS[formOf(calc.type)];
  const complete = isCompleteBirth(birth, needs) && (!needs.partner || (!!partner && isCompleteBirth(partner, needs)));
  const formPath = withLang(lang, `/calculators/${calc.slug}`);

  const args = {
    slug: calc.slug,
    body: {
      userName: birth.name,
      userGender: birth.gender,
      userDob: birth.dob,
      userTob: needs.time ? birth.tob : "",
      userPob: needs.place ? birth.place : "",
      lang,
      ...(needs.partner && partner
        ? { partner: { name: partner.name, gender: partner.gender, dob: partner.dob, tob: needs.time ? partner.tob : "", pob: needs.place ? partner.place : "" } }
        : {}),
      ...(Object.keys(answers).length ? { customAnswers: answers } : {}),
    },
  };
  const { data, error, isFetching, refetch } = useCalculatorResultQuery(args, { skip: !complete });

  const blocks = useMemo(
    // New Western calculators: score titled from the short name ("Birth Chart Score"), not the long page heading
    () => (data ? mapCalculatorResultToBlocks(calc.calculatorId, data.analysis, lang === "hi", calc.type && WESTERN_TYPES.has(calc.type) ? calc.name : calc.title, birth.name, birth.dob) : []),
    [data, calc.calculatorId, calc.title, calc.name, calc.type, lang, birth.name, birth.dob],
  );
  const score = blocks.find((b): b is ScoreBlock => b.type === "score");
  const rest = blocks.filter((b) => b.type !== "score");
  const karaka = calc.type === "charaKarakas" && data?.result?.all?.length ? { primary: data.result.primary as KarakaRank, all: data.result.all } : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:pt-12">
      {/* Back button (icon only) and the title in one row; the empty column on the right keeps the title centred */}
      <div className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-3">
        <Link
          to={formPath}
          aria-label={`${t("back")}: ${calc.title.split(/[:|–—]\s/)[0]}`}
          title={calc.title.split(/[:|–—]\s/)[0]}
          className="grid h-11 w-11 place-items-center rounded-full border-2 border-fg text-star transition-colors hover:bg-gold hover:text-on-gold"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-balance text-center font-display text-3xl font-semibold tracking-tight text-star sm:text-4xl">{calc.title}</h1>
        <span aria-hidden />
      </div>

      <div className="mt-10">
        {!complete ? (
          <Problem text={t("missingDetails")} action={<Link to={formPath} className="btn-primary">{t("editDetails")}</Link>} />
        ) : error && !isFetching ? (
          <Problem
            title={t("failedTitle")}
            text={errorMessage(error, { network: t("networkError"), tooMany: t("tooMany"), generic: t("failedTitle") })}
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => refetch()} className="btn-primary">
                  <RotateCw size={16} /> {t("retry")}
                </button>
                <Link to={formPath} className="btn-ghost">
                  {t("editDetails")}
                </Link>
              </div>
            }
          />
        ) : isFetching || !data ? (
          <div className="mx-auto max-w-xl">
            <LoadingOrbit />
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[340px_1fr]">
            <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
              {score && (
                <div className="panel flex flex-col items-center p-6 text-center">
                  <p className="mb-4 text-sm font-semibold text-mist">{toLine(score.title, lang)}</p>
                  <ScoreRing score={Number(score.score)} max={score.maxScore || 100} />
                  {(score.favorableDescription || score.favorableMonths) && (
                    <div className="mt-6 w-full rounded-2xl border border-lagoon/20 bg-lagoon/[0.06] p-4 text-left">
                      <p className="flex items-center gap-2 text-sm font-semibold text-lagoon">
                        <CalendarHeart size={16} /> {toLine(score.favorableTitle, lang)}
                      </p>
                      {score.favorableMonths && <p className="mt-1 text-sm font-semibold text-star">{toLine(score.favorableMonths, lang)}</p>}
                      {score.favorableDescription && <p className="mt-1 text-sm leading-relaxed text-mist">{toLine(score.favorableDescription, lang)}</p>}
                    </div>
                  )}
                </div>
              )}
              <ProfileCard
                birth={birth}
                lang={lang}
                extra={[
                  ...(needs.partner && partner ? [{ label: t("partnerLabel"), value: partner.name }] : []),
                  ...Object.entries(answers).map(([k, v]) => ({ label: questions.find((q) => q.name === k)?.label || k, value: v })),
                ]}
              />
              <ResultButtons editTo={formPath} title={calc.title} />
            </aside>

            <div className="flex min-w-0 flex-col gap-5">
              {karaka && <KarakaPanel primary={karaka.primary} all={karaka.all} lang={lang} />}
              {calc.type && WESTERN_TYPES.has(calc.type) && <WesternPanel type={calc.type} data={data.result?.primary} />}
              <Blocks blocks={rest} lang={lang} />
              <p className="px-1 pt-2 text-xs leading-relaxed text-haze">{t("disclaimer")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Problem({ title, text, action }: { title?: string; text: string; action: React.ReactNode }) {
  return (
    <div className="panel mx-auto flex max-w-lg flex-col items-center px-6 py-12 text-center" role="alert">
      <OrbitSystem still />
      {title && <h2 className="mt-5 font-display text-2xl font-semibold text-star">{title}</h2>}
      <p className="mt-3 text-mist">{text}</p>
      <div className="mt-7">{action}</div>
    </div>
  );
}
