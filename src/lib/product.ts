import type {
  Product,
  ProductOption,
  ProductSummary,
  ProductVariant,
  ShopifyImage,
} from "@/lib/shopify/types";
import { isSizeOption, sortSizes } from "@/lib/sizes";
import { garmentFor } from "@/lib/garments";
import { DROPS } from "@/lib/brand";

export function isColorOption(name: string): boolean {
  return /^colou?r$/i.test(name.trim());
}

/**
 * An option that picks a print rather than a fit or a colour. Tapstitch
 * names it after the product itself, or "Category".
 */
export function isDesignOption(option: ProductOption): boolean {
  return !isSizeOption(option.name) && !isColorOption(option.name);
}

/**
 * What a shopper sees as the option's name. Tapstitch sometimes names the
 * design option after the product ("Essential Ghost Tees"), which reads as
 * a typo on the page, so that one becomes "Design".
 */
export function optionLabel(name: string, productTitle: string): string {
  return name.trim().toLowerCase() === productTitle.trim().toLowerCase() ? "Design" : name;
}

/**
 * "S to 3XL", read from the product's own size option and put into wearing
 * order first. Returns null when the product has no size option, or only
 * one size.
 */
export function sizeRange(product: Pick<ProductSummary, "options">): string | null {
  const option = product.options.find((candidate) => isSizeOption(candidate.name));
  if (!option || option.values.length < 2) return null;
  const sizes = sortSizes(option.values);
  return `${sizes[0]} to ${sizes[sizes.length - 1]}`;
}

export function designCount(product: Pick<ProductSummary, "options">): number {
  const option = product.options.find(
    (candidate) => isDesignOption(candidate) && candidate.values.length > 1,
  );
  return option?.values.length ?? 0;
}

/**
 * Design swatches for a card: one per value of the product's design option,
 * each with that design's image. Empty when the product has a single
 * design, or when its designs do not have distinct images to show.
 */
export function cardSwatches(
  product: Pick<ProductSummary, "options" | "swatchVariants">,
): Array<{ value: string; image: ShopifyImage }> {
  const option = product.options.find(
    (candidate) => isDesignOption(candidate) && candidate.values.length > 1,
  );
  if (!option) return [];
  const swatches = option.values.map((value) => ({
    value,
    image:
      product.swatchVariants.find(
        (variant) =>
          variant.image &&
          variant.selectedOptions.some((o) => o.name === option.name && o.value === value),
      )?.image ?? null,
  }));
  const urls = new Set(swatches.map((swatch) => swatch.image?.url));
  if (swatches.some((swatch) => !swatch.image) || urls.size !== swatches.length) return [];
  return swatches as Array<{ value: string; image: ShopifyImage }>;
}

/**
 * The line under a card title. "Oversized" only on the oversized tee, where
 * the fit note says so. Everything else is read from the product's options.
 */
export function cardNote(product: ProductSummary): string {
  const parts: string[] = [];
  if (garmentFor(product) === "oversized-tee") parts.push("Oversized");
  const designs = designCount(product);
  if (designs > 1) parts.push(`${designs} designs`);
  const range = sizeRange(product);
  if (range) parts.push(range);
  return parts.join(" · ");
}

/** True when the variants are not all one price, so a card says "From". */
export function hasPriceRange(product: Pick<ProductSummary, "priceRange">): boolean {
  const { minVariantPrice, maxVariantPrice } = product.priceRange;
  return Number(minVariantPrice.amount) !== Number(maxVariantPrice.amount);
}

export function inCurrentDrop(product: Pick<ProductSummary, "collections">): boolean {
  return product.collections.some((collection) => collection.handle === DROPS.current.handle);
}

/* -------------------------------------------------------------------------
   Descriptions
   Products can arrive with no copy yet (Tapstitch writes a lone "."), or
   with the supplier's own sales copy, which talks about "custom printing"
   and names the supplier. Neither belongs on the site, so both count as
   empty until a real description is written in Shopify.
   ------------------------------------------------------------------------- */

const SUPPLIER_COPY = [
  /tapstitch/i,
  /odmpod/i,
  /custom printing/i,
  /on[\s-]demand printing/i,
  /apparel lineup/i,
  /core stock item/i,
];

function isUsableText(text: string): boolean {
  if (!/[a-z0-9]/i.test(text)) return false;
  return !SUPPLIER_COPY.some((pattern) => pattern.test(text));
}

/**
 * Description HTML that is safe to render, or "" when there is nothing
 * real to show. Supplier size tables are dropped: they are fixed width,
 * break the layout on a phone, and the site has its own charts.
 */
export function cleanDescriptionHtml(html: string | null | undefined): string {
  if (!html) return "";
  const withoutTables = html.replace(/<table[\s\S]*?<\/table>/gi, "");
  const text = withoutTables
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .trim();
  return isUsableText(text) ? withoutTables : "";
}

export function cleanDescriptionText(text: string | null | undefined): string {
  const value = (text ?? "").trim();
  return isUsableText(value) ? value : "";
}

