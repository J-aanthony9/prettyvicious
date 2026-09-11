import type { Product } from "@/lib/shopify/types";

/**
 * "S to 3XL", read from the product's own size option.
 *
 * Shopify returns option values in the order the merchant set them, so the
 * ends of the list are the smallest and largest sizes. Returns null when the
 * product has no size option, or only one size.
 */
export function sizeRange(product: Product): string | null {
  const option = product.options.find(
    (candidate) => candidate.name.trim().toLowerCase() === "size",
  );
  if (!option || option.values.length < 2) return null;
  return `${option.values[0]} to ${option.values[option.values.length - 1]}`;
}

/**
 * The line under a card title. "Oversized" is true of the whole line (it is
 * what the fit note says), but colour is not, so it never gets asserted here.
 */
export function cardNote(product: Product): string {
  const range = sizeRange(product);
  return range ? `Oversized · ${range}` : "Oversized";
}
