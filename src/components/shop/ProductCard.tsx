import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/shopify/types";

export default function ProductCard({ product }: { product: Product }) {
  const image = product.featuredImage ?? product.images[0] ?? null;
  const soldOut = !product.availableForSale;

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block focus-visible:outline-offset-8"
    >
      <div className="relative aspect-[4/5] overflow-hidden border border-[color:var(--hairline)] bg-veil">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText || product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-accent">✦</div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent opacity-70 transition-opacity duration-700 group-hover:opacity-40" />

        {soldOut ? (
          <span className="absolute left-4 top-4 border border-[color:var(--hairline)] bg-ink/80 px-3 py-1.5 text-[9px] uppercase tracking-[0.3em] text-[color:var(--bone-dim)]">
            Sold out
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="display text-[11px] tracking-[0.24em]">{product.title}</h3>
        <p className="shrink-0 text-[12px] text-[color:var(--bone-dim)]">
          {formatMoney(product.priceRange.minVariantPrice)}
        </p>
      </div>
    </Link>
  );
}
