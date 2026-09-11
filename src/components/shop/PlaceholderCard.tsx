/**
 * Pre-live state. Shown when Shopify has no products yet, or when the
 * Storefront credentials are not wired up. Keeps the drop grid composed
 * instead of collapsing to an empty row.
 */
export default function PlaceholderCard({
  label,
  tag,
}: {
  label: string;
  tag: string;
}) {
  return (
    <div className="group overflow-hidden rounded">
      <div className="card-face relative flex aspect-[4/5] flex-col items-center justify-center gap-3.5 rounded border border-[color:var(--hairline-soft)] transition-transform duration-[350ms] group-hover:-translate-y-[5px]">
        <span className="absolute left-3 top-3 rounded-sm bg-accent px-[9px] py-[5px] text-[10px] font-bold uppercase tracking-[0.2em] text-[#171012]">
          {tag}
        </span>
        <span className="text-[22px] text-accent transition-[text-shadow] duration-[350ms] group-hover:[text-shadow:0_0_18px_rgba(166,110,122,0.9)]">
          ✦
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--bone-dim)]">
          Under wraps
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-2.5 px-1 pt-3.5">
        <h3 className="font-[family-name:var(--font-display)] text-[19px] font-medium tracking-[0.03em]">
          {label}
        </h3>
        <span className="shrink-0 text-[13px] font-semibold tracking-[0.08em] text-[color:var(--bone-dim)]">
          $34.99
        </span>
      </div>
      <p className="px-1 pt-0.5 text-[12px] tracking-[0.06em] text-[color:var(--bone-dim)]">
        Oversized · Vintage black
      </p>
    </div>
  );
}
