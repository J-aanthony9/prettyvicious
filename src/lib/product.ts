import type { Product } from "@/lib/shopify/types";
import { isSizeOption, sortSizes } from "@/lib/sizes";

/**
 * "S to 3XL", read from the product's own size option and put into wearing
 * order first. Returns null when the product has no size option, or only
 * one size.
 */
export function sizeRange(product: Product): string | null {
  const option = product.options.find((candidate) => isSizeOption(candidate.name));
  if (!option || option.values.length < 2) return null;
  const sizes = sortSizes(option.values);
  return `${sizes[0]} to ${sizes[sizes.length - 1]}`;
}

/**
 * The line under a card title. "Oversized" is true of the whole line (it is
 * what the fit note says), but colour is not, so it never gets asserted here.
 */
export function cardNote(product: Product): string {
  const range = sizeRange(product);
  return range ? `Oversized · ${range}` : "Oversized";
}
