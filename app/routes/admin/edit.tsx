import { useEffect, useMemo, useState } from "react";
import { Link, useBlocker, useNavigate, useParams, useSearchParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, Eye, Loader2, Plus, Save, Trash2 } from "lucide-react";
import type { CalculatorAdmin, CustomField, Faq, Lang, Listing } from "~/lib/types";
import { buildSlugIndex } from "~/lib/links";
import { errorMessage, useAdminCreateMutation, useAdminDeleteMutation, useAdminGetQuery, useAdminUpdateMutation } from "~/store/api";
import { Article } from "~/components/content/Article";
import { Field } from "~/components/form/Field";
import { useToast } from "~/components/ui/Toaster";

type Draft = Pick<
  CalculatorAdmin,
  "calculatorId" | "name" | "slug" | "lang" | "category" | "isActive" | "seo" | "hero" | "contentMarkdown" | "faqs" | "prompt" | "customFields" | "relatedCalculators" | "compute"
> & { listing: Listing };

const EMPTY: Draft = {
  calculatorId: "",
  name: "",
  slug: "",
  lang: "en",
  category: "",
  isActive: true,
  seo: { metaTitle: "", metaDescription: "" },
  hero: { h1: "", subtitle: "" },
  contentMarkdown: "",
  faqs: [],
  prompt: "",
  customFields: [],
  relatedCalculators: [],
  compute: { chartEndpoint: "planet-detail", calculatorType: "generic" },
  listing: { group: "", sortOrder: 0, shortDescription: "", icon: "" },
};

const toDraft = (c: CalculatorAdmin): Draft => ({
  ...EMPTY,
  ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, (c as Record<string, unknown>)[k] ?? (EMPTY as Record<string, unknown>)[k]])),
  seo: { ...EMPTY.seo, ...c.seo },
  hero: { ...EMPTY.hero, ...c.hero },
  compute: { ...EMPTY.compute, ...c.compute },
  listing: { ...EMPTY.listing, ...c.listing },
  customFields: (c.customFields || []).map((f) => ({ name: f.name, label: f.label, type: f.type || "text", placeholder: f.placeholder || "", options: f.options || [] })),
  faqs: (c.faqs || []).map((f) => ({ question: f.question, answer: f.answer })),
});

const TABS = ["Page", "Article", "FAQs", "SEO", "Form & AI", "Listing"] as const;
const CHART_ENDPOINTS = ["planet-detail", "mahadasha", "antardasha", "paryantardasha", "mangaldosh", "manglikdosh", "extended-kundli-details", "list-of-yogas", "friendship-detail", "kp-planet", "kp-house", "shad-bala"];
const SLUG_RE = /^[a-z0-9-]+$/i;

