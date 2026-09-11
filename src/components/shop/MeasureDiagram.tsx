/**
 * A tee laid flat, with the four measurements the chart uses drawn on it.
 * Numbered to match the "how to measure" list.
 */
export default function MeasureDiagram({ className = "" }: { className?: string }) {
  const line = "stroke-[color:var(--color-accent)]";
  const label = "fill-[color:var(--color-bone)] text-[13px] font-semibold";

  return (
    <svg
      viewBox="0 0 320 300"
      className={className}
      role="img"
      aria-label="Diagram of a tee laid flat showing where length, shoulder, chest and sleeve are measured"
    >
      {/* Tee outline */}
      <path
        d="M118 36 C128 50 192 50 202 36 L262 58 L290 122 L246 138 L238 118 L238 262 L82 262 L82 118 L74 138 L30 122 L58 58 Z"
        fill="none"
        stroke="rgba(233,223,206,0.55)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Collar */}
      <path d="M118 36 C130 62 190 62 202 36" fill="none" stroke="rgba(233,223,206,0.55)" strokeWidth="1.5" />

      {/* 1. Length: collar seam down to hem */}
      <line x1="160" y1="56" x2="160" y2="262" className={line} strokeWidth="1.2" strokeDasharray="3 4" />
      <circle cx="160" cy="280" r="9" fill="var(--color-accent)" />
      <text x="160" y="284" textAnchor="middle" className={label}>1</text>

      {/* 2. Shoulder: seam to seam */}
      <line x1="58" y1="58" x2="262" y2="58" className={line} strokeWidth="1.2" strokeDasharray="3 4" />
      <circle cx="160" cy="20" r="9" fill="var(--color-accent)" />
      <text x="160" y="24" textAnchor="middle" className={label}>2</text>

      {/* 3. Chest: below the armpits */}
      <line x1="82" y1="140" x2="238" y2="140" className={line} strokeWidth="1.2" strokeDasharray="3 4" />
      <circle cx="160" cy="158" r="9" fill="var(--color-accent)" />
      <text x="160" y="162" textAnchor="middle" className={label}>3</text>

      {/* 4. Sleeve: armhole to cuff */}
      <line x1="262" y1="58" x2="290" y2="122" className={line} strokeWidth="1.2" strokeDasharray="3 4" />
      <circle cx="300" cy="86" r="9" fill="var(--color-accent)" />
      <text x="300" y="90" textAnchor="middle" className={label}>4</text>
    </svg>
  );
}
