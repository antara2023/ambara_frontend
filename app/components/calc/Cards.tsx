import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { Icon } from "~/components/ui/Icon";
import { cardTitle, examLabel, examKey, type IconName } from "~/lib/catalog";
import { withLang } from "~/lib/lang";
import type { ToolDef } from "~/lib/tools";
import type { CalculatorListItem, Lang } from "~/lib/types";

/** Pastel tile colour from a calculator's hue (the "pop" design: dark text on pastel, both themes). */
const tileOf = (hue: number) => `hsl(${hue} 85% 84%)`;

function Badge({ icon, hue }: { icon: IconName; hue: number }) {
  return (
    <span aria-hidden className="pop-glyph" style={{ width: 42, height: 42, background: tileOf(hue) }}>
      <Icon name={icon} size={19} strokeWidth={2.2} />
    </span>
  );
}

export function CalculatorCard({ item, lang, icon, hue }: { item: CalculatorListItem; lang: Lang; icon: IconName; hue: number }) {
  const description = item.listing?.shortDescription || item.hero?.subtitle || "";
  return (
    <Link to={withLang(lang, `/calculators/${item.slug}`)} className="pop-card pop-card-small group h-full" style={{ "--tile": tileOf(hue) } as React.CSSProperties}>
      <span className="flex items-start justify-between gap-3">
        <Badge icon={icon} hue={hue} />
        <ArrowUpRight size={18} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
      <span className="text-lg font-extrabold leading-tight tracking-tight">{cardTitle(item)}</span>
      {description && <span className="line-clamp-3 text-[0.95rem] font-medium leading-snug text-mist">{description}</span>}
    </Link>
  );
}

export function ToolCard({ tool, lang }: { tool: ToolDef; lang: Lang }) {
  return (
    <Link to={withLang(lang, `/tools/${tool.slug}`)} className="pop-card pop-card-small group h-full" style={{ "--tile": tileOf(tool.hue) } as React.CSSProperties}>
      <span className="flex items-center justify-between gap-3">
        <Badge icon={tool.icon} hue={tool.hue} />
        <span className="pop-mono rounded-full border-[1.5px] border-current px-2.5 py-0.5 !text-[0.7rem]">{tool.tag[lang]}</span>
      </span>
      <span className="text-lg font-extrabold leading-tight tracking-tight">{tool.title[lang]}</span>
      <span className="flex-1 text-[0.95rem] font-medium leading-snug text-mist">{tool.description[lang]}</span>
      <span className="inline-flex items-center gap-1 text-sm font-extrabold">
        {tool.cta[lang]} <ArrowUpRight size={15} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function ExamChip({ item, lang, hue }: { item: CalculatorListItem; lang: Lang; hue: number }) {
  return (
    <Link to={withLang(lang, `/calculators/${item.slug}`)} className="pop-chip">
      <span className="pop-dot" style={{ background: tileOf(hue) }} />
      {examLabel(examKey(item))}
    </Link>
  );
}
