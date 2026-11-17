/**
 * A garment laid flat, with the four measurements the chart uses drawn on
 * it. Numbered to match the "how to measure" list. Tees get short sleeves,
 * the crewneck gets long ones with ribbed cuffs and hem, and the hoodies are
 * the long-sleeved body with a hood (and a zip down the front for the
 * zip-up). On a hoodie the length line sits off centre, clear of the zip.
 */
export default function MeasureDiagram({
  kind = "tee",
  className = "",
}: {
  kind?: "tee" | "crewneck" | "hoodie" | "zip-hoodie";
  className?: string;
}) {
  const line = "stroke-[color:var(--color-accent)]";
  const label = "fill-[color:var(--color-bone)] text-[13px] font-semibold";
  const outline = { fill: "none", stroke: "rgba(233,223,206,0.55)", strokeWidth: 1.5 };
  const hooded = kind === "hoodie" || kind === "zip-hoodie";
  // Long sleeves, ribbed cuffs and hem.
  const crew = kind === "crewneck" || hooded;
  const name = hooded ? (kind === "zip-hoodie" ? "zip-up hoodie" : "hoodie") : crew ? "crewneck" : "tee";
  const lengthX = hooded ? 196 : 160;

  return (
    <svg
      viewBox="0 0 320 300"
      className={className}
      role="img"
      aria-label={`Diagram of a ${name} laid flat showing where length, shoulder, chest and sleeve are measured`}
    >
      {crew ? (
        <>
          <path
            d="M118 36 C128 50 192 50 202 36 L262 58 L306 228 L276 238 L238 124 L238 262 L82 262 L82 124 L44 238 L14 228 L58 58 Z"
            strokeLinejoin="round"
            {...outline}
          />
          {/* Ribbed cuffs and hem */}
          <path d="M281 223 L300 216 M285 233 L303 226" {...outline} strokeWidth={1} />
          <path d="M39 223 L20 216 M35 233 L17 226" {...outline} strokeWidth={1} />
          <path d="M82 248 L238 248" {...outline} strokeWidth={1} />
        </>
      ) : (
        <path
          d="M118 36 C128 50 192 50 202 36 L262 58 L290 122 L246 138 L238 118 L238 262 L82 262 L82 118 L74 138 L30 122 L58 58 Z"
          strokeLinejoin="round"
          {...outline}
        />
      )}
      {hooded ? (
        <>
          {/* Hood, laid back, and its opening */}
          <path d="M118 36 C104 14 124 4 160 4 C196 4 216 14 202 36" {...outline} />
          <path d="M126 40 C132 22 188 22 194 40" {...outline} strokeWidth={1} />
          {/* Drawstrings */}
          <path d="M146 54 L146 82 M174 54 L174 82" {...outline} strokeWidth={1} />
          {/* Kangaroo pocket on the pullover, the zip on the zip-up */}
          {kind === "zip-hoodie" ? (
            <line x1="160" y1="52" x2="160" y2="262" {...outline} strokeWidth={1.2} strokeDasharray="1.5 2.5" />
          ) : (
            <path d="M112 248 L120 196 L200 196 L208 248" {...outline} strokeWidth={1} />
          )}
        </>
      ) : (
        /* Collar */
        <path d="M118 36 C130 62 190 62 202 36" {...outline} />
      )}

      {/* 1. Length: collar seam down to hem */}
      <line x1={lengthX} y1="56" x2={lengthX} y2="262" className={line} strokeWidth="1.2" strokeDasharray="3 4" />
      <circle cx={lengthX} cy="280" r="9" fill="var(--color-accent)" />
      <text x={lengthX} y="284" textAnchor="middle" className={label}>1</text>

      {/* 2. Shoulder: seam to seam. On a hoodie the hood fills the top, so
          the number sits out to the side. */}
      <line x1="58" y1="58" x2="262" y2="58" className={line} strokeWidth="1.2" strokeDasharray="3 4" />
      <circle cx={hooded ? 40 : 160} cy={hooded ? 40 : 20} r="9" fill="var(--color-accent)" />
      <text x={hooded ? 40 : 160} y={hooded ? 44 : 24} textAnchor="middle" className={label}>2</text>

      {/* 3. Chest: below the armpits */}
      <line x1="82" y1="140" x2="238" y2="140" className={line} strokeWidth="1.2" strokeDasharray="3 4" />
      <circle cx={hooded ? 124 : 160} cy="158" r="9" fill="var(--color-accent)" />
      <text x={hooded ? 124 : 160} y="162" textAnchor="middle" className={label}>3</text>

      {/* 4. Sleeve: armhole to cuff */}
      {crew ? (
        <>
          <line x1="258" y1="64" x2="294" y2="226" className={line} strokeWidth="1.2" strokeDasharray="3 4" />
          <circle cx="298" cy="100" r="9" fill="var(--color-accent)" />
          <text x="298" y="104" textAnchor="middle" className={label}>4</text>
        </>
      ) : (
        <>
          <line x1="262" y1="58" x2="290" y2="122" className={line} strokeWidth="1.2" strokeDasharray="3 4" />
          <circle cx="300" cy="86" r="9" fill="var(--color-accent)" />
          <text x="300" y="90" textAnchor="middle" className={label}>4</text>
        </>
      )}
    </svg>
  );
}
