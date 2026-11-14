import { useId } from "react";

// Lumi's mark: a small orb of light (Ambara yellow) with a friendly face, ringed by the purple orbit of the
// Ambara logo, with one star. Outlines use the page line colour, so it reads in both themes; the face is
// always dark ink on yellow. `live` adds the idle motion (blink, twinkle), off for reduced motion (app.css).
// `sleepy` closes the eyes (the home launcher dozes off when the visitor has been idle for a while).
export function LumiMark({ size = 40, live = false, sleepy = false, className = "" }: { size?: number; live?: boolean; sleepy?: boolean; className?: string }) {
  const front = `lumi-front-${useId().replace(/:/g, "")}`;
  const ring = { cx: 24, cy: 31, rx: 21.5, ry: 5.6, stroke: "var(--p-mark, #7b62d9)", strokeWidth: 2.4 };
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden className={`${live ? "lumi-live" : ""} ${className}`}>
      <defs>
        {/* the lower half of the ring passes in front of the orb */}
        <clipPath id={front} clipPathUnits="userSpaceOnUse">
          <rect x="0" y="31" width="48" height="20" />
        </clipPath>
      </defs>
      <g transform="rotate(-14 24 31)">
        <ellipse {...ring} />
      </g>
      <circle cx="24" cy="25" r="15" fill="#ffd66b" stroke="var(--p-line, #17131f)" strokeWidth="2.4" />
      <path d="M15.6 20.2a9.6 9.6 0 0 1 6.2-5.3" stroke="#fff3c4" strokeWidth="2.6" strokeLinecap="round" />
      {sleepy ? (
        <g stroke="#17131f" strokeWidth="2.2" strokeLinecap="round">
          <path d="M17.6 22.6c1.1 1.2 2.9 1.2 4 0" />
          <path d="M26.4 22.6c1.1 1.2 2.9 1.2 4 0" />
        </g>
      ) : (
        <g className="lumi-eyes" fill="#17131f">
          <rect x="17.9" y="19.8" width="3.4" height="5.2" rx="1.7" />
          <rect x="26.7" y="19.8" width="3.4" height="5.2" rx="1.7" />
        </g>
      )}
      <path d="M21 28.2c1.7 1.5 4.3 1.5 6 0" stroke="#17131f" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16.2" cy="26.8" r="1.6" fill="#ff9fb8" />
      <circle cx="31.8" cy="26.8" r="1.6" fill="#ff9fb8" />
      <g transform="rotate(-14 24 31)" clipPath={`url(#${front})`}>
        <ellipse {...ring} />
      </g>
      <path
        className="lumi-star"
        d="m39.6 2.8 1.4 3.4 3.4 1.4-3.4 1.4-1.4 3.4-1.4-3.4-3.4-1.4 3.4-1.4 1.4-3.4Z"
        fill="#ffd66b"
        stroke="var(--p-line, #17131f)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
