import { useEffect, useMemo, useRef, useState } from "react";
import { data as routeData, useSearchParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Clock3, RotateCw, Sparkles } from "lucide-react";
import type { Route } from "./+types/tool";
import { isCompleteBirth, paramsToBirth } from "~/lib/birth";
import { translate, useT } from "~/lib/i18n";
import { langFromRequest } from "~/lib/lang";
import { envFromMatches, seo } from "~/lib/seo";
import { getTool, OTHER_REASON, TOOLS, type ToolDef } from "~/lib/tools";
import type { BirthDetails, Lang } from "~/lib/types";
import type { UIBlock } from "~/lib/result/blocks.types";
import { useAppDispatch, useAppSelector } from "~/store";
import { birthSaved } from "~/store/birthSlice";
import { errorMessage, useToolResultQuery } from "~/store/api";
import { BirthFields, emptyBirth, validateBirth, type BirthErrors } from "~/components/form/BirthFields";
import { Field } from "~/components/form/Field";
import { useToast } from "~/components/ui/Toaster";
import { IconBadge } from "~/components/ui/Icon";
import { ToolCard } from "~/components/calc/Cards";
import { LoadingOrbit, OrbitSystem } from "~/components/result/LoadingOrbit";
import { ScoreRing } from "~/components/result/ScoreRing";
import { Blocks } from "~/components/result/Blocks";
import { ProfileCard, ResultButtons } from "~/components/result/ResultActions";

export function loader({ request, params }: Route.LoaderArgs) {
  const tool = getTool(params.tool);
  if (!tool) throw routeData({ message: "Not found" }, { status: 404 });
  return { lang: langFromRequest(request), slug: tool.slug };
}

export const meta: Route.MetaFunction = ({ loaderData, matches }) => {
  const tool = loaderData && getTool(loaderData.slug);
  if (!loaderData || !tool) return [{ title: "Ambara" }];
  const { lang } = loaderData;
  return seo({
    env: envFromMatches(matches),
    lang,
    path: `/tools/${tool.slug}`,
    title: tool.title[lang],
    description: tool.description[lang],
    breadcrumbs: [
      { name: "Ambara", path: "/" },
      { name: translate(lang, "navTools"), path: `/tools/${tool.slug}` },
    ],
  });
};

const PARTNER = "x.";
const FIELD = "f.";

/** Tool inputs <-> URL, so a reading survives refresh and can be shared (like the calculators). */
function readParams(p: URLSearchParams, tool: ToolDef) {
  const { birth } = paramsToBirth(p);
  const partner: BirthDetails = { name: p.get(`${PARTNER}name`) || "", gender: p.get(`${PARTNER}gender`) || "", dob: p.get(`${PARTNER}d`) || "", tob: p.get(`${PARTNER}t`) || "", place: p.get(`${PARTNER}place`) || "" };
  const fields = Object.fromEntries(tool.fields.map((f) => [f.name, p.get(`${FIELD}${f.name}`) || ""]));
  return { birth, partner, fields };
}

function toBody(tool: ToolDef, birth: BirthDetails, partner: BirthDetails, fields: Record<string, string>, lang: Lang) {
  const body: Record<string, string> = { lang, userName: birth.name, userGender: birth.gender, userDob: birth.dob, userTob: birth.tob, userPob: birth.place };
  if (tool.partner) Object.assign(body, { exName: partner.name, exGender: partner.gender, exDob: partner.dob, exTob: partner.tob, exPob: partner.place });
  for (const f of tool.fields) if (f.name !== "customReason") body[f.name] = fields[f.name] || "";
  if (tool.slug === "will-my-ex-return" && fields.breakupReason === OTHER_REASON) body.breakupReason = fields.customReason || "";
  return body;
}

const isReady = (tool: ToolDef, birth: BirthDetails, partner: BirthDetails, fields: Record<string, string>) =>
  isCompleteBirth(birth) &&
  (!tool.partner || isCompleteBirth(partner)) &&
  tool.fields.every((f) => f.name === "customReason" ? fields.breakupReason !== OTHER_REASON || fields.customReason.trim() : fields[f.name].trim());

