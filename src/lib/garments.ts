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

export type GarmentKey = "hoodie" | "zip-hoodie" | "oversized-tee" | "essential-tee" | "crewneck";

export const GARMENTS: Record<
  GarmentKey,
  { label: string; tab: string; plural: string; productType: string }
> = {
  hoodie: {
    label: "Snow washed hoodie",
    tab: "Hoodie",
    plural: "Hoodies",
    productType: "Hoodie",
  },
  "zip-hoodie": {
    label: "Zip-up hoodie",
    tab: "Zip hoodie",
    plural: "Zip hoodies",
    productType: "Zip Hoodie",
  },
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

/** Size guide tabs and shop filters, in this order. */
export const GARMENT_ORDER: GarmentKey[] = ["hoodie", "zip-hoodie", "oversized-tee", "essential-tee", "crewneck"];

export function isGarmentKey(value: unknown): value is GarmentKey {
  return typeof value === "string" && Object.hasOwn(GARMENTS, value);
}

/**
 * Order matters. Hoodies come first, because a hoodie can be snow washed
 * too ("Naughty or Nice Snow Washed Hoodie"), and a zip-up before a plain
 * hoodie. Then "snow washed" before "crew", because a snow washed tee can
 * carry a design called "Ghost Crew" in its title.
 */
function match(text: string): GarmentKey | null {
  const value = text.toLowerCase();
  const hoodie = /hood/.test(value);
  if (hoodie && /\bzip/.test(value)) return "zip-hoodie";
  if (hoodie) return "hoodie";
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
