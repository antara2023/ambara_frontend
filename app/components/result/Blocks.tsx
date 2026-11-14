import { Component, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "motion/react";
import { AlertTriangle, CalendarDays, CheckCircle2, Compass, Info, ListChecks, Sparkles, Target, type LucideIcon } from "lucide-react";
import type { UIBlock } from "~/lib/result/blocks.types";
import { toLine, toText } from "~/lib/result/toText";
import type { Lang } from "~/lib/types";

const ICONS: Record<string, LucideIcon> = { Compass, AlertTriangle, Sparkles, Target, Calendar: CalendarDays };

/** If one card still fails to render, skip just that card instead of losing the whole reading. */
class CardBoundary extends Component<{ children: ReactNode; name?: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error(`Result card "${this.props.name || ""}" could not be shown:`, error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Card({ index, title, icon: Icon = Sparkles, accent = 260, children }: { index: number; title?: string; icon?: LucideIcon; accent?: number; children: ReactNode }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.55, delay: Math.min(index, 4) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="panel relative overflow-hidden p-6 sm:p-7"
    >
      <span aria-hidden className="absolute inset-y-6 left-0 w-[3px] rounded-r-full" style={{ background: `linear-gradient(hsl(${accent} 90% 70%), hsl(${accent + 40} 90% 55% / 0.2))` }} />
      {title && (
        <h3 className="mb-4 flex items-center gap-2.5 font-display text-xl font-semibold text-star">
          <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: `hsl(${accent} 80% 60% / 0.14)`, color: `hsl(${accent} 95% var(--accent-ink, 75%))` }}>
            <Icon size={16} />
          </span>
          {title}
        </h3>
      )}
      {children}
    </motion.article>
  );
}

/** Markdown for any value the AI returned (text, list or object). */
const Md = ({ value, lang }: { value: unknown; lang: Lang }) => (
  <div className="article prose prose-invert max-w-none prose-p:my-2 prose-p:leading-relaxed prose-ul:my-2 prose-li:my-1">
    <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
      {toText(value, lang)}
    </ReactMarkdown>
  </div>
);

const asList = (v: unknown): unknown[] => (Array.isArray(v) ? v : v === null || v === undefined || v === "" ? [] : [v]);
const isPlainObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

const ACCENTS = [262, 38, 172, 330, 205, 290, 12];

/** Renders every non-score block of a reading as its own animated card. */
export function Blocks({ blocks, lang }: { blocks: UIBlock[]; lang: Lang }) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((b, i) => (
        <CardBoundary key={i} name={b.title}>
          <BlockCard b={b} i={i} lang={lang} />
        </CardBoundary>
      ))}
    </div>
  );
}

function BlockCard({ b, i, lang }: { b: UIBlock; i: number; lang: Lang }) {
  const accent = ACCENTS[i % ACCENTS.length];
  const Icon = (b.icon && ICONS[b.icon]) || undefined;
  switch (b.type) {
    case "markdown":
      return (
        <Card index={i} title={b.title} icon={Icon} accent={accent}>
          <Md value={b.content} lang={lang} />
        </Card>
      );
    case "list":
      return (
        <Card index={i} title={b.title} icon={Icon || ListChecks} accent={accent}>
          <ul className="space-y-2.5">
            {asList(b.items).map((it, j) => (
              <li key={j} className="flex gap-3 text-mist">
                <CheckCircle2 size={17} className="mt-1 shrink-0" style={{ color: `hsl(${accent} 90% var(--accent-ink, 70%))` }} />
                <span className="leading-relaxed">{toLine(it, lang)}</span>
              </li>
            ))}
          </ul>
        </Card>
      );
    case "key-value":
      return (
        <Card index={i} title={b.title} icon={Icon || Compass} accent={accent}>
          {isPlainObject(b.data) ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              {Object.entries(b.data).map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-fg/[0.07] bg-fg/[0.025] px-4 py-3">
                  <dt className="text-[0.7rem] font-bold uppercase tracking-wider text-haze">{k}</dt>
                  <dd className="mt-1 font-semibold leading-snug text-star">{toLine(v, lang)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <Md value={b.data} lang={lang} />
          )}
        </Card>
      );
    case "alert": {
      const warn = b.severity === "warning" || b.severity === "error";
      return (
        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`flex gap-4 rounded-[var(--radius-card)] border p-5 sm:p-6 ${warn ? "border-ember/30 bg-ember/[0.06]" : "border-gold/25 bg-gold/[0.05]"}`}
        >
          {warn ? <AlertTriangle className="mt-0.5 shrink-0 text-ember" size={20} /> : <Info className="mt-0.5 shrink-0 text-gold" size={20} />}
          <div>
            {b.title && <p className="mb-1 font-semibold text-star">{b.title}</p>}
            <Md value={b.content} lang={lang} />
          </div>
        </motion.aside>
      );
    }
    case "timeline":
      return (
        <Card index={i} title={b.title} icon={CalendarDays} accent={accent}>
          <ol className="relative ml-2 space-y-6 border-l border-fg/10 pl-6">
            {asList(b.events).map((raw, j) => {
              const ev = isPlainObject(raw) ? raw : { title: raw };
              return (
                <li key={j} className="relative">
                  <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-ink" style={{ background: `hsl(${accent} 90% 65%)` }} />
                  {ev.date ? <p className="text-xs font-bold uppercase tracking-wider" style={{ color: `hsl(${accent} 90% var(--accent-ink, 75%))` }}>{toLine(ev.date, lang)}</p> : null}
                  <p className="mt-0.5 font-semibold text-star">{toLine(ev.title, lang)}</p>
                  {ev.description ? <p className="mt-1 text-sm leading-relaxed text-mist">{toLine(ev.description, lang)}</p> : null}
                </li>
              );
            })}
          </ol>
        </Card>
      );
    default:
      return null;
  }
}
