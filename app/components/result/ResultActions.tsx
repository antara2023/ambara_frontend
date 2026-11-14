import { Link } from "react-router";
import { PencilLine, Share2 } from "lucide-react";
import { formatDob, formatTob } from "~/lib/birth";
import { useT } from "~/lib/i18n";
import type { BirthDetails, Lang } from "~/lib/types";
import { useToast } from "~/components/ui/Toaster";

export function ProfileCard({ birth, lang, extra }: { birth: BirthDetails; lang: Lang; extra?: { label: string; value: string }[] }) {
  const t = useT();
  const rows = [
    { label: t("dob"), value: formatDob(birth.dob, lang) },
    { label: t("tob"), value: birth.tob ? formatTob(birth.tob, lang) : "" },
    { label: t("pob"), value: birth.place },
    ...(extra || []),
  ].filter((r) => r.value); // date-only calculators have no time or place
  return (
    <div className="panel p-6">
      <p className="eyebrow">{t("resultFor")}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-star">{birth.name}</p>
      <dl className="mt-4 space-y-2.5 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-4">
            <dt className="shrink-0 whitespace-nowrap text-haze">{r.label}</dt>
            <dd className="text-right font-semibold text-mist">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** "Edit details" (a link back to the form, or a callback) and "Share". */
export function ResultButtons({ editTo, onEdit, title }: { editTo?: string; onEdit?: () => void; title: string }) {
  const t = useT();
  const toast = useToast();

  const share = async () => {
    const data = { title, text: `${t("shareText")}: ${title}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        toast.success(t("copied"));
      }
    } catch {
      /* the visitor closed the share sheet */
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {editTo ? (
        <Link to={editTo} className="btn-ghost !px-3 text-sm">
          <PencilLine size={16} /> {t("editDetails")}
        </Link>
      ) : (
        <button type="button" onClick={onEdit} className="btn-ghost !px-3 text-sm">
          <PencilLine size={16} /> {t("editDetails")}
        </button>
      )}
      <button type="button" onClick={share} className="btn-primary !px-3 text-sm">
        <Share2 size={16} /> {t("share")}
      </button>
    </div>
  );
}