/* -------------------------------------------------------------------------
   Images
   ------------------------------------------------------------------------- */

/** Supplier size chart strips. The site has real charts, so these are hidden. */
const CHART_IMAGE = /size[-_]?(guide|chart)/i;

function imagePath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

/** Every image once, featured first, supplier charts removed. */
export function productImages(product: Product): ShopifyImage[] {
  const seen = new Set<string>();
  const ordered = [product.featuredImage, ...product.images].filter(
    (image): image is ShopifyImage => Boolean(image),
  );
  return ordered.filter((image) => {
    if (seen.has(image.url) || CHART_IMAGE.test(imagePath(image.url))) return false;
    seen.add(image.url);
    return true;
  });
}

/**
 * The gallery for the chosen variant. When variants carry different images
 * (one per design or colour), the chosen one leads and the other variants'
 * images step aside, so picking "Lashes Never Die" never shows another
 * design's front. Images attached to no variant (a back view, say) stay.
 */
export function galleryFor(product: Product, variant: ProductVariant | null): ShopifyImage[] {
  const all = productImages(product);
  const variantUrls = new Set(
    product.variants.map((candidate) => candidate.image?.url).filter(Boolean) as string[],
  );
  if (variantUrls.size <= 1 || !variant?.image) return all;
  const shared = all.filter((image) => !variantUrls.has(image.url));
  return [variant.image, ...shared];
}

/* -------------------------------------------------------------------------
   Variants
   ------------------------------------------------------------------------- */

export type Selection = Record<string, string>;

export function findVariant(product: Product, selection: Selection): ProductVariant | null {
  return (
    product.variants.find((variant) =>
      variant.selectedOptions.every((option) => selection[option.name] === option.value),
    ) ?? null
  );
}

export function selectionOf(variant: ProductVariant): Selection {
  return Object.fromEntries(variant.selectedOptions.map((option) => [option.name, option.value]));
}

/**
 * The variant a visitor lands on: the first one that can be bought, reading
 * sizes in the order they are shown, so the highlighted size is the first
 * available one on screen.
 */
export function defaultVariant(product: Product): ProductVariant | null {
  const sizeOption = product.options.find((option) => isSizeOption(option.name));
  const sizeOrder = sizeOption ? sortSizes(sizeOption.values) : [];
  const rank = (variant: ProductVariant): number => {
    const size = variant.selectedOptions.find((option) => isSizeOption(option.name));
    if (!size) return 0;
    const index = sizeOrder.indexOf(size.value);
    return index === -1 ? Number.POSITIVE_INFINITY : index;
  };
  const ordered = [...product.variants].sort((a, b) => rank(a) - rank(b));
  return ordered.find((variant) => variant.availableForSale) ?? ordered[0] ?? null;
}

/**
 * Picking a value that does not combine with the current choices (that size
 * is not made in that design, say) moves the other options to the closest
 * combination that can be bought, rather than leaving a dead selection.
 */
export function selectValue(
  product: Product,
  current: Selection,
  optionName: string,
  value: string,
): Selection {
  const wanted = { ...current, [optionName]: value };
  const exact = findVariant(product, wanted);
  if (exact?.availableForSale) return wanted;

  const candidates = product.variants.filter((variant) =>
    variant.selectedOptions.some((option) => option.name === optionName && option.value === value),
  );
  const score = (variant: ProductVariant) =>
    variant.selectedOptions.filter((option) => current[option.name] === option.value).length +
    (variant.availableForSale ? 100 : 0);
  const best = [...candidates].sort((a, b) => score(b) - score(a))[0];
  return best ? selectionOf(best) : wanted;
}

export type ValueState = "available" | "unavailable-here" | "unavailable";

/**
 * How a value should look given the other choices. "unavailable-here"
 * means it exists, just not with the current choices, so it can still be
 * tapped and the others will move. "unavailable" means nothing with this
 * value can be bought at all, so it is disabled.
 */
export function valueState(
  product: Product,
  current: Selection,
  optionName: string,
  value: string,
): ValueState {
  const withValue = product.variants.filter((variant) =>
    variant.selectedOptions.some((option) => option.name === optionName && option.value === value),
  );
  if (!withValue.some((variant) => variant.availableForSale)) return "unavailable";
  const exact = findVariant(product, { ...current, [optionName]: value });
  return exact?.availableForSale ? "available" : "unavailable-here";
}

/** The image shown on a design swatch: the first variant with that value that has one. */
export function swatchImage(
  product: Product,
  optionName: string,
  value: string,
): ShopifyImage | null {
  const variant = product.variants.find(
    (candidate) =>
      candidate.image &&
      candidate.selectedOptions.some(
        (option) => option.name === optionName && option.value === value,
      ),
  );
  return variant?.image ?? null;
}

/** True when each value of the option shows a different image, so swatches tell them apart. */
export function optionHasImages(product: Product, option: ProductOption): boolean {
  if (option.values.length < 2) return false;
  const urls = option.values.map((value) => swatchImage(product, option.name, value)?.url);
  return urls.every(Boolean) && new Set(urls).size === option.values.length;
}
