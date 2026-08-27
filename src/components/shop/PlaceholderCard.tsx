/**
 * Pre-live state. Shown when Shopify has no products yet, or when the
 * Storefront credentials are not wired up. Keeps the drop grid composed
 * instead of collapsing to an empty row.
 */
export default function PlaceholderCard({ label }: { label: string }) {
  return (
    <div>
      <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden border border-dashed border-[color:var(--hairline)] bg-veil/40">
        <div className="flex flex-col items-center gap-4">
          <span className="text-accent">✦</span>
          <span className="eyebrow">Under wraps</span>
        </div>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="display text-[11px] tracking-[0.24em] text-[color:var(--bone-faint)]">
          {label}
        </h3>
        <p className="shrink-0 text-[12px] text-[color:var(--bone-faint)]">Soon</p>
      </div>
    </div>
  );
}
