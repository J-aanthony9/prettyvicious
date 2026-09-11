import Image from "next/image";
import Link from "next/link";
import { removeItemAction, updateItemAction } from "@/lib/actions";
import { formatMoney } from "@/lib/money";
import type { CartLine } from "@/lib/shopify/types";

/**
 * The line items, shared by the bag page and the drawer. Quantity and remove
 * are plain forms posting to server actions, so they work without JS and
 * the layout refresh after each action keeps every copy of the cart in sync.
 */
export default function CartLines({
  lines,
  compact = false,
}: {
  lines: CartLine[];
  compact?: boolean;
}) {
  return (
    <ul className="flex flex-col">
      {lines.map((line) => {
        const image = line.merchandise.image ?? line.merchandise.product.featuredImage;
        const href = `/products/${line.merchandise.product.handle}`;
        return (
          <li
            key={line.id}
            className={`flex gap-4 border-b border-[color:var(--hairline)] ${
              compact ? "py-5" : "py-7 sm:gap-8"
            }`}
          >
            <Link
              href={href}
              className={`relative shrink-0 overflow-hidden border border-[color:var(--hairline)] bg-white ${
                compact ? "h-20 w-16" : "h-28 w-[88px]"
              }`}
            >
              {image ? (
                <Image
                  src={image.url}
                  alt={image.altText || line.merchandise.product.title}
                  fill
                  sizes="88px"
                  className="object-contain"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-accent">✦</span>
              )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
              <div>
                <Link href={href} className="display text-[12px] tracking-[0.22em]">
                  {line.merchandise.product.title}
                </Link>
                <p className="dim mt-1.5 text-[13px]">
                  {line.merchandise.selectedOptions
                    .map((option) => `${option.name}: ${option.value}`)
                    .join(" · ")}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center border border-[color:var(--hairline)]">
                  <form action={updateItemAction}>
                    <input type="hidden" name="lineId" value={line.id} />
                    <input type="hidden" name="quantity" value={line.quantity - 1} />
                    <button
                      type="submit"
                      aria-label="Decrease quantity"
                      className="px-3.5 py-2 text-[14px] text-[color:var(--bone-dim)] hover:text-bone"
                    >
                      &minus;
                    </button>
                  </form>
                  <span className="min-w-8 text-center text-[14px]">{line.quantity}</span>
                  <form action={updateItemAction}>
                    <input type="hidden" name="lineId" value={line.id} />
                    <input type="hidden" name="quantity" value={line.quantity + 1} />
                    <button
                      type="submit"
                      aria-label="Increase quantity"
                      className="px-3.5 py-2 text-[14px] text-[color:var(--bone-dim)] hover:text-bone"
                    >
                      +
                    </button>
                  </form>
                </div>

                <form action={removeItemAction}>
                  <input type="hidden" name="lineId" value={line.id} />
                  <button
                    type="submit"
                    className="text-[11px] uppercase tracking-[0.26em] text-[color:var(--bone-faint)] hover:text-accent"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </div>

            <p className="shrink-0 text-[15px] text-[color:var(--bone-dim)]">
              {formatMoney(line.cost.totalAmount)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
