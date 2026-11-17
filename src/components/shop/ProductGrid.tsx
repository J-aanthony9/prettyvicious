import ProductCard from "@/components/shop/ProductCard";
import PlaceholderCard from "@/components/shop/PlaceholderCard";
import { DROPS } from "@/lib/brand";
import type { ProductSummary } from "@/lib/shopify/types";

/** Shown only when Shopify returns nothing: not wired up yet, or unreachable. */
const PLACEHOLDERS = ["I", "II", "III"].map((numeral) => `${DROPS.current.title} ${numeral}`);

/**
 * Three across on wide screens, so a drop of 9 or 12 fills its rows. Four
 * across only when the count divides by four and not by three (4, 8, 16),
 * where three across would leave a stray card on the last row.
 */
function wideColumns(count: number): string {
  return count % 4 === 0 && count % 3 !== 0
    ? "min-[900px]:grid-cols-4"
    : "min-[900px]:grid-cols-3";
}

/** The first rows: their pictures load with the page, the rest as they near. */
const EAGER_CARDS = 6;

/**
 * Product cards sit still: no fade or slide as they scroll in, so the
 * pictures are simply there when a shopper reaches them.
 */
export default function ProductGrid({ products }: { products: ProductSummary[] }) {
  const count = products.length || PLACEHOLDERS.length;

  return (
    <div
      className={`grid grid-cols-1 gap-x-4 gap-y-8 min-[560px]:grid-cols-2 ${wideColumns(count)}`}
    >
      {products.length > 0
        ? products.map((product, index) => (
            <ProductCard key={product.id} product={product} eager={index < EAGER_CARDS} />
          ))
        : PLACEHOLDERS.map((label) => (
            <PlaceholderCard key={label} label={label} tag={`Drop ${DROPS.current.number}`} />
          ))}
    </div>
  );
}
