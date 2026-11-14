import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, MapPin } from "lucide-react";
import { useSearchPlacesQuery } from "~/store/api";
import { useT } from "~/lib/i18n";

/** Birth-place field with live suggestions (accessible combobox: arrows, Enter, Escape). */
export function PlaceInput({
  id,
  value,
  onChange,
  invalid,
  describedBy,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const t = useT();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [debounced, setDebounced] = useState(value);
  const typed = useRef(false);

  useEffect(() => {
    const h = setTimeout(() => setDebounced(value.trim()), 280);
    return () => clearTimeout(h);
  }, [value]);

  const skip = !typed.current || debounced.length < 3;
  const { data = [], isFetching, isError } = useSearchPlacesQuery(debounced, { skip });
  const showList = open && !skip && (isFetching || data.length > 0 || isError || debounced === value.trim());

  const choose = (place: string) => {
    typed.current = false;
    onChange(place);
    setOpen(false);
    setActive(-1);
  };

  return (
    <div className="relative">
      <MapPin size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-haze" />
      <input
        id={id}
        className="field !pl-10"
        value={value}
        autoComplete="off"
        spellCheck={false}
        placeholder={t("pobPh")}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => {
          typed.current = true;
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => typed.current && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (!showList || !data.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => (a + 1) % data.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => (a <= 0 ? data.length - 1 : a - 1));
          } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault();
            choose(data[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {isFetching && <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-gold" />}

      <AnimatePresence>
        {showList && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute inset-x-0 top-[calc(100%+6px)] z-40 max-h-64 overflow-auto rounded-2xl border border-fg/10 bg-night/95 p-1.5 shadow-2xl backdrop-blur-xl"
          >
            {isFetching && !data.length && <li className="px-3 py-2.5 text-sm text-haze">{t("searching")}</li>}
            {!isFetching && (isError || !data.length) && <li className="px-3 py-2.5 text-sm text-haze">{t("noPlaces")}</li>}
            {data.map((place, i) => (
              <li
                key={place}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(place);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  i === active ? "bg-gold/15 text-star" : "text-mist hover:bg-fg/5"
                }`}
              >
                <MapPin size={15} className="mt-0.5 shrink-0 text-gold" />
                {place}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
