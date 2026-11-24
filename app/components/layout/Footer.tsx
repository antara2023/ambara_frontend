import { Link } from "react-router";
import { useLang, withLang } from "~/lib/lang";
import { useT } from "~/lib/i18n";
import { TOOLS } from "~/lib/tools";
import { CATEGORIES } from "~/lib/western";
import { Wordmark } from "./Logo";

export function Footer() {
  const lang = useLang();
  const t = useT();
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 border-t-2 border-fg">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-mist">{t("footerAbout")}</p>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-haze">{t("disclaimer")}</p>
        </div>
        <div>
          <p className="eyebrow mb-4">{t("navCalculators")}</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="text-mist hover:text-star" to={withLang(lang, "/calculators")}>{t("allCalculatorsTitle")}</Link></li>
            {CATEGORIES.map((c) => (
              <li key={c.key}>
                <Link className="text-mist hover:text-star" to={`${withLang(lang, "/calculators")}#${c.key}`}>{c.title[lang]}</Link>
              </li>
            ))}
            {/* Sarkari Naukri link hidden for now. To restore: remove the comment markers.
            <li><Link className="text-mist hover:text-star" to={`${withLang(lang, "/calculators")}#sarkari`}>{t("sectionSarkari")}</Link></li>
            */}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">{t("navTools")}</p>
          <ul className="space-y-2.5 text-sm">
            {TOOLS.map((tool) => (
              <li key={tool.slug}>
                <Link className="text-mist hover:text-star" to={withLang(lang, `/tools/${tool.slug}`)}>{tool.title[lang]}</Link>
              </li>
            ))}
            <li className="pt-2">
              <Link className="font-semibold text-pink-400 hover:text-pink-300" to={withLang(lang, "/blog")}>{t("navBlog")}</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="pop-mono border-t-2 border-fg py-6 text-center !text-xs text-mist">
        © {year} Ambara. {t("rights")}
      </div>
    </footer>
  );
}
