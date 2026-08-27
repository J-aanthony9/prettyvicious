import ProductCard from "@/components/shop/ProductCard";
import PlaceholderCard from "@/components/shop/PlaceholderCard";
import Reveal from "@/components/Reveal";
import type { Product } from "@/lib/shopify/types";

/** Names used for the pre-live placeholder cards, in drop order. */
const PLACEHOLDERS = [
  "Lash Artist",
  "Nail Tech",
  "Hair Stylist",
  "Club Crest",
];

export default function ProductGrid({ products }: { products: Product[] }) {
  const isLive = products.length > 0;

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
      {isLive
        ? products.map((product, index) => (
            <Reveal key={product.id} delay={index * 90}>
              <ProductCard product={product} />
            </Reveal>
          ))
        : PLACEHOLDERS.map((label, index) => (
            <Reveal key={label} delay={index * 90}>
              <PlaceholderCard label={label} />
            </Reveal>
          ))}
    </div>
  );
}
