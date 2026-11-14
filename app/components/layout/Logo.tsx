/** Ambara mark: a crescent inside an orbit, with a single star. */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <defs>
        <linearGradient id="amb-g" x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop className="logo-stop-a" stopColor="#F8D58E" />
          <stop offset="0.55" stopColor="#F3B94D" />
          <stop offset="1" stopColor="#FF7C5C" />
        </linearGradient>
      </defs>
      <ellipse cx="20" cy="20" rx="17.5" ry="8" transform="rotate(-28 20 20)" stroke="url(#amb-g)" strokeOpacity="0.55" strokeWidth="1.2" />
      <path d="M24.5 9.6a11 11 0 1 0 5.9 14.2A9 9 0 1 1 24.5 9.6Z" fill="url(#amb-g)" />
      <path d="m31.5 7 .9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" fill="#EEEAF8" className="logo-star" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-[1.35rem] font-semibold tracking-tight text-star">Ambara</span>
    </span>
  );
}
