import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { cardNote, hasPriceRange, inCurrentDrop } from "@/lib/product";
import { DROPS } from "@/lib/brand";
import type { ProductSummary } from "@/lib/shopify/types";

export default function ProductCard({ product }: { product: ProductSummary }) {
  const image = product.featuredImage;
  const soldOut = !product.availableForSale;
  // The badge names the drop only for pieces that are actually in it, so a
  // product from any other collection never claims to be part of the drop.
  const badge = soldOut ? "Sold out" : inCurrentDrop(product) ? DROPS.current.title : null;
  const price = formatMoney(product.priceRange.minVariantPrice);
  const note = cardNote(product);

  return (
    <Link href={`/products/${product.handle}`} className="group block overflow-hidden rounded">
      <div className="card-face relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded border border-[color:var(--hairline-soft)] transition-transform duration-[350ms] group-hover:-translate-y-[5px]">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText || product.title}
            fill
            sizes="(min-width: 900px) 33vw, (min-width: 560px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <span className="text-[22px] text-accent">✦</span>
        )}

        {badge ? (
          <span className="absolute left-3 top-3 rounded-sm bg-accent px-[9px] py-[5px] text-[10px] font-bold uppercase tracking-[0.2em] text-[#171012]">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="flex items-baseline justify-between gap-3 px-1 pt-3.5">
        <h3 className="font-[family-name:var(--font-display)] text-[19px] font-medium leading-[1.25] tracking-[0.03em]">
          {product.title}
        </h3>
        <span className="shrink-0 text-[13px] font-semibold tracking-[0.08em] text-[color:var(--bone-dim)]">
          {hasPriceRange(product) ? `From ${price}` : price}
        </span>
      </div>
      {note ? (
        <p className="px-1 pt-1 text-[12px] tracking-[0.06em] text-[color:var(--bone-dim)]">
          {note}
        </p>
      ) : null}
    </Link>
  );
}
