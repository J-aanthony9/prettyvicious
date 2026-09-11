"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import CartLines from "@/components/cart/CartLines";
import { useCartDrawer } from "@/components/cart/CartDrawerProvider";
import { checkoutAction } from "@/lib/actions";
import { formatMoney } from "@/lib/money";
import { COMMERCE, DROPS } from "@/lib/brand";
import { useScrollLock } from "@/lib/use-scroll-lock";

export default function CartDrawer() {
  const { cart, open, closeDrawer } = useCartDrawer();
  const pathname = usePathname();
  const lines = cart?.lines ?? [];
  const count = cart?.totalQuantity ?? 0;

  useScrollLock(open);

  // Following a link inside the drawer lands on a new page; the drawer
  // should not still be covering it.
  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeDrawer]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end bg-ink/70 backdrop-blur-sm"
      onClick={closeDrawer}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        className="flex h-full w-full max-w-md flex-col border-l border-[color:var(--hairline)] bg-veil-deep"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[color:var(--hairline-soft)] px-5 py-4">
          <h2 className="eyebrow">
            Your bag{count > 0 ? ` (${count})` : ""}
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-bone"
            aria-label="Close bag"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
              <p className="dim text-[15px]">Nothing in here yet.</p>
              <Link
                href={`/collections/${DROPS.current.handle}`}
                className="btn btn-solid"
                onClick={closeDrawer}
              >
                Shop {DROPS.current.title}
              </Link>
            </div>
          ) : (
            <CartLines lines={lines} compact />
          )}
        </div>

        {lines.length > 0 ? (
          <div className="border-t border-[color:var(--hairline-soft)] px-5 pb-6 pt-5">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">Subtotal</span>
              <span className="display text-[16px] tracking-[0.06em]">
                {formatMoney(cart!.cost.subtotalAmount)}
              </span>
            </div>
            <p className="dim mt-3 text-[13px] leading-[1.7]">{COMMERCE.freeShipping} ✦</p>

            <form action={checkoutAction} className="mt-5">
              <button type="submit" className="btn btn-solid w-full">
                Checkout
              </button>
            </form>
            <div className="mt-4 flex items-center justify-between text-[12px] text-[color:var(--bone-faint)]">
              <span>Shopify secure checkout</span>
              <Link href="/cart" className="link-quiet" onClick={closeDrawer}>
                View bag
              </Link>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
