import { dobToIso, isFutureDob, isValidDob, isoToDob } from "~/lib/birth";
import { translate, useT } from "~/lib/i18n";
import type { BirthDetails, Lang } from "~/lib/types";
import { Field, Segmented } from "./Field";
import { PlaceInput } from "./PlaceInput";

export type BirthErrors = Partial<Record<keyof BirthDetails, string>>;

export const emptyBirth: BirthDetails = { name: "", gender: "", dob: "", tob: "", place: "" };

/** Desktop browsers open the date/time picker only from the small icon; open it on a click anywhere in the box. */
const openPicker = (e: React.MouseEvent<HTMLInputElement>) => {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    /* not supported, or the picker is already open */
  }
};

export type BirthNeeds = { time: boolean; place: boolean };
const ALL: BirthNeeds = { time: true, place: true };

export function validateBirth(b: BirthDetails, lang: Lang, needs: BirthNeeds = ALL): BirthErrors {
  const t = (k: Parameters<typeof translate>[1]) => translate(lang, k);
  const e: BirthErrors = {};
  if (!b.name.trim()) e.name = t("errName");
  if (!b.gender) e.gender = t("errGender");
  if (!isValidDob(b.dob)) e.dob = t("errDob");
  else if (isFutureDob(b.dob)) e.dob = t("errDobFuture");
  if (needs.time && !/^\d{2}:\d{2}$/.test(b.tob)) e.tob = t("errTob");
  if (needs.place && b.place.trim().length < 2) e.place = t("errPob");
  return e;
}

/** Name, gender, date, time and place of birth. Controlled; `prefix` keeps ids unique when shown twice.
 *  `needs` hides time and place for calculators that only use the date. */
export function BirthFields({
  value,
  onChange,
  errors = {},
  prefix = "b",
  nameLabel,
  nameHint,
  needs = ALL,
}: {
  value: BirthDetails;
  onChange: (b: BirthDetails) => void;
  errors?: BirthErrors;
  prefix?: string;
  nameLabel?: string;
  nameHint?: string;
  needs?: BirthNeeds;
}) {
  const t = useT();
  const set = <K extends keyof BirthDetails>(k: K, v: BirthDetails[K]) => onChange({ ...value, [k]: v });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id={`${prefix}-name`} label={nameLabel || t("name")} error={errors.name} hint={nameHint} className="sm:col-span-2">
        {(a) => <input {...a} className="field" value={value.name} maxLength={100} autoComplete="name" placeholder={t("namePh")} onChange={(e) => set("name", e.target.value)} />}
      </Field>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <span id={`${prefix}-gender-label`} className="text-[0.8rem] font-semibold text-mist">
          {t("gender")}
        </span>
        <Segmented
          name={`${prefix}-gender`}
          labelledBy={`${prefix}-gender-label`}
          value={value.gender}
          invalid={!!errors.gender}
          onChange={(v) => set("gender", v)}
          options={[
            { value: "male", label: t("male") },
            { value: "female", label: t("female") },
            { value: "other", label: t("other") },
          ]}
        />
        {errors.gender && <p role="alert" className="text-xs font-semibold text-ember">{errors.gender}</p>}
      </div>

      <Field id={`${prefix}-dob`} label={t("dob")} error={errors.dob} className={needs.time ? "" : "sm:col-span-2"}>
        {(a) => <input {...a} type="date" className="field cursor-pointer" min="1900-01-01" max={today} value={dobToIso(value.dob)} onClick={openPicker} onChange={(e) => set("dob", isoToDob(e.target.value))} />}
      </Field>

      {needs.time && (
        <Field id={`${prefix}-tob`} label={t("tob")} error={errors.tob}>
          {(a) => <input {...a} type="time" className="field cursor-pointer" value={value.tob} onClick={openPicker} onChange={(e) => set("tob", e.target.value.slice(0, 5))} />}
        </Field>
      )}

      {needs.place && (
        <Field id={`${prefix}-pob`} label={t("pob")} error={errors.place} hint={t("pobHint")} className="sm:col-span-2">
          {(a) => <PlaceInput id={a.id} value={value.place} invalid={a["aria-invalid"]} describedBy={a["aria-describedby"]} onChange={(v) => set("place", v)} />}
        </Field>
      )}
    </div>
  );
}
