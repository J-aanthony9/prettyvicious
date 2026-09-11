import ProductCard from "@/components/shop/ProductCard";
import PlaceholderCard from "@/components/shop/PlaceholderCard";
import Reveal from "@/components/Reveal";
import type { Product } from "@/lib/shopify/types";

/** Pre-live placeholder cards, in drop order. */
const PLACEHOLDERS = [
  { label: "The Lash Artist Tee", tag: "Drop 001" },
  { label: "The Nail Tech Tee", tag: "Drop 001" },
  { label: "The Hair Stylist Tee", tag: "Drop 001" },
  { label: "The Club Crest Tee", tag: "Members first" },
];

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 min-[900px]:grid-cols-4">
      {products.length > 0
        ? products.map((product, index) => (
            <Reveal key={product.id} delay={index * 90}>
              <ProductCard product={product} />
            </Reveal>
          ))
        : PLACEHOLDERS.map((card, index) => (
            <Reveal key={card.label} delay={index * 90}>
              <PlaceholderCard label={card.label} tag={card.tag} />
            </Reveal>
          ))}
    </div>
  );
}
