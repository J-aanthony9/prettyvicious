import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SectionHead from "@/components/SectionHead";
import { readCart } from "@/lib/cart-session";
import { checkoutAction, removeItemAction, updateItemAction } from "@/lib/actions";
import { formatMoney } from "@/lib/money";
import { COMMERCE, DROPS } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bag",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const cart = await readCart();
  const lines = cart?.lines ?? [];

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-28 text-center sm:px-8 sm:py-36">
        <SectionHead eyebrow="Your bag" title="Nothing in here yet" />
        <p className="dim mt-10 text-[14px]">
          Drop {DROPS.current.number} is waiting.
        </p>
        <div className="mt-10">
          <Link href={`/collections/${DROPS.current.handle}`} className="btn btn-solid">
            Shop {DROPS.current.title}
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = Number(cart!.cost.subtotalAmount.amount);
  const remaining = COMMERCE.freeShippingThreshold - subtotal;

  return (
    <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
      <SectionHead eyebrow="Your bag" title="Review and check out" align="left" />

      <ul className="mt-14 flex flex-col">
        {lines.map((line) => {
          const image = line.merchandise.image ?? line.merchandise.product.featuredImage;
          return (
            <li
              key={line.id}
              className="flex gap-5 border-b border-[color:var(--hairline)] py-7 sm:gap-8"
            >
              <Link
                href={`/products/${line.merchandise.product.handle}`}
                className="relative h-28 w-[88px] shrink-0 overflow-hidden border border-[color:var(--hairline)] bg-veil"
              >
                {image ? (
                  <Image
                    src={image.url}
                    alt={image.altText || line.merchandise.product.title}
                    fill
                    sizes="88px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-accent">
                    ✦
                  </span>
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                <div>
                  <Link
                    href={`/products/${line.merchandise.product.handle}`}
                    className="display text-[11px] tracking-[0.22em]"
                  >
                    {line.merchandise.product.title}
                  </Link>
                  <p className="dim mt-2 text-[12px]">
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
                        className="px-3.5 py-2 text-[12px] text-[color:var(--bone-dim)] hover:text-bone"
                      >
                        &minus;
                      </button>
                    </form>
                    <span className="min-w-8 text-center text-[12px]">
                      {line.quantity}
                    </span>
                    <form action={updateItemAction}>
                      <input type="hidden" name="lineId" value={line.id} />
                      <input type="hidden" name="quantity" value={line.quantity + 1} />
                      <button
                        type="submit"
                        aria-label="Increase quantity"
                        className="px-3.5 py-2 text-[12px] text-[color:var(--bone-dim)] hover:text-bone"
                      >
                        +
                      </button>
                    </form>
                  </div>

                  <form action={removeItemAction}>
                    <input type="hidden" name="lineId" value={line.id} />
                    <button
                      type="submit"
                      className="text-[10px] uppercase tracking-[0.26em] text-[color:var(--bone-faint)] hover:text-accent"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </div>

              <p className="shrink-0 text-[13px] text-[color:var(--bone-dim)]">
                {formatMoney(line.cost.totalAmount)}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-12 ml-auto max-w-sm">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">Subtotal</span>
          <span className="display text-[16px] tracking-[0.06em]">
            {formatMoney(cart!.cost.subtotalAmount)}
          </span>
        </div>

        <p className="dim mt-4 text-[12px] leading-[1.8]">
          {remaining > 0
            ? `${formatMoney({ amount: remaining.toFixed(2), currencyCode: cart!.cost.subtotalAmount.currencyCode })} away from free U.S. shipping.`
            : "Free U.S. shipping unlocked. ✦"}
        </p>
        <p className="mt-2 text-[11px] text-[color:var(--bone-faint)]">
          Shipping and tax are calculated at checkout. We ship within the{" "}
          {COMMERCE.shipsTo} only.
        </p>

        <form action={checkoutAction} className="mt-8">
          <button type="submit" className="btn btn-solid w-full">
            Checkout
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-[color:var(--bone-faint)]">
          You finish on Shopify's secure checkout.
        </p>
      </div>
    </div>
  );
}