export default function AdminEdit() {
  const { calculatorId } = useParams();
  const [search] = useSearchParams();
  const lang = (search.get("lang") === "hi" ? "hi" : "en") as Lang;
  const isNew = !calculatorId;
  const navigate = useNavigate();
  const toast = useToast();

  const { data, isLoading, error } = useAdminGetQuery({ calculatorId: calculatorId || "", lang }, { skip: isNew, refetchOnMountOrArgChange: true });
  const [create, createState] = useAdminCreateMutation();
  const [update, updateState] = useAdminUpdateMutation();
  const [remove, removeState] = useAdminDeleteMutation();

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [original, setOriginal] = useState<string>(JSON.stringify(EMPTY));
  const [tab, setTab] = useState<(typeof TABS)[number]>("Page");
  const [preview, setPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");

  useEffect(() => {
    if (data) {
      const d = toDraft(data);
      setDraft(d);
      setOriginal(JSON.stringify(d));
    }
  }, [data]);

  const dirty = JSON.stringify(draft) !== original;
  const saving = createState.isLoading || updateState.isLoading;
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !saving && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const problems = useMemo(() => {
    const p: string[] = [];
    if (!SLUG_RE.test(draft.calculatorId)) p.push("Id: letters, numbers and dashes only");
    if (!SLUG_RE.test(draft.slug)) p.push("Slug: letters, numbers and dashes only");
    if (!draft.name.trim()) p.push("Name is required");
    draft.customFields.forEach((f, i) => {
      if (!f.name.trim() || !f.label.trim()) p.push(`Question ${i + 1}: name and label are required`);
      if (f.type === "select" && !f.options?.length) p.push(`Question ${i + 1}: add options for a dropdown`);
    });
    return p;
  }, [draft]);

  const save = async () => {
    if (problems.length) return void toast.error(problems[0]);
    const { lang: draftLang, ...rest } = draft;
    const res = isNew ? await create(draft) : await update({ calculatorId: calculatorId!, lang, data: rest });
    if ("error" in res && res.error) return void toast.error(errorMessage(res.error, { network: "Can't reach the server.", tooMany: "Too many requests.", generic: "Save failed." }));
    setOriginal(JSON.stringify(draft));
    toast.success("Saved. The site shows the change right away.");
    if (isNew) navigate(`/admin/calculators/${draft.calculatorId}?lang=${draftLang}`, { replace: true });
    else if (rest.calculatorId !== calculatorId) navigate(`/admin/calculators/${rest.calculatorId}?lang=${lang}`, { replace: true });
  };

  const doDelete = async () => {
    const res = await remove({ calculatorId: calculatorId!, lang });
    if ("error" in res && res.error) return void toast.error("Delete failed.");
    setOriginal(JSON.stringify(draft));
    toast.success("Deleted.");
    navigate("/admin", { replace: true });
  };

  if (!isNew && isLoading) return <div className="skeleton h-96" />;
  if (!isNew && error) return <p className="text-ember">{errorMessage(error, { network: "Can't reach the server.", tooMany: "Too many requests.", generic: "Not found." })}</p>;

  const sitePath = `${draft.lang === "hi" ? "/hi" : ""}/calculators/${draft.slug}`;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-mist hover:text-star">
            <ArrowLeft size={15} /> All calculators
          </Link>
          <h1 className="mt-2 font-display text-3xl font-semibold text-star">{isNew ? "New calculator" : draft.hero.h1 || draft.name}</h1>
          {!isNew && (
            <p className="mt-1 text-sm text-haze">
              {draft.calculatorId} · {lang.toUpperCase()} ·{" "}
              <a href={sitePath} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-gold hover:underline">
                View page <ExternalLink size={12} />
              </a>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>{dirty && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-gold">Unsaved changes</motion.span>}</AnimatePresence>
          <button className="btn-primary" onClick={save} disabled={saving || (!dirty && !isNew)}>
            {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />} Save
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-fg/[0.07]" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-semibold ${tab === t ? "text-star" : "text-haze hover:text-mist"}`}>
            {t}
            {tab === t && <motion.span layoutId="admin-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gold" />}
          </button>
        ))}
      </div>

      <div className="mt-6" role="tabpanel">
        {tab === "Page" && (
          <div className="panel grid gap-5 p-6 md:grid-cols-2">
            <Field id="cid" label="Calculator id (same in every language)" hint={isNew ? "e.g. nakshatra-calculator" : undefined}>
              {(a) => <input {...a} className="field" value={draft.calculatorId} onChange={(e) => set("calculatorId", e.target.value.trim())} />}
            </Field>
            <Field id="slug" label="URL slug" hint={`/calculators/${draft.slug || "…"}`}>
              {(a) => <input {...a} className="field" value={draft.slug} onChange={(e) => set("slug", e.target.value.trim())} />}
            </Field>
            <Field id="name" label="Internal name">
              {(a) => <input {...a} className="field" value={draft.name} onChange={(e) => set("name", e.target.value)} />}
            </Field>
            <Field id="lang" label="Language">
              {(a) => (
                <select {...a} className="field" value={draft.lang} disabled={!isNew} onChange={(e) => set("lang", e.target.value as Lang)}>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              )}
            </Field>
            <Field id="h1" label="Page heading (H1)" className="md:col-span-2">
              {(a) => <input {...a} className="field" value={draft.hero.h1} onChange={(e) => set("hero", { ...draft.hero, h1: e.target.value })} />}
            </Field>
            <Field id="sub" label="Intro line" className="md:col-span-2">
              {(a) => <textarea {...a} rows={3} className="field" value={draft.hero.subtitle} onChange={(e) => set("hero", { ...draft.hero, subtitle: e.target.value })} />}
            </Field>
            <label className="flex items-center gap-3 text-sm font-semibold text-star">
              <input type="checkbox" className="h-4 w-4 accent-[var(--color-gold)]" checked={draft.isActive} onChange={(e) => set("isActive", e.target.checked)} />
              Live on the site
            </label>
          </div>
        )}

        {tab === "Article" && (
          <div className="panel p-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-mist">Markdown. Use ## for sections (they appear in “On this page”).</p>
              <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => setPreview((p) => !p)}>
                <Eye size={14} /> {preview ? "Edit" : "Preview"}
              </button>
            </div>
            {preview ? (
              <div className="rounded-2xl border border-fg/10 p-6">
                <Article markdown={draft.contentMarkdown} slugIndex={buildSlugIndex({})} />
              </div>
            ) : (
              <textarea className="field min-h-[60vh] font-mono text-sm leading-relaxed" value={draft.contentMarkdown} onChange={(e) => set("contentMarkdown", e.target.value)} />
            )}
            <p className="mt-2 text-xs text-haze">{draft.contentMarkdown.length.toLocaleString()} characters</p>
          </div>
        )}

        {tab === "FAQs" && (
          <ListEditor<Faq>
            items={draft.faqs}
            onChange={(v) => set("faqs", v)}
            empty={{ question: "", answer: "" }}
            addLabel="Add question"
            render={(f, upd, i) => (
              <div className="grid gap-3">
                <Field id={`faq-q-${i}`} label="Question">
                  {(a) => <input {...a} className="field" value={f.question} onChange={(e) => upd({ ...f, question: e.target.value })} />}
                </Field>
                <Field id={`faq-a-${i}`} label="Answer">
                  {(a) => <textarea {...a} rows={3} className="field" value={f.answer} onChange={(e) => upd({ ...f, answer: e.target.value })} />}
                </Field>
              </div>
            )}
          />
        )}

        {tab === "SEO" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="panel grid gap-5 p-6">
              <Field id="mt" label={`Meta title (${draft.seo.metaTitle.length}/60)`} error={draft.seo.metaTitle.length > 70 ? "Long titles get cut off in Google" : undefined}>
                {(a) => <input {...a} className="field" value={draft.seo.metaTitle} onChange={(e) => set("seo", { ...draft.seo, metaTitle: e.target.value })} />}
              </Field>
              <Field id="md" label={`Meta description (${draft.seo.metaDescription.length}/160)`} error={draft.seo.metaDescription.length > 180 ? "Long descriptions get cut off in Google" : undefined}>
                {(a) => <textarea {...a} rows={4} className="field" value={draft.seo.metaDescription} onChange={(e) => set("seo", { ...draft.seo, metaDescription: e.target.value })} />}
              </Field>
            </div>
            <div className="rounded-[var(--radius-card)] bg-white p-6 text-left">
              <p className="text-xs text-[#4d5156]">ambara.io › calculators › {draft.slug}</p>
              <p className="mt-1 truncate text-xl text-[#1a0dab]">{draft.seo.metaTitle || draft.hero.h1 || "Page title"}</p>
              <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">{draft.seo.metaDescription || draft.hero.subtitle || "Description"}</p>
            </div>
          </div>
        )}

        {tab === "Form & AI" && (
          <div className="grid gap-6">
            <div>
              <h2 className="mb-1 font-semibold text-star">Extra questions</h2>
              <p className="mb-4 text-sm text-mist">Asked after the birth details. Every question is required, and the answers are sent to the AI.</p>
              <ListEditor<CustomField>
                items={draft.customFields}
                onChange={(v) => set("customFields", v)}
                empty={{ name: "", label: "", type: "text", placeholder: "", options: [] }}
                addLabel="Add question"
                render={(f, upd, i) => (
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field id={`cf-l-${i}`} label="Question shown to the visitor">
                      {(a) => <input {...a} className="field" value={f.label} onChange={(e) => upd({ ...f, label: e.target.value })} />}
                    </Field>
                    <Field id={`cf-n-${i}`} label="Key (no spaces)">
                      {(a) => <input {...a} className="field" value={f.name} onChange={(e) => upd({ ...f, name: e.target.value.replace(/\s+/g, "") })} />}
                    </Field>
                    <Field id={`cf-t-${i}`} label="Answer type">
                      {(a) => (
                        <select {...a} className="field" value={f.type} onChange={(e) => upd({ ...f, type: e.target.value as CustomField["type"] })}>
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="select">Dropdown</option>
                        </select>
                      )}
                    </Field>
                    {f.type === "select" ? (
                      <Field id={`cf-o-${i}`} label="Options (one per line)">
                        {(a) => <textarea {...a} rows={3} className="field" value={(f.options || []).join("\n")} onChange={(e) => upd({ ...f, options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} />}
                      </Field>
                    ) : (
                      <Field id={`cf-p-${i}`} label="Placeholder">
                        {(a) => <input {...a} className="field" value={f.placeholder || ""} onChange={(e) => upd({ ...f, placeholder: e.target.value })} />}
                      </Field>
                    )}
                  </div>
                )}
              />
            </div>
            <div className="panel p-6">
              <Field id="prompt" label="AI instructions (system prompt)" hint="Leave empty to use the default prompt. Hindi pages fall back to the English prompt when empty.">
                {(a) => <textarea {...a} className="field min-h-[40vh] font-mono text-sm" value={draft.prompt} onChange={(e) => set("prompt", e.target.value)} />}
              </Field>
            </div>
          </div>
        )}

        {tab === "Listing" && (
          <div className="panel grid gap-5 p-6 md:grid-cols-2">
            <Field id="ctype" label="How the result is computed">
              {(a) => (
                <select {...a} className="field" value={draft.compute.calculatorType} onChange={(e) => set("compute", { ...draft.compute, calculatorType: e.target.value as Draft["compute"]["calculatorType"] })}>
                  <option value="generic">Generic (planet details → AI)</option>
                  <option value="charaKarakas">Chara Karakas (Atmakaraka / Darakaraka)</option>
                </select>
              )}
            </Field>
            <Field id="chart" label="Chart data used">
              {(a) => (
                <select {...a} className="field" value={draft.compute.chartEndpoint} onChange={(e) => set("compute", { ...draft.compute, chartEndpoint: e.target.value })}>
                  {CHART_ENDPOINTS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              )}
            </Field>
            <div className="md:col-span-2 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-star text-sm">Most Popular Category ⭐</p>
                <p className="text-xs text-mist mt-0.5">Show this calculator on the public site in the Most Popular section.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-amber-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-amber-400"
                  checked={draft.listing.group === "popular"}
                  onChange={(e) => set("listing", { ...draft.listing, group: e.target.checked ? "popular" : "" })}
                />
                <span>Include in Most Popular</span>
              </label>
            </div>
            <Field id="group" label="Hub group" hint="“popular” puts it in Most Popular; “sarkari” puts it under Sarkari Naukri; empty = standard">
              {(a) => <input {...a} className="field" value={draft.listing.group} onChange={(e) => set("listing", { ...draft.listing, group: e.target.value.trim() })} />}
            </Field>
            <Field id="cat" label="Category">
              {(a) => <input {...a} className="field" value={draft.category || ""} onChange={(e) => set("category", e.target.value.trim())} />}
            </Field>
            <Field id="sort" label="Sort order">
              {(a) => <input {...a} type="number" className="field" value={draft.listing.sortOrder} onChange={(e) => set("listing", { ...draft.listing, sortOrder: Number(e.target.value) || 0 })} />}
            </Field>
            <Field id="short" label="Card description" className="md:col-span-2">
              {(a) => <textarea {...a} rows={3} className="field" value={draft.listing.shortDescription} onChange={(e) => set("listing", { ...draft.listing, shortDescription: e.target.value })} />}
            </Field>
          </div>
        )}
      </div>

      {!isNew && (
        <div className="mt-12 rounded-[var(--radius-card)] border border-ember/25 p-6">
          <h2 className="font-semibold text-ember">Delete this language version</h2>
          <p className="mt-1 text-sm text-mist">
            Removes the {lang.toUpperCase()} page of <b className="text-star">{calculatorId}</b> permanently. Type the id to confirm.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <input className="field max-w-xs" placeholder={calculatorId} value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} />
            <button className="btn-ghost !border-ember/40 text-ember disabled:opacity-40" disabled={confirmDelete !== calculatorId || removeState.isLoading} onClick={doDelete}>
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {blocker.state === "blocked" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] grid place-items-center bg-ink/70 px-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} className="panel max-w-sm !bg-night p-6" role="alertdialog" aria-modal>
              <h2 className="font-display text-xl font-semibold text-star">Leave without saving?</h2>
              <p className="mt-2 text-sm text-mist">Your changes to this calculator will be lost.</p>
              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={() => blocker.reset()}>
                  Stay
                </button>
                <button className="btn-primary" onClick={() => blocker.proceed()}>
                  Leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ListEditor<T>({ items, onChange, empty, addLabel, render }: { items: T[]; onChange: (v: T[]) => void; empty: T; addLabel: string; render: (item: T, update: (v: T) => void, i: number) => React.ReactNode }) {
  const move = (i: number, d: number) => {
    const next = [...items];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    onChange(next);
  };
  return (
    <div className="grid gap-4">
      <AnimatePresence initial={false}>
        {items.map((it, i) => (
          <motion.div key={i} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-haze">#{i + 1}</span>
              <div className="flex gap-1">
                <button className="btn-ghost !p-1.5" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                  <ArrowUp size={14} />
                </button>
                <button className="btn-ghost !p-1.5" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                  <ArrowDown size={14} />
                </button>
                <button className="btn-ghost !p-1.5 text-ember" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {render(it, (v) => onChange(items.map((x, j) => (j === i ? v : x))), i)}
          </motion.div>
        ))}
      </AnimatePresence>
      <button className="btn-ghost justify-self-start" onClick={() => onChange([...items, { ...empty }])}>
        <Plus size={16} /> {addLabel}
      </button>
    </div>
  );
}
