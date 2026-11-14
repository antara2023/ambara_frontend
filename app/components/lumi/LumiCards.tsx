// Cards under a Lumi reply: the person's chart, their current dasha period, a nudge to add birth details,
// and links to Ambara's own calculators and life-question tools (the same cards as the rest of the site).
import { motion } from "motion/react";
import { CalendarClock, Sparkles, UserRound } from "lucide-react";
import { CalculatorCard, ToolCard } from "~/components/calc/Cards";
import { CORE, JAIMINI, type IconName } from "~/lib/catalog";
import { CATEGORIES } from "~/lib/western";
import { getTool } from "~/lib/tools";
import type { LumiCard } from "~/lib/lumi";

const tile = (hue: number) => `hsl(${hue} 85% 84%)`;

const LOOKS = new Map<string, { icon: IconName; hue: number }>(
  [...CATEGORIES.flatMap((c) => c.items), ...CORE, ...JAIMINI].map((d) => [d.id, { icon: d.icon, hue: d.hue }]),
);

function Fact({ label, value, hue }: { label: string; value: string | null; hue: number }) {
  return (
    <div className="rounded-xl border-2 border-fg px-3 py-2" style={{ background: value ? tile(hue) : "transparent", color: value ? "var(--p-ink)" : undefined }}>
      <div className="pop-mono !text-[0.68rem] uppercase opacity-75">{label}</div>
      <div className="text-[0.95rem] font-extrabold leading-tight">{value || "Needs birth time"}</div>
    </div>
  );
}

function ChartCard({ card }: { card: Extract<LumiCard, { type: "chart" }> }) {
  return (
    <div className="panel !rounded-2xl p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-extrabold">
        <Sparkles size={16} aria-hidden /> {card.name.split(" ")[0]}’s chart
      </div>
      <div className="pop-mono mb-1.5 !text-[0.7rem] uppercase text-mist">Western</div>
      <div className="grid grid-cols-3 gap-2">
        <Fact label="Sun" value={card.sun} hue={42} />
        <Fact label="Moon" value={card.moon} hue={220} />
        <Fact label="Rising" value={card.rising} hue={18} />
      </div>
      <div className="pop-mono mb-1.5 mt-3 !text-[0.7rem] uppercase text-mist">Vedic</div>
      <div className="grid grid-cols-3 gap-2">
        <Fact label="Rashi" value={card.rashi.replace(/\s*\(.*\)$/, "")} hue={262} />
        <Fact label="Lagna" value={card.lagna ? card.lagna.replace(/\s*\(.*\)$/, "") : null} hue={165} />
        <Fact label="Nakshatra" value={card.nakshatra.split(" · ")[0]} hue={320} />
      </div>
    </div>
  );
}

function DashaCard({ card }: { card: Extract<LumiCard, { type: "dasha" }> }) {
  const start = card.antarStartIso ? Date.parse(card.antarStartIso) : NaN;
  const end = card.antarEndIso ? Date.parse(card.antarEndIso) : NaN;
  const pct = Number.isFinite(start) && Number.isFinite(end) ? Math.min(100, Math.max(2, ((Date.now() - start) / (end - start)) * 100)) : null;
  return (
    <div className="panel !rounded-2xl p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-extrabold">
        <CalendarClock size={16} aria-hidden /> Your current period
      </div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-xl font-extrabold tracking-tight">
          {card.maha} · {card.antar}
        </span>
        <span className="text-sm font-semibold text-mist">mahadasha · antardasha</span>
      </div>
      {pct !== null && (
        <div className="mt-3">
          <div className="h-3 overflow-hidden rounded-full border-2 border-fg">
            <motion.div className="h-full bg-[#ffd66b]" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
          </div>
          <div className="pop-mono mt-1.5 flex justify-between !text-[0.72rem] text-mist">
            <span>{card.antarStart}</span>
            <span>{card.antarEnds}</span>
          </div>
        </div>
      )}
      {card.next.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {card.next.map((n) => (
            <span key={n.from} className="pop-pill" style={{ background: tile(250) }}>
              {n.lord} from {n.from}
            </span>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs font-semibold text-mist">{card.maha} mahadasha runs until {card.mahaEnds}.</p>
    </div>
  );
}

function BirthFormCard({ onAddBirth }: { onAddBirth: () => void }) {
  return (
    <button type="button" onClick={onAddBirth} className="pop-card pop-card-small group w-full !min-h-0 text-left" style={{ "--tile": tile(42) } as React.CSSProperties}>
      <span className="flex items-center gap-3">
        <span aria-hidden className="pop-glyph" style={{ width: 42, height: 42, background: tile(42) }}>
          <UserRound size={19} strokeWidth={2.2} />
        </span>
        <span>
          <span className="block text-base font-extrabold leading-tight">Add your birth details</span>
          <span className="block text-sm font-medium text-mist">So Lumi can read from your own chart</span>
        </span>
      </span>
    </button>
  );
}

export function LumiCards({ cards, onAddBirth }: { cards: LumiCard[]; onAddBirth: () => void }) {
  const links = cards.filter((c) => c.type === "calculator" || c.type === "tool");
  const others = cards.filter((c) => c.type !== "calculator" && c.type !== "tool");
  let i = 0;
  const appear = () => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.12 * i++, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } });

  return (
    <div className="mt-3 grid gap-3">
      {others.map((c) => (
        <motion.div key={c.type} {...appear()}>
          {c.type === "chart" && <ChartCard card={c} />}
          {c.type === "dasha" && <DashaCard card={c} />}
          {c.type === "birthForm" && <BirthFormCard onAddBirth={onAddBirth} />}
        </motion.div>
      ))}
      {links.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {links.map((c) => {
            if (c.type === "tool") {
              const tool = getTool(c.slug);
              return tool ? (
                <motion.div key={c.key} {...appear()}>
                  <ToolCard tool={tool} lang="en" />
                </motion.div>
              ) : null;
            }
            if (c.type !== "calculator") return null;
            const look = LOOKS.get(c.key) || { icon: "sparkles" as IconName, hue: 250 };
            return (
              <motion.div key={c.key} {...appear()}>
                <CalculatorCard item={{ _id: c.key, calculatorId: c.key, name: c.title, slug: c.slug, lang: "en", listing: { group: "", sortOrder: 0, shortDescription: c.description, icon: "" } }} lang="en" icon={look.icon} hue={look.hue} />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
