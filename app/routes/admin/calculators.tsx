import { useDeferredValue, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Plus, Search, Star } from "lucide-react";
import { useAdminListQuery, useAdminUpdateMutation, errorMessage } from "~/store/api";
import { useToast } from "~/components/ui/Toaster";
import type { Lang } from "~/lib/types";

export default function AdminCalculators() {
  const [lang, setLang] = useState<Lang | "">("en");
  const [q, setQ] = useState("");
  const query = useDeferredValue(q.trim());
  const { data = [], isLoading, isFetching, error } = useAdminListQuery({ lang: lang || undefined, q: query || undefined });
  const [update] = useAdminUpdateMutation();
  const toast = useToast();

  const togglePopular = async (calculatorId: string, itemLang: Lang, currentGroup?: string) => {
    const isPopular = currentGroup === "popular";
    const nextGroup = isPopular ? "" : "popular";
    try {
      await update({
        calculatorId,
        lang: itemLang,
        data: {
          listing: {
            group: nextGroup,
          } as any,
        },
      }).unwrap();
      toast.success(isPopular ? "Removed from Most Popular" : "Moved to Most Popular ⭐");
    } catch {
      toast.error("Failed to update Most Popular status");
    }
  };

  const toggleStatus = async (calculatorId: string, itemLang: Lang, currentActive: boolean) => {
    const nextStatus = !currentActive;
    try {
      await update({
        calculatorId,
        lang: itemLang,
        data: {
          isActive: nextStatus,
        },
      }).unwrap();
      toast.success(nextStatus ? "Calculator is now Live" : "Calculator is now Hidden");
    } catch {
      toast.error("Failed to update calculator status");
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-star">Calculators</h1>
          <p className="mt-1 text-sm text-mist">Page content, form questions and AI prompts. Changes appear on the site within seconds.</p>
        </div>
        <Link to="/admin/calculators/new" className="btn-primary">
          <Plus size={18} /> New calculator
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="panel flex flex-1 items-center gap-2 !rounded-full px-4">
          <Search size={16} className="text-haze" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, slug or id" className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-haze" />
        </label>
        <div className="panel flex !rounded-full p-1 text-sm">
          {(["en", "hi", ""] as const).map((l) => (
            <button key={l || "all"} onClick={() => setLang(l)} className={`rounded-full px-4 py-1.5 font-semibold ${lang === l ? "bg-gold text-on-gold" : "text-mist hover:text-star"}`}>
              {l ? l.toUpperCase() : "All"}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="mt-10 text-ember">{errorMessage(error, { network: "Can't reach the server.", tooMany: "Too many requests.", generic: "Could not load calculators." })}</p>
      ) : (
        <div className={`panel mt-6 overflow-x-auto transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-haze">
              <tr className="border-b border-fg/[0.07]">
                <th className="px-5 py-3">Calculator</th>
                <th className="px-5 py-3">Lang</th>
                <th className="px-5 py-3">Most Popular</th>
                <th className="px-5 py-3">Group</th>
                <th className="px-5 py-3">Questions</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }, (_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-5 py-3">
                        <div className="skeleton h-6" />
                      </td>
                    </tr>
                  ))
                : data.map((c, i) => {
                    const isPopular = c.listing?.group === "popular";
                    return (
                      <motion.tr key={`${c.calculatorId}:${c.lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i, 20) * 0.015 }} className="border-b border-fg/[0.05] hover:bg-fg/[0.03]">
                        <td className="px-5 py-3">
                          <Link to={`/admin/calculators/${c.calculatorId}?lang=${c.lang}`} className="font-semibold text-star hover:text-gold">
                            {c.hero?.h1 || c.name}
                          </Link>
                          <p className="text-xs text-haze">/{c.slug} · {c.calculatorId}</p>
                        </td>
                        <td className="px-5 py-3 uppercase text-mist">{c.lang}</td>
                        <td className="px-5 py-3">
                          <button
                            type="button"
                            onClick={() => togglePopular(c.calculatorId, c.lang, c.listing?.group)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                              isPopular
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400/30"
                                : "bg-fg/5 text-mist hover:text-star hover:bg-fg/10 border border-fg/10"
                            }`}
                          >
                            <Star size={13} className={isPopular ? "fill-amber-400 text-amber-400" : "text-haze"} />
                            <span>{isPopular ? "Popular ⭐" : "Make Popular"}</span>
                          </button>
                        </td>
                        <td className="px-5 py-3 text-mist">{c.listing?.group || c.category || "core"}</td>
                        <td className="px-5 py-3 text-mist">{c.customFields?.length || 0}</td>
                        <td className="px-5 py-3">
                          <button
                            type="button"
                            onClick={() => toggleStatus(c.calculatorId, c.lang, c.isActive)}
                            className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold transition border ${
                              c.isActive
                                ? "bg-lagoon/15 text-lagoon border-lagoon/30 hover:bg-lagoon/25"
                                : "bg-fg/5 text-haze border-fg/15 hover:bg-fg/10 hover:text-mist"
                            }`}
                            title={c.isActive ? "Click to hide calculator" : "Click to make calculator live"}
                          >
                            <span
                              className={`relative inline-flex h-3.5 w-6 shrink-0 items-center rounded-full transition-colors ${
                                c.isActive ? "bg-lagoon" : "bg-fg/20"
                              }`}
                            >
                              <span
                                className={`inline-block h-2.5 w-2.5 rounded-full bg-void transition-transform ${
                                  c.isActive ? "translate-x-3" : "translate-x-0.5"
                                }`}
                              />
                            </span>
                            <span>{c.isActive ? "Live" : "Hidden"}</span>
                          </button>
                        </td>
                        <td className="px-5 py-3 text-xs text-haze">{c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : "—"}</td>
                      </motion.tr>
                    );
                  })}
            </tbody>
          </table>
          {!isLoading && !data.length && <p className="px-5 py-10 text-center text-mist">No calculators match.</p>}
        </div>
      )}
      <p className="mt-3 text-xs text-haze">{data.length} records</p>
    </>
  );
}
