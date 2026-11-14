// Decorative zodiac wheel for the home hero: twelve signs on a slowly turning ring, an inner ring turning the
// other way with the seven grahas, and a glowing sun. Pure SVG + CSS animation (no JavaScript needed).
// U+FE0E asks for the text glyph; without it Windows draws coloured emoji tiles
const SIGNS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map((s) => `${s}\uFE0E`);
const PLANETS = [
  { a: 20, r: 3.2, c: "#f8d58e" },
  { a: 75, r: 2.4, c: "#e8e6ff" },
  { a: 130, r: 2.8, c: "#ff7c5c" },
  { a: 185, r: 2.2, c: "#44d7c7" },
  { a: 230, r: 3.6, c: "#f3b94d" },
  { a: 280, r: 2.6, c: "#ff6f9c" },
  { a: 330, r: 3, c: "#8b7bff" },
];

// Rounded: Node and browsers can differ in the last digits of Math.cos/sin, which would break hydration
const round = (n: number) => Math.round(n * 100) / 100;
const polar = (deg: number, radius: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: round(200 + radius * Math.cos(rad)), y: round(200 + radius * Math.sin(rad)) };
};

export function ZodiacWheel({ className = "" }: { className?: string }) {
  return (
    <div className={`relative aspect-square ${className}`} aria-hidden>
      <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(243,185,77,0.22),transparent_65%)] blur-2xl" />
      <svg viewBox="0 0 400 400" className="zodiac-wheel relative h-full w-full">
        <defs>
          <radialGradient id="zw-sun" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#fff4d6" />
            <stop offset="45%" stopColor="#f3b94d" />
            <stop offset="100%" stopColor="#ff7c5c" />
          </radialGradient>
          <linearGradient id="zw-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8d58e" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8b7bff" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        <g className="origin-center animate-spin-slow" style={{ transformBox: "fill-box" }}>
          <circle cx="200" cy="200" r="188" fill="none" stroke="url(#zw-ring)" strokeWidth="1" />
          <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          {SIGNS.map((s, i) => {
            const line1 = polar(i * 30, 150);
            const line2 = polar(i * 30, 188);
            const p = polar(i * 30 + 15, 169);
            return (
              <g key={s}>
                <line x1={line1.x} y1={line1.y} x2={line2.x} y2={line2.y} stroke="rgba(255,255,255,0.14)" />
                <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="17" fill="#f8d58e" opacity="0.85" fontFamily="'Segoe UI Symbol', 'Noto Sans Symbols 2', 'Apple Symbols', serif">
                  {s}
                </text>
              </g>
            );
          })}
          {Array.from({ length: 72 }, (_, i) => {
            const a = polar(i * 5, 188);
            const b = polar(i * 5, i % 6 === 0 ? 180 : 184);
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(255,255,255,0.18)" />;
          })}
        </g>

        <g className="origin-center animate-spin-rev" style={{ transformBox: "fill-box" }}>
          <circle cx="200" cy="200" r="112" fill="none" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 6" />
          <circle cx="200" cy="200" r="78" fill="none" stroke="rgba(139,123,255,0.25)" />
          {PLANETS.map((pl, i) => {
            const p = polar(pl.a, i % 2 ? 112 : 78);
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={pl.r * 3} fill={pl.c} opacity="0.15" />
                <circle cx={p.x} cy={p.y} r={pl.r} fill={pl.c} />
              </g>
            );
          })}
        </g>

        <circle cx="200" cy="200" r="34" fill="url(#zw-sun)" />
        <circle cx="200" cy="200" r="46" fill="none" stroke="rgba(243,185,77,0.35)" />
      </svg>
    </div>
  );
}
