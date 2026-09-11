import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/shopify/types";

export default function ProductCard({ product }: { product: Product }) {
  const image = product.featuredImage ?? product.images[0] ?? null;
  const soldOut = !product.availableForSale;

  return (
    <Link href={`/products/${product.handle}`} className="group block overflow-hidden rounded">
      <div className="card-face relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded border border-[color:var(--hairline-soft)] transition-transform duration-[350ms] group-hover:-translate-y-[5px]">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText || product.title}
            fill
            sizes="(min-width: 900px) 25vw, (min-width: 560px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <span className="text-[22px] text-accent">✦</span>
        )}

        <span className="absolute left-3 top-3 rounded-sm bg-accent px-[9px] py-[5px] text-[10px] font-bold uppercase tracking-[0.2em] text-[#171012]">
          {soldOut ? "Sold out" : "Drop 001"}
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-2.5 px-1 pt-3.5">
        <h3 className="font-[family-name:var(--font-display)] text-[19px] font-medium tracking-[0.03em]">
          {product.title}
        </h3>
        <span className="shrink-0 text-[13px] font-semibold tracking-[0.08em] text-[color:var(--bone-dim)]">
          {formatMoney(product.priceRange.minVariantPrice)}
        </span>
      </div>
      <p className="px-1 pt-0.5 text-[12px] tracking-[0.06em] text-[color:var(--bone-dim)]">
        Oversized · Vintage black
      </p>
    </Link>
  );
}
