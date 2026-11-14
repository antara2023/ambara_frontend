// Exact calculated data for the Western / numerology calculators, shown above the AI reading. Everything here
// comes from our own ephemeris (backend astro/western), not from the AI, so the numbers are always right.
import { motion } from "motion/react";
import { useT } from "~/lib/i18n";

type Any = Record<string, any>; // shapes are defined in backend astro/western/western.service.js

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const SIGN_GLYPH = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map((g) => `${g}︎`);
const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇", "North Node": "☊",
};
const SIGN_HUE: Record<string, number> = { Fire: 14, Earth: 95, Air: 200, Water: 255 };
const ELEMENT_OF = (sign: string) => ["Fire", "Earth", "Air", "Water"][SIGNS.indexOf(sign) % 4];

/** "21°02' Leo" -> 141.03 */
const lonOf = (text?: string | null) => {
  const m = /^(\d+)°(\d+)'\s+(\w+)/.exec(text || "");
  if (!m) return null;
  const i = SIGNS.indexOf(m[3]);
  return i < 0 ? null : i * 30 + Number(m[1]) + Number(m[2]) / 60;
};
const houseText = (h?: number | null) => (h ? `House ${h}` : "");
const sub = (p?: Any | null) => (p ? [p.position, houseText(p.house), p.retrograde ? "Retrograde" : ""].filter(Boolean).join(" · ") : "");

/* ---------- building blocks ---------- */

type Tile = { label: string; value: string; note?: string; hue?: number };

