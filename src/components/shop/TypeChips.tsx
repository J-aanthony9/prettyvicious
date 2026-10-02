import Link from "next/link";
import { GARMENTS, GARMENT_ORDER, garmentFor, isGarmentKey, type GarmentKey } from "@/lib/garments";
import type { ProductSummary } from "@/lib/shopify/types";

const CHIP =
  "inline-flex min-h-[44px] shrink-0 items-center border px-4 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300";

/** The type asked for in the URL, if it is one the listing actually has. */
export function activeType(
  raw: string | string[] | undefined,
  products: ProductSummary[],
): GarmentKey | null {
  if (!isGarmentKey(raw)) return null;
  return products.some((product) => garmentFor(product) === raw) ? raw : null;
}

export function filterByType(products: ProductSummary[], type: GarmentKey | null): ProductSummary[] {
  return type ? products.filter((product) => garmentFor(product) === type) : products;
}

/**
 * Shop by type. Plain links (?type=), so they work without JavaScript and
 * the back button behaves. Only types the listing contains get a chip, and
 * with fewer than two types there is nothing to filter, so no row at all.
 * A thumb can swipe the row sideways on a narrow phone.
 */
export default function TypeChips({
  products,
  active,
  basePath,
}: {
  products: ProductSummary[];
  active: GarmentKey | null;
  basePath: string;
}) {
  const present = GARMENT_ORDER.filter((type) =>
    products.some((product) => garmentFor(product) === type),
  );
  if (present.length < 2) return null;

  const chip = (label: string, href: string, selected: boolean) => (
    <Link
      key={href}
      href={href}
      scroll={false}
      aria-current={selected ? "page" : undefined}
      className={`${CHIP} ${
        selected
          ? "border-[color:var(--color-accent)] bg-[rgba(166,110,122,0.14)] text-bone"
          : "border-[color:var(--hairline)] text-[color:var(--bone-dim)] hover:border-[color:var(--color-accent-deep)]"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav
      aria-label="Shop by type"
      className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {chip("All", basePath, active === null)}
      {present.map((type) =>
        chip(GARMENTS[type].plural, `${basePath}?type=${type}`, active === type),
      )}
    </nav>
  );
}
