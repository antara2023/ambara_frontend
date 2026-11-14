import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useT } from "~/lib/i18n";

type Theme = "dark" | "light";
export const THEME_KEY = "ambara:theme";

/**
 * Runs in <head> before the page paints, so a saved light theme never flashes dark first. Dark is the default.
 * Kept as a string so it can be inlined.
 */
export const themeBootScript = `(function(){try{if(localStorage.getItem("${THEME_KEY}")==="light"){document.documentElement.setAttribute("data-theme","light");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","#f5f3fb")}}catch(e){}})();`;

const apply = (theme: Theme) => {
  const root = document.documentElement;
  if (theme === "light") root.setAttribute("data-theme", "light");
  else root.removeAttribute("data-theme");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f5f3fb" : "#070a1c");
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* private mode: the choice just isn't remembered */
  }
};

export function ThemeToggle() {
  const t = useT();
  // Server render and first client render agree on "dark"; the real value is read after mount
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = next === "light" ? t("themeLight") : t("themeDark");

  return (
    <button
      type="button"
      onClick={() => {
        apply(next);
        setTheme(next);
      }}
      className="btn-ghost relative !h-10 !w-10 overflow-hidden !p-0"
      aria-label={label}
      title={label}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={theme}
          initial={{ y: 14, opacity: 0, rotate: -40 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 40 }}
          transition={{ duration: 0.25 }}
          className="grid place-items-center"
        >
          {theme === "dark" ? <Moon size={17} /> : <Sun size={17} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