function Tiles({ tiles }: { tiles: Tile[] }) {
  return (
    <div className={`grid gap-3 ${tiles.length >= 3 ? "sm:grid-cols-3" : tiles.length === 2 ? "sm:grid-cols-2" : ""}`}>
      {tiles.map((x, i) => (
        <motion.div
          key={x.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.07 }}
          className="relative overflow-hidden rounded-2xl border border-fg/[0.08] bg-fg/[0.03] p-4"
        >
          <span aria-hidden className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl" style={{ background: `hsl(${x.hue ?? 260} 90% 60% / 0.18)` }} />
          <p className="relative text-[0.7rem] font-bold uppercase tracking-wider text-haze">{x.label}</p>
          <p className="relative mt-1.5 font-display text-2xl font-semibold text-star">{x.value}</p>
          {x.note && <p className="relative mt-1 text-sm text-mist">{x.note}</p>}
        </motion.div>
      ))}
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | number | null | undefined)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead className="text-[0.7rem] uppercase tracking-wider text-haze">
          <tr>{head.map((h) => <th key={h} className="py-2 pr-3 font-bold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-fg/[0.06] text-mist">
              {r.map((c, j) => <td key={j} className={`py-2.5 pr-3 ${j === 0 ? "font-semibold text-star" : ""}`}>{c ?? "—"}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Items({ items }: { items: string[] }) {
  if (!items?.length) return <p className="text-sm text-haze">None within orb.</p>;
  return (
    <ul className="space-y-1.5 text-sm text-mist">
      {items.map((x) => (
        <li key={x} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/70" />
          {x}
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-fg/[0.07] px-5 py-5 first:border-t-0 sm:px-7">
      <p className="mb-3 text-sm font-semibold text-star">{title}</p>
      {children}
    </div>
  );
}

/** Round chart: signs on the outside, houses inside, planets at their degree. Ascendant on the left. */
function ChartWheel({ planets, ascendant, midheaven, cusps }: { planets: { name: string; lon: number }[]; ascendant: number; midheaven?: number | null; cusps?: number[] | null }) {
  const R = 150;
  const at = (lon: number, r: number) => {
    const a = ((180 + lon - ascendant) * Math.PI) / 180;
    return [r * Math.cos(a), -r * Math.sin(a)];
  };
  // Spread planets that sit close together so the glyphs do not overlap
  const placed = [...planets].sort((a, b) => a.lon - b.lon).map((p) => ({ ...p, show: p.lon }));
  for (let pass = 0; pass < 3; pass++)
    for (let i = 1; i < placed.length; i++) if (placed[i].show - placed[i - 1].show < 8) placed[i].show = placed[i - 1].show + 8;
  const line = (lon: number, r1: number, r2: number) => {
    const [x1, y1] = at(lon, r1);
    const [x2, y2] = at(lon, r2);
    return { x1, y1, x2, y2 };
  };

  return (
    <svg viewBox="-160 -160 320 320" className="mx-auto w-full max-w-[380px]" role="img" aria-label="Birth chart wheel">
      <circle r={R} fill="none" stroke="var(--color-fg)" strokeOpacity={0.18} />
      <circle r={124} fill="none" stroke="var(--color-fg)" strokeOpacity={0.18} />
      <circle r={44} fill="none" stroke="var(--color-fg)" strokeOpacity={0.12} />
      {SIGNS.map((s, i) => {
        const [x, y] = at(i * 30 + 15, 137);
        return (
          <g key={s}>
            <line {...line(i * 30, 124, R)} stroke="var(--color-fg)" strokeOpacity={0.18} />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={13} fill={`hsl(${SIGN_HUE[ELEMENT_OF(s)]} 75% 62%)`}>
              {SIGN_GLYPH[i]}
            </text>
          </g>
        );
      })}
      {cusps?.map((c, i) => {
        const next = cusps[(i + 1) % 12];
        const mid = c + (((next - c + 360) % 360) / 2);
        const [x, y] = at(mid, 52);
        return (
          <g key={i}>
            <line {...line(c, 44, 124)} stroke="var(--color-fg)" strokeOpacity={i % 3 === 0 ? 0 : 0.1} strokeDasharray="2 3" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={8} fill="var(--color-haze)">{i + 1}</text>
          </g>
        );
      })}
      <line {...line(ascendant, 0, R)} stroke="var(--color-gold)" strokeOpacity={0.7} />
      <line {...line(ascendant + 180, 0, R)} stroke="var(--color-gold)" strokeOpacity={0.35} />
      {midheaven != null && <line {...line(midheaven, 0, R)} stroke="var(--color-lagoon)" strokeOpacity={0.6} />}
      {midheaven != null && <line {...line(midheaven + 180, 0, R)} stroke="var(--color-lagoon)" strokeOpacity={0.3} />}
      {(() => {
        const [x, y] = at(ascendant, R + 6);
        return <text x={x - 2} y={y} textAnchor="end" dominantBaseline="central" fontSize={8} fontWeight={700} fill="var(--color-gold)">ASC</text>;
      })()}
      {placed.map((p, i) => {
        const [x, y] = at(p.show, 104);
        const t = line(p.lon, 118, 124);
        return (
          <motion.g key={p.name} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.05 }}>
            <line {...t} stroke="var(--color-star)" strokeWidth={1.5} />
            <circle cx={x} cy={y} r={10} fill="var(--color-night)" stroke="var(--color-fg)" strokeOpacity={0.15} />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={12} fill="var(--color-star)">
              <title>{p.name}</title>
              {`${PLANET_GLYPH[p.name] || p.name[0]}︎`}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}

/* ---------- per calculator ---------- */

const signTile = (label: string, p?: Any | null, hue?: number): Tile | null =>
  p ? { label, value: p.sign, note: sub(p), hue: hue ?? SIGN_HUE[p.element] } : null;
const tiles = (...t: (Tile | null)[]) => t.filter(Boolean) as Tile[];

function body(type: string, d: Any) {
  switch (type) {
    case "birthChart": {
      const asc = lonOf(d.ascendant?.position);
      return (
        <>
          {asc != null && (
            <Section title="Your birth chart">
              <ChartWheel
                ascendant={asc}
                midheaven={lonOf(d.midheaven?.position)}
                cusps={(d.houseCusps || []).map(lonOf).filter((x: number | null) => x != null)}
                planets={[...d.planets.map((p: Any) => ({ name: p.planet, lon: lonOf(p.position) })), { name: "North Node", lon: lonOf(d.northNode?.position) }].filter((p) => p.lon != null)}
              />
            </Section>
          )}
          <Section title="Planet positions">
            <Table
              head={["Planet", "Sign", "Position", "House"]}
              rows={[
                ...d.planets.map((p: Any) => [`${p.planet}${p.retrograde ? " ℞" : ""}`, p.sign, p.position, p.house]),
                ["Ascendant", d.ascendant?.sign, d.ascendant?.position, "1"],
                ["Midheaven", d.midheaven?.sign, d.midheaven?.position, "10"],
                ["North Node", d.northNode?.sign, d.northNode?.position, d.northNode?.house],
              ]}
            />
          </Section>
          <Section title="Balance">
            <Tiles
              tiles={[
                { label: "Chart ruler", value: d.chartRuler, hue: 45 },
                ...Object.entries(d.elementBalance || {}).map(([k, v]) => ({ label: k, value: `${v} planets`, hue: SIGN_HUE[k] })),
              ]}
            />
          </Section>
          <Section title="Tightest aspects">
            <Items items={d.tightestAspects} />
          </Section>
        </>
      );
    }
    case "bigThree":
      return (
        <>
          <Section title="Your Big Three">
            <Tiles tiles={tiles(signTile("Sun sign", d.sun), signTile("Moon sign", d.moon), d.rising ? signTile("Rising sign", d.rising) : null)} />
          </Section>
          <Section title="Born under">
            <Items items={[`Moon phase at birth: ${d.moonPhaseAtBirth}`, `Sun and Moon: ${d.sunMoonAspect}`]} />
          </Section>
        </>
      );
    case "sunSign":
      return (
        <Section title="Your Sun sign">
          <Tiles
            tiles={[
              { label: "Sun sign", value: d.sunSign || d.possibleSigns.join(" / "), note: d.onTheCusp ? "Born on the cusp" : `${d.element} · ${d.modality}`, hue: SIGN_HUE[d.element] },
              { label: "Ruling planet", value: d.ruler, hue: 45 },
              { label: "Element", value: `${d.element} · ${d.modality}`, hue: SIGN_HUE[d.element] },
            ]}
          />
          {d.onTheCusp && <p className="mt-3 text-sm text-mist">{d.note} Use the Birth Chart calculator with your birth time for the exact sign.</p>}
        </Section>
      );
    case "moonSign":
      return (
        <>
          <Section title="Your Moon">
            <Tiles
              tiles={tiles(
                signTile("Moon sign (Western)", d.moon),
                d.vedicMoon ? { label: "Moon rashi (Vedic)", value: d.vedicMoon.rashi, note: d.vedicMoon.position, hue: 25 } : null,
                d.vedicMoon ? { label: "Nakshatra", value: d.vedicMoon.nakshatra, note: `Pada ${d.vedicMoon.pada}`, hue: 42 } : null,
              )}
            />
          </Section>
          <Section title="Moon details">
            <Items items={[`Moon phase at birth: ${d.moonPhaseAtBirth}`, ...d.aspectsToMoon]} />
          </Section>
        </>
      );
    case "risingSign":
      return (
        <>
          <Section title="Your Ascendant">
            <Tiles tiles={tiles(signTile("Rising sign", d.rising), signTile(`Chart ruler: ${d.chartRuler}`, d.chartRulerPlacement, 45))} />
          </Section>
          <Section title="What shapes it">
            <Items items={[...(d.planetsInFirstHouse.length ? [`Planets in your 1st house: ${d.planetsInFirstHouse.join(", ")}`] : []), ...d.aspectsToAscendant]} />
          </Section>
        </>
      );
    case "venusSign":
    case "marsSign":
    case "jupiterSign": {
      const name = { venusSign: "Venus", marsSign: "Mars", jupiterSign: "Jupiter" }[type]!;
      return (
        <>
          <Section title={`Your ${name}`}>
            <Tiles tiles={tiles(signTile(`${name} sign`, d[name.toLowerCase()]), { label: "Element", value: d[name.toLowerCase()]?.element, note: d[name.toLowerCase()]?.modality, hue: SIGN_HUE[d[name.toLowerCase()]?.element] })} />
          </Section>
          <Section title={`Aspects to ${name}`}>
            <Items items={d.aspects} />
          </Section>
        </>
      );
    }
    case "lilith":
      return (
        <>
          <Section title="Your Black Moon Lilith">
            <Tiles tiles={tiles(signTile("Lilith sign", d.blackMoonLilith, 285), { label: "House", value: d.blackMoonLilith?.house ? `${d.blackMoonLilith.house}` : "—", note: "Mean lunar apogee", hue: 285 })} />
          </Section>
          <Section title="Aspects to Lilith">
            <Items items={d.aspects} />
          </Section>
        </>
      );
    case "northNode":
      return (
        <>
          <Section title="Your lunar nodes">
            <Tiles tiles={tiles(signTile("North Node (growth)", d.northNode, 175), signTile("South Node (comfort zone)", d.southNode, 300))} />
          </Section>
          <Section title="Aspects to the North Node">
            <Items items={d.aspects} />
          </Section>
        </>
      );
    case "midheaven":
      return (
        <>
          <Section title="Your career point">
            <Tiles tiles={tiles(signTile("Midheaven (MC)", d.midheaven, 210), signTile(`MC ruler: ${d.midheavenRuler}`, d.midheavenRulerPlacement, 45))} />
          </Section>
          <Section title="Career houses">
            <Items
              items={[
                d.planetsInTenthHouse.length ? `Planets in your 10th house: ${d.planetsInTenthHouse.join(", ")}` : "No planets in your 10th house",
                d.sixthHouseCusp ? `6th house (daily work) begins in ${d.sixthHouseCusp}` : "",
                d.secondHouseCusp ? `2nd house (income) begins in ${d.secondHouseCusp}` : "",
                ...d.aspectsToMidheaven,
              ].filter(Boolean)}
            />
          </Section>
        </>
      );
    case "partOfFortune":
      return (
        <>
          <Section title="Your Part of Fortune">
            <Tiles tiles={tiles(signTile("Part of Fortune", d.partOfFortune, 52), signTile(`Ruler: ${d.signRuler}`, d.rulerPlacement, 45), { label: "Chart type", value: d.partOfFortune?.chartType, note: d.formula, hue: 210 })} />
          </Section>
          <Section title="Aspects">
            <Items items={d.aspects} />
          </Section>
        </>
      );
    case "astrocartography":
      return (
        <>
          {[
            ["Best for love", d.bestForLove],
            ["Best for career", d.bestForCareer],
            ["Best for home and peace", d.bestForHomeAndPeace],
            ["Growth, but intense", d.growthButIntense],
            ["Demanding places", d.demanding],
          ].map(([t, items]) => (
            <Section key={t as string} title={t as string}>
              <Items items={items as string[]} />
            </Section>
          ))}
          <Section title="Lines near major cities">
            <Table head={["City", "Lines (distance)"]} rows={d.cities.slice(0, 15).map((c: Any) => [`${c.city}, ${c.country}`, c.lines.slice(0, 3).map((l: Any) => `${l.planet} ${l.line} (${l.km} km)`).join(", ")])} />
            <p className="mt-3 text-xs text-haze">{d.note}</p>
          </Section>
        </>
      );
    case "saturnReturn":
      return (
        <>
          <Section title="Your natal Saturn">
            <Tiles tiles={[{ label: "Saturn sign", value: d.natalSaturn.sign, note: [d.natalSaturn.text, houseText(d.natalSaturn.house), d.natalSaturn.retrograde ? "Retrograde" : ""].filter(Boolean).join(" · "), hue: 245 }, { label: "Saturn today", value: d.saturnToday, note: d.today, hue: 245 }]} />
          </Section>
          <Section title="Your Saturn returns">
            <Table head={["Return", "Status", "Exact dates", "Age"]} rows={d.returns.map((r: Any) => [r.label, r.status, r.exactDates.join(", ") || r.approxYears, r.ageAtFirstPass ?? "—"])} />
          </Section>
        </>
      );
    case "solarReturn":
      return (
        <Section title={`Solar return ${d.year}`}>
          <Tiles
            tiles={tiles(
              { label: "Exact moment", value: d.exactMoment.replace(/ \(local time\)/, ""), note: d.location, hue: 35 },
              signTile("Year's rising sign", d.returnAscendant),
              { label: "Sun's house this year", value: `House ${d.sunInReturnHouse}`, note: `Moon in ${d.returnMoon?.sign}`, hue: 45 },
            )}
          />
          <div className="mt-4">
            <Items items={[...d.planetsOnAngles.map((x: string) => `${x} (angular: strong this year)`), ...d.tightestAspects]} />
          </div>
        </Section>
      );
    case "transit":
      return (
        <>
          <Section title={`Active transits · ${d.date}`}>
            <Table head={["Transit", "Nature", "Orb"]} rows={d.activeTransits.map((a: Any) => [a.transit, a.nature, `${a.orb}°`])} />
          </Section>
          <Section title="Coming up in the next 60 days">
            <Table head={["Date", "Exact transit"]} rows={d.next60Days.map((u: Any) => [u.date, u.event])} />
          </Section>
          <Section title="Where the planets are today">
            <Table head={["Planet", "Position", "Your house"]} rows={d.transitingPlanets.map((p: Any) => [`${p.name}${p.retrograde ? " ℞" : ""}`, p.text, p.natalHouse])} />
          </Section>
        </>
      );
    case "mercuryRetrograde": {
      const focus = d.current || d.next;
      return (
        <>
          <Section title={d.isRetrogradeNow ? "Mercury is retrograde now" : "Next Mercury retrograde"}>
            <Tiles
              tiles={tiles(
                focus ? { label: d.isRetrogradeNow ? "Retrograde until" : "Starts", value: d.isRetrogradeNow ? focus.ends : focus.starts, note: `${focus.starts} – ${focus.ends}`, hue: 160 } : null,
                focus ? { label: "Sky position", value: focus.signs.join(" → "), note: `${focus.from} to ${focus.to}`, hue: 200 } : null,
                focus?.yourHouses ? { label: "Your houses", value: focus.yourHouses.map((h: number) => `House ${h}`).join(", "), note: "Where you'll feel it most", hue: 45 } : null,
              )}
            />
          </Section>
          <Section title="All retrograde periods this year">
            <Table head={["Dates", "Signs", "Your houses", "Status"]} rows={d.periods.map((p: Any) => [`${p.starts} – ${p.ends}`, p.signs.join(", "), p.yourHouses?.join(", "), p.status])} />
            <p className="mt-3 text-xs text-haze">Mercury today: {d.mercuryNow}. Your natal Mercury: {d.natalMercury?.position}.</p>
          </Section>
        </>
      );
    }
    case "vedicSign":
      return (
        <>
          <Section title="Your Vedic (sidereal) signs">
            <Tiles
              tiles={tiles(
                { label: "Moon rashi", value: d.moonRashi.rashi, note: `${d.moonRashi.position} · Western: ${d.moonRashi.westernSignForComparison}`, hue: 220 },
                { label: "Sun sign (Vedic)", value: d.sunRashi.rashi, note: `${d.sunRashi.position} · Western: ${d.sunRashi.westernSignForComparison}`, hue: 38 },
                d.lagna ? { label: "Lagna", value: d.lagna.rashi, note: `${d.lagna.position} · Western: ${d.lagna.westernSignForComparison}`, hue: 262 } : null,
              )}
            />
          </Section>
          <Section title="Birth star">
            <Items items={[`Janma nakshatra: ${d.moonNakshatra.nakshatra}, pada ${d.moonNakshatra.pada}`, `Ayanamsa: ${d.ayanamsa}`, d.note]} />
          </Section>
        </>
      );
    case "zodiacCompatibility":
      return (
        <>
          <Section title="Your signs side by side">
            <Table
              head={["", d.personA.name, d.personB.name]}
              rows={[
                ["Sun", d.personA.sunSign, d.personB.sunSign],
                ["Element", d.personA.sunElement, d.personB.sunElement],
                ["Moon", d.personA.moonSign, d.personB.moonSign],
                ["Venus", d.personA.venusSign, d.personB.venusSign],
                ["Mars", d.personA.marsSign, d.personB.marsSign],
              ]}
            />
          </Section>
          <Section title="How the signs meet">
            <Items items={[`Sun signs: ${d.sunSignRelation}`, `Elements: ${d.elementFit}`, `Pace: ${d.modalityFit}`, ...d.venusMarsCross]} />
          </Section>
        </>
      );
    case "synastry":
      return (
        <>
          <Section title="Both charts">
            <Table
              head={["", d.personA.name, d.personB.name]}
              rows={[["Sun", d.personA.sun, d.personB.sun], ["Moon", d.personA.moon, d.personB.moon], ["Venus", d.personA.venus, d.personB.venus], ["Mars", d.personA.mars, d.personB.mars], ["Rising", d.personA.rising, d.personB.rising]]}
            />
          </Section>
          <Section title="Aspect balance">
            <Tiles tiles={[{ label: "Harmonious", value: `${d.harmonyCount.harmonious}`, hue: 160 }, { label: "Challenging", value: `${d.harmonyCount.challenging}`, hue: 10 }, { label: "Blending", value: `${d.harmonyCount.blending}`, hue: 45 }]} />
          </Section>
          <Section title="Strongest connections">
            <Items items={d.crossAspects} />
          </Section>
          <Section title="House overlays">
            <Items items={d.houseOverlays} />
          </Section>
        </>
      );
    case "composite": {
      const asc = lonOf(d.compositeAscendant);
      return (
        <>
          {asc != null && (
            <Section title={`Composite chart · ${d.couple}`}>
              <ChartWheel ascendant={asc} midheaven={lonOf(d.compositeMidheaven)} planets={d.compositePlanets.map((p: Any) => ({ name: p.planet, lon: lonOf(p.position) })).filter((p: Any) => p.lon != null)} />
            </Section>
          )}
          <Section title="Composite positions">
            <Table head={["Planet", "Position", "House"]} rows={[...d.compositePlanets.map((p: Any) => [p.planet, p.position, p.house]), ["Ascendant", d.compositeAscendant, "1"], ["Midheaven", d.compositeMidheaven, "10"]]} />
          </Section>
          <Section title="Composite aspects">
            <Items items={d.compositeAspects} />
          </Section>
        </>
      );
    }
    case "lifePath":
      return (
        <Section title="Your life path number">
          <Tiles tiles={[{ label: d.isMasterNumber ? "Master number" : "Life path", value: `${d.lifePathNumber}`, note: d.calculation, hue: 48 }, { label: "Birthday number", value: `${d.birthDayNumber}`, hue: 30 }]} />
        </Section>
      );
    case "luckyNumber":
      return (
        <>
          <Section title="Your numbers">
            <Tiles
              tiles={tiles(
                { label: "Mulank (birth number)", value: `${d.mulank.number}`, note: `${d.mulank.planet} · ${d.mulank.from}`, hue: 140 },
                { label: "Bhagyank (destiny number)", value: `${d.bhagyank.number}`, note: `${d.bhagyank.planet} · ${d.bhagyank.from}`, hue: 48 },
                d.nameNumber ? { label: "Name number", value: `${d.nameNumber.number}`, note: `${d.nameNumber.planet} · compound ${d.nameNumber.compound}`, hue: 280 } : null,
              )}
            />
          </Section>
          <Section title="Lucky numbers, days and dates">
            <Items
              items={[
                `Lucky numbers: ${d.luckyNumbers.join(", ")}`,
                `Lucky days: ${d.luckyDays.join(", ")}`,
                ...(d.luckyDatesOfMonth || []).map((x: Any) => `Lucky dates for ${x.number}: ${x.dates} of any month`),
                ...(d.luckyColours ? [`Lucky colours: ${d.luckyColours}`] : []),
                d.nameNumber ? (d.nameMatchesBirthNumbers ? "Your name number matches a birth number: a supportive name." : "Your name number differs from your birth numbers.") : "Name number needs the name in English letters.",
              ]}
            />
          </Section>
        </>
      );
    default:
      return null;
  }
}

export function WesternPanel({ type, data }: { type: string; data: unknown }) {
  const t = useT();
  if (!data || typeof data !== "object") return null;
  let content: React.ReactNode = null;
  try {
    content = body(type, data as Any);
  } catch {
    return null; // never break the reading because of a display problem
  }
  if (!content) return null;
  const isChart = !["lifePath", "luckyNumber", "zodiacCompatibility", "sunSign", "vedicSign", "astrocartography"].includes(type);
  return (
    <div className="panel overflow-hidden">
      <div className="px-5 pt-5 sm:px-7">
        <p className="eyebrow">{t("computedTitle")}</p>
      </div>
      {content}
      {isChart && <p className="px-5 pb-5 text-xs text-haze sm:px-7">{t("computedNote")}</p>}
    </div>
  );
}