export default function ToolPage({ loaderData }: Route.ComponentProps) {
  const { lang } = loaderData;
  const tool = getTool(loaderData.slug)!;
  const t = useT();
  const [params, setParams] = useSearchParams();
  const fromUrl = useMemo(() => readParams(params, tool), [params, tool]);
  const ready = isReady(tool, fromUrl.birth, fromUrl.partner, fromUrl.fields);
  const [editing, setEditing] = useState(false);
  const others = TOOLS.filter((x) => x.slug !== tool.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:pt-14">
      <section className="grid gap-8 pb-10 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rise">
            <IconBadge name={tool.icon} hue={tool.hue} size={56} />
          </div>
          <p className="eyebrow rise mt-6 [animation-delay:60ms]">{tool.tag[lang]}</p>
          <h1 className="rise mt-3 font-display text-[2.1rem] font-semibold leading-[1.1] tracking-tight text-star [animation-delay:120ms] sm:text-5xl">{tool.title[lang]}</h1>
          <p className="rise mt-5 max-w-xl text-lg leading-relaxed text-mist [animation-delay:180ms]">{tool.description[lang]}</p>
        </div>
        <div className="rise [animation-delay:160ms]">
          {ready && !editing ? (
            <ToolResult tool={tool} lang={lang} {...fromUrl} onEdit={() => setEditing(true)} />
          ) : (
            <ToolForm
              key={params.toString()}
              tool={tool}
              lang={lang}
              initial={fromUrl}
              onDone={(p) => {
                setParams(p, { preventScrollReset: true });
                setEditing(false);
              }}
            />
          )}
        </div>
      </section>

      <section className="mt-16" aria-labelledby="more-tools">
        <h2 id="more-tools" className="mb-6 font-display text-2xl font-semibold text-star">
          {t("related")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {others.map((o) => (
            <ToolCard key={o.slug} tool={o} lang={lang} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ToolForm({
  tool,
  lang,
  initial,
  onDone,
}: {
  tool: ToolDef;
  lang: Lang;
  initial: ReturnType<typeof readParams>;
  onDone: (p: URLSearchParams) => void;
}) {
  const t = useT();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const saved = useAppSelector((s) => s.birth.saved);
  const hydrated = useAppSelector((s) => s.birth.hydrated);
  const touched = useRef(false);

  const [step, setStep] = useState(0);
  const [birth, setBirth] = useState<BirthDetails>(initial.birth.name ? initial.birth : emptyBirth);
  const [partner, setPartner] = useState<BirthDetails>(initial.partner);
  const [fields, setFields] = useState<Record<string, string>>(() =>
    Object.fromEntries(tool.fields.map((f) => [f.name, initial.fields[f.name] || f.default])),
  );
  const [errors, setErrors] = useState<BirthErrors>({});
  const [partnerErrors, setPartnerErrors] = useState<BirthErrors>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (hydrated && saved && !touched.current && !birth.name) setBirth(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, saved]);

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateBirth(birth, lang);
    setErrors(errs);
    if (Object.keys(errs).length) return void toast.error(t("errFixForm"));
    dispatch(birthSaved(birth));
    setStep(1);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const pErrs = tool.partner ? validateBirth(partner, lang) : {};
    const fErrs: Record<string, string> = {};
    for (const f of tool.fields) {
      if (f.name === "customReason") {
        if (fields.breakupReason === OTHER_REASON && !fields.customReason.trim()) fErrs.customReason = t("required");
      } else if (!fields[f.name]?.trim()) fErrs[f.name] = t("required");
    }
    setPartnerErrors(pErrs);
    setFieldErrors(fErrs);
    if (Object.keys(pErrs).length || Object.keys(fErrs).length) return void toast.error(t("errFixForm"));

    const p = new URLSearchParams({ name: birth.name.trim(), gender: birth.gender, d: birth.dob, t: birth.tob, place: birth.place.trim() });
    if (tool.partner) {
      p.set(`${PARTNER}name`, partner.name.trim());
      p.set(`${PARTNER}gender`, partner.gender);
      p.set(`${PARTNER}d`, partner.dob);
      p.set(`${PARTNER}t`, partner.tob);
      p.set(`${PARTNER}place`, partner.place.trim());
    }
    for (const f of tool.fields) if (fields[f.name]?.trim()) p.set(`${FIELD}${f.name}`, fields[f.name].trim());
    onDone(p);
  };

  const visibleFields = tool.fields.filter((f) => f.name !== "customReason" || fields.breakupReason === OTHER_REASON);

  return (
    <div className="panel relative overflow-hidden p-5 sm:p-7">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl" style={{ background: `hsl(${tool.hue} 90% 60% / 0.18)` }} />
      <div className="relative mb-6 flex items-start justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-star">{step === 0 ? t("formTitle") : t("toolForm2")}</h2>
        <ol className="flex shrink-0 items-center gap-1.5" aria-label="Steps">
          {[0, 1].map((i) => (
            <li key={i} aria-current={i === step ? "step" : undefined} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? "w-7 bg-gold" : i < step ? "w-3 bg-gold/60" : "w-3 bg-fg/15"}`} />
          ))}
        </ol>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === 0 ? (
          <motion.form key="s0" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} onSubmit={next} noValidate className="relative">
            <BirthFields
              value={birth}
              errors={errors}
              onChange={(b) => {
                touched.current = true;
                setBirth(b);
                if (Object.keys(errors).length) setErrors(validateBirth(b, lang));
              }}
            />
            <div className="mt-7 flex justify-end">
              <button type="submit" className="btn-primary w-full sm:w-auto">
                {t("next")} <ArrowRight size={18} />
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.form key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3 }} onSubmit={submit} noValidate className="relative">
            {tool.partner && (
              <div className="mb-6">
                <p className="mb-4 text-sm font-semibold text-gold">{t("partnerDetails")}</p>
                <BirthFields prefix="x" nameLabel={t("partnerName")} value={partner} errors={partnerErrors} onChange={(b) => { setPartner(b); if (Object.keys(partnerErrors).length) setPartnerErrors(validateBirth(b, lang)); }} />
                <div className="mt-6 border-t border-fg/[0.07]" />
              </div>
            )}
            <div className="grid gap-4">
              {visibleFields.map((f) => (
                <Field key={f.name} id={`f-${f.name}`} label={f.label[lang]} error={fieldErrors[f.name]}>
                  {(a) =>
                    f.kind === "select" ? (
                      <select {...a} className="field" value={fields[f.name]} onChange={(e) => setFields((s) => ({ ...s, [f.name]: e.target.value }))}>
                        {f.options.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label[lang]}
                          </option>
                        ))}
                      </select>
                    ) : f.kind === "textarea" ? (
                      <textarea {...a} rows={4} maxLength={2000} className="field resize-none" placeholder={f.placeholder[lang]} value={fields[f.name]} onChange={(e) => setFields((s) => ({ ...s, [f.name]: e.target.value }))} />
                    ) : (
                      <>
                        <input {...a} className="field" maxLength={300} list={f.suggestions ? `${a.id}-list` : undefined} placeholder={f.placeholder[lang]} value={fields[f.name]} onChange={(e) => setFields((s) => ({ ...s, [f.name]: e.target.value }))} />
                        {f.suggestions && (
                          <datalist id={`${a.id}-list`}>
                            {f.suggestions.map((s) => (
                              <option key={s} value={s} />
                            ))}
                          </datalist>
                        )}
                      </>
                    )
                  }
                </Field>
              ))}
            </div>
            <div className="mt-7 flex items-center justify-between gap-3">
              <button type="button" className="btn-ghost" onClick={() => setStep(0)}>
                <ArrowLeft size={17} /> {t("back")}
              </button>
              <button type="submit" className="btn-primary">
                {t("calculate")} <Sparkles size={17} />
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolResult({ tool, lang, birth, partner, fields, onEdit }: { tool: ToolDef; lang: Lang; birth: BirthDetails; partner: BirthDetails; fields: Record<string, string>; onEdit: () => void }) {
  const t = useT();
  const body = toBody(tool, birth, partner, fields, lang);
  const { data, error, isFetching, refetch } = useToolResultQuery({ tool: tool.slug, body });

  if (error && !isFetching) {
    return (
      <div className="panel flex flex-col items-center px-6 py-12 text-center" role="alert">
        <OrbitSystem still />
        <h2 className="mt-5 font-display text-2xl font-semibold text-star">{t("failedTitle")}</h2>
        <p className="mt-3 text-mist">{errorMessage(error, { network: t("networkError"), tooMany: t("tooMany"), generic: t("failedTitle") })}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button onClick={() => refetch()} className="btn-primary">
            <RotateCw size={16} /> {t("retry")}
          </button>
          <button onClick={onEdit} className="btn-ghost">
            {t("editDetails")}
          </button>
        </div>
      </div>
    );
  }
  if (isFetching || !data) return <LoadingOrbit steps={["loading2", "loading3", "loading4"]} />;

  const score = Number(data[tool.scoreKey]) || 0;
  const timing = String(data[tool.timeKey] ?? "");
  const blocks: UIBlock[] = tool.sections
    .filter((s) => typeof data[s.key] === "string" && String(data[s.key]).trim())
    .map((s) => ({ type: "markdown", title: s.title[lang], content: String(data[s.key]) }));

  return (
    <div className="flex flex-col gap-5">
      <div className="panel grid items-center gap-6 p-6 sm:grid-cols-[auto_1fr]">
        <div className="mx-auto">
          <ScoreRing score={score} size={160} label={tool.scoreLabel[lang]} />
        </div>
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-lagoon">
            <Clock3 size={16} /> {tool.timeLabel[lang]}
          </p>
          <p className="mt-2 font-display text-2xl font-semibold leading-snug text-star">{timing}</p>
        </div>
      </div>
      <ProfileCard
        birth={birth}
        lang={lang}
        extra={tool.partner ? [{ label: t("partnerName"), value: partner.name }] : undefined}
      />
      <Blocks blocks={blocks} lang={lang} />
      <ResultButtons onEdit={onEdit} title={tool.title[lang]} />
      <p className="text-xs leading-relaxed text-haze">{t("disclaimer")}</p>
    </div>
  );
}
