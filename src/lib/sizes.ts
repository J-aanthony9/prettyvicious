/**
 * Apparel sizes in wearing order.
 *
 * Shopify returns option values in whatever order they were created, and a
 * Tapstitch sync can leave S at the end of the list. Nothing on the site
 * should trust that order, so every place that shows sizes sorts them here.
 */
const ORDER = ["XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"];

const ALIASES: Record<string, string> = {
  XXL: "2XL",
  XXXL: "3XL",
  XXXXL: "4XL",
  XXXXXL: "5XL",
  SMALL: "S",
  MEDIUM: "M",
  LARGE: "L",
  "X-LARGE": "XL",
  XLARGE: "XL",
};

function canonical(value: string): string {
  const upper = value.trim().toUpperCase().replace(/\s+/g, "");
  return ALIASES[upper] ?? upper;
}

function rank(value: string): number {
  const index = ORDER.indexOf(canonical(value));
  return index === -1 ? Number.POSITIVE_INFINITY : index;
}

export function isSizeOption(name: string): boolean {
  return name.trim().toLowerCase() === "size";
}

/**
 * Returns a new array in wearing order. Values it does not recognise keep
 * their original relative order and go to the end, so an odd size like
 * "One size" never disappears, it just stops pretending to be first.
 */
export function sortSizes(values: readonly string[]): string[] {
  return values
    .map((value, index) => ({ value, index, rank: rank(value) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((entry) => entry.value);
}
