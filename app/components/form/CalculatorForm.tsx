import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Lock, RotateCcw, Sparkles } from "lucide-react";
import { birthToParams } from "~/lib/birth";
import { useT } from "~/lib/i18n";
import { withLang } from "~/lib/lang";
import type { BirthDetails, CustomField, Lang } from "~/lib/types";
import { useAppDispatch, useAppSelector } from "~/store";
import { birthCleared, birthSaved } from "~/store/birthSlice";
import { useToast } from "~/components/ui/Toaster";
import { FORM_NEEDS, formOf } from "~/lib/western";
import { BirthFields, emptyBirth, validateBirth, type BirthErrors } from "./BirthFields";
import { Field } from "./Field";
import { PlaceInput } from "./PlaceInput";

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
};

/** Two-step form: birth details, then the partner's details (compatibility calculators) or this calculator's own
 *  questions (if the admin added any). Time and place are only asked when the calculator uses them. */
export function CalculatorForm({
  slug,
  lang,
  customFields,
  calculatorType,
  heading,
}: {
  slug: string;
  lang: Lang;
  customFields: CustomField[];
  calculatorType?: string;
  /** Optional first-step title (the home page hero uses "Free birth chart") */
  heading?: string;
}) {
  const t = useT();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const saved = useAppSelector((s) => s.birth.saved);
  const hydrated = useAppSelector((s) => s.birth.hydrated);

  const [birth, setBirth] = useState<BirthDetails>(emptyBirth);
  const [errors, setErrors] = useState<BirthErrors>({});
  const [partner, setPartner] = useState<BirthDetails>(emptyBirth);
  const [partnerErrors, setPartnerErrors] = useState<BirthErrors>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answerErrors, setAnswerErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const touched = useRef(false);
  const kind = formOf(calculatorType);
  const needs = FORM_NEEDS[kind];
  const hasQuestions = customFields.length > 0;
  const hasStep2 = needs.partner || hasQuestions;
  const subtitle = kind === "dateOnly" ? t("formSubtitleDate") : kind === "numerology" ? t("formSubtitleNumerology") : kind === "coupleDate" ? t("formSubtitleCoupleDate") : t("formSubtitle");

  // Pre-fill with the details saved on this device, unless the visitor already started typing
  useEffect(() => {
    if (hydrated && saved && !touched.current) setBirth(saved);
  }, [hydrated, saved]);

  const update = (b: BirthDetails) => {
    touched.current = true;
    setBirth(b);
    if (Object.keys(errors).length) setErrors(validateBirth(b, lang, needs));
  };

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
  };

  const submitBirth = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateBirth(birth, lang, needs);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error(t("errFixForm"));
      return;
    }
    dispatch(birthSaved({ ...birth, name: birth.name.trim(), place: birth.place.trim() }));
    if (hasStep2) go(1);
    else finish();
  };

  const submitStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    const pErrs = needs.partner ? validateBirth(partner, lang, needs) : {};
    const errs: Record<string, string> = {};
    for (const f of customFields) if (!String(answers[f.name] ?? "").trim()) errs[f.name] = t("required");
    setPartnerErrors(pErrs);
    setAnswerErrors(errs);
    if (Object.keys(errs).length || Object.keys(pErrs).length) {
      toast.error(t("errFixForm"));
      return;
    }
    finish();
  };

  // Only what this calculator uses goes into the result URL
  const only = (b: BirthDetails): BirthDetails => ({ ...b, name: b.name.trim(), tob: needs.time ? b.tob : "", place: needs.place ? b.place : "" });
  const finish = () =>
    navigate(`${withLang(lang, `/calculators/${slug}/result`)}?${birthToParams(only(birth), answers, needs.partner ? only(partner) : undefined)}`);

  return (
    <div className="panel relative overflow-hidden p-5 sm:p-7">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-aurora/20 blur-3xl" />

      <div className="relative mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-star">{step === 0 ? heading || t("formTitle") : needs.partner ? t("partnerTitle") : t("stepQuestions")}</h2>
          <p className="mt-1 text-sm text-mist">{step === 0 ? subtitle : needs.partner ? t("partnerSubtitle") : t("privacyNote")}</p>
        </div>
        {hasStep2 && (
          <ol className="flex shrink-0 items-center gap-1.5" aria-label="Steps">
            {[0, 1].map((i) => (
              <li key={i} aria-current={i === step ? "step" : undefined} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? "w-7 bg-gold" : i < step ? "w-3 bg-gold/60" : "w-3 bg-fg/15"}`} />
            ))}
          </ol>
        )}
      </div>

      <AnimatePresence mode="wait" custom={dir} initial={false}>
        {step === 0 ? (
          <motion.form key="birth" custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} onSubmit={submitBirth} noValidate className="relative">
            <BirthFields value={birth} onChange={update} errors={errors} needs={needs} nameHint={calculatorType === "luckyNumber" ? t("nameHintLucky") : undefined} />
            <div className="mt-7 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-1.5 text-xs text-haze">
                <Lock size={13} /> {t("privacyNote")}
              </p>
              <div className="flex items-center gap-2">
                {(birth.name || birth.dob || birth.place) && (
                  <button
                    type="button"
                    className="btn-ghost !px-3 !py-2 text-sm"
                    onClick={() => {
                      touched.current = true;
                      dispatch(birthCleared());
                      setBirth(emptyBirth);
                      setErrors({});
                    }}
                  >
                    <RotateCcw size={14} /> {t("clearForm")}
                  </button>
                )}
                <button type="submit" className="btn-primary w-full sm:w-auto">
                  {hasStep2 ? t("next") : t("calculate")} {hasStep2 ? <ArrowRight size={18} /> : <Sparkles size={17} />}
                </button>
              </div>
            </div>
          </motion.form>
        ) : (
          <motion.form key="questions" custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} onSubmit={submitStep2} noValidate className="relative">
            {needs.partner && (
              <BirthFields
                prefix="p"
                nameLabel={t("partnerNameLabel")}
                value={partner}
                errors={partnerErrors}
                needs={needs}
                onChange={(b) => {
                  setPartner(b);
                  if (Object.keys(partnerErrors).length) setPartnerErrors(validateBirth(b, lang, needs));
                }}
              />
            )}
            <div className={`grid gap-4 ${needs.partner && customFields.length ? "mt-4" : ""}`}>
              {customFields.map((f) => (
                <Field key={f.name} id={`q-${f.name}`} label={f.label} error={answerErrors[f.name]}>
                  {(a) =>
                    // A text question named like "returnCity" gets the same place search as the birth place
                    f.type === "text" && /City$/.test(f.name) ? (
                      <PlaceInput id={a.id} value={answers[f.name] ?? ""} invalid={a["aria-invalid"]} describedBy={a["aria-describedby"]} onChange={(v) => setAnswers((s) => ({ ...s, [f.name]: v }))} />
                    ) : f.type === "select" && f.options?.length ? (
                      <select {...a} className="field" value={answers[f.name] ?? ""} onChange={(e) => setAnswers((s) => ({ ...s, [f.name]: e.target.value }))}>
                        <option value="" disabled>
                          {t("select")} {f.label}
                        </option>
                        {f.options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        {...a}
                        className="field"
                        type={f.type === "number" ? "number" : "text"}
                        inputMode={f.type === "number" ? "numeric" : undefined}
                        maxLength={500}
                        placeholder={f.placeholder || ""}
                        value={answers[f.name] ?? ""}
                        onChange={(e) => setAnswers((s) => ({ ...s, [f.name]: e.target.value }))}
                      />
                    )
                  }
                </Field>
              ))}
            </div>
            <div className="mt-7 flex items-center justify-between gap-3">
              <button type="button" className="btn-ghost" onClick={() => go(0)}>
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
