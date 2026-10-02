/**
 * Garment types. Each one has its own size chart and fit note.
 *
 * A product's garment comes from its Shopify **Product type** first, and
 * from its title only when the type is blank. Setting the type in Shopify
 * (Products > the product > Product organization > Type) is the reliable
 * way: use exactly one of the `productType` values below. Titles are a
 * fallback, and a design name like "Ghost Crew" on a tee shows why they
 * can mislead.
 */

export type GarmentKey = "oversized-tee" | "essential-tee" | "crewneck";

export const GARMENTS: Record<
  GarmentKey,
  { label: string; tab: string; plural: string; productType: string }
> = {
  "oversized-tee": {
    label: "Snow washed oversized tee",
    tab: "Oversized tee",
    plural: "Oversized tees",
    productType: "Oversized Tee",
  },
  "essential-tee": {
    label: "Essential tee",
    tab: "Essential tee",
    plural: "Essential tees",
    productType: "Essential Tee",
  },
  crewneck: {
    label: "Crewneck",
    tab: "Crewneck",
    plural: "Crewnecks",
    productType: "Crewneck",
  },
};

export const GARMENT_ORDER: GarmentKey[] = ["oversized-tee", "essential-tee", "crewneck"];

export function isGarmentKey(value: unknown): value is GarmentKey {
  return typeof value === "string" && Object.hasOwn(GARMENTS, value);
}

/**
 * Order matters. "Snow washed" is checked before "crew" because a snow
 * washed tee can carry a design called "Ghost Crew" in its title.
 */
function match(text: string): GarmentKey | null {
  const value = text.toLowerCase();
  if (/snow[\s-]*wash/.test(value)) return "oversized-tee";
  if (/essential/.test(value)) return "essential-tee";
  if (/crew\s*neck|sweatshirt|\bcrew\b/.test(value)) return "crewneck";
  if (/oversized[\s-]*tee/.test(value)) return "oversized-tee";
  return null;
}

export function garmentFor(product: { productType: string; title: string }): GarmentKey | null {
  return match(product.productType ?? "") ?? match(product.title);
}

export function sizeGuideHref(garment: GarmentKey | null): string {
  return garment ? `/size-guide?garment=${garment}` : "/size-guide";
}
