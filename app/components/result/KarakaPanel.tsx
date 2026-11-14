import { motion } from "motion/react";
import { useT } from "~/lib/i18n";
import type { KarakaRank, Lang } from "~/lib/types";

const PLANET_HI: Record<string, string> = { Sun: "सूर्य", Moon: "चंद्रमा", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु", Venus: "शुक्र", Saturn: "शनि" };
const SIGN_HI: Record<string, string> = {
  Aries: "मेष", Taurus: "वृषभ", Gemini: "मिथुन", Cancer: "कर्क", Leo: "सिंह", Virgo: "कन्या",
  Libra: "तुला", Scorpio: "वृश्चिक", Sagittarius: "धनु", Capricorn: "मकर", Aquarius: "कुंभ", Pisces: "मीन",
};
const PLANET_HUE: Record<string, number> = { Sun: 38, Moon: 220, Mars: 8, Mercury: 150, Jupiter: 45, Venus: 330, Saturn: 245 };

/** Highlighted karaka planet plus all seven Chara Karakas ranked by degree. */
export function KarakaPanel({ primary, all, lang }: { primary: KarakaRank; all: KarakaRank[]; lang: Lang }) {
  const t = useT();
  const pl = (p: string) => (lang === "hi" ? PLANET_HI[p] || p : p);
  const sg = (s: string) => (lang === "hi" ? SIGN_HI[s] || s : s);
  const hue = PLANET_HUE[primary.planet] ?? 260;

  return (
    <div className="panel overflow-hidden">
      <div className="relative flex flex-col items-center gap-6 p-7 sm:flex-row sm:items-center">
        <div aria-hidden className="absolute -left-16 -top-16 h-56 w-56 rounded-full blur-3xl" style={{ background: `hsl(${hue} 90% 60% / 0.2)` }} />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 14 }}
          className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full"
          style={{ background: `radial-gradient(circle at 35% 30%, hsl(${hue} 95% 78%), hsl(${hue} 70% 45%) 60%, hsl(${hue} 60% 22%))`, boxShadow: `0 0 60px hsl(${hue} 90% 60% / 0.45)` }}
        >
          <span className="px-2 text-center font-display text-lg font-semibold leading-tight text-white drop-shadow">{pl(primary.planet)}</span>
        </motion.div>
        <div className="relative text-center sm:text-left">
          <p className="eyebrow">{t("yourKaraka")} · {primary.karaka}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-star">
            {pl(primary.planet)} <span className="text-mist">·</span> {sg(primary.sign)}
          </p>
          <p className="mt-1 text-mist">
            {primary.formattedDegree}
            {primary.isRetro ? ` · ${t("retro")}` : ""}
          </p>
          {primary.description && <p className="mt-3 max-w-md text-sm leading-relaxed text-mist">{primary.description}</p>}
        </div>
      </div>

      <div className="border-t border-fg/[0.07] px-4 pb-5 pt-4 sm:px-7">
        <p className="mb-3 text-sm font-semibold text-star">{t("karakaTable")}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm">
            <thead className="text-[0.7rem] uppercase tracking-wider text-haze">
              <tr>
                <th className="py-2 pr-3 font-bold">#</th>
                <th className="py-2 pr-3 font-bold">{t("karaka")}</th>
                <th className="py-2 pr-3 font-bold">{t("planet")}</th>
                <th className="py-2 pr-3 font-bold">{t("sign")}</th>
                <th className="py-2 font-bold">{t("degree")}</th>
              </tr>
            </thead>
            <tbody>
              {all.map((k, i) => {
                const on = k.planet === primary.planet;
                return (
                  <motion.tr
                    key={k.planet}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.06 }}
                    className={`border-t border-fg/[0.06] ${on ? "bg-gold/[0.07] text-star" : "text-mist"}`}
                  >
                    <td className="py-2.5 pr-3 tabular-nums">{i + 1}</td>
                    <td className="py-2.5 pr-3 font-semibold">{k.karaka}</td>
                    <td className="py-2.5 pr-3">
                      <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: `hsl(${PLANET_HUE[k.planet] ?? 260} 90% 65%)` }} />
                      {pl(k.planet)}
                      {k.isRetro && <span className="ml-1 text-xs text-ember">R</span>}
                    </td>
                    <td className="py-2.5 pr-3">{sg(k.sign)}</td>
                    <td className="py-2.5 tabular-nums">{k.formattedDegree}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
