import type { Metadata } from "next";
import Link from "next/link";
import SectionHead from "@/components/SectionHead";
import CartLines from "@/components/cart/CartLines";
import { readCart } from "@/lib/cart-session";
import { checkoutAction } from "@/lib/actions";
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
        <p className="dim mt-10 text-[15px]">
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

  return (
    <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
      <SectionHead eyebrow="Your bag" title="Review and check out" align="left" />

      <div className="mt-14">
        <CartLines lines={lines} />
      </div>

      <div className="mt-12 ml-auto max-w-sm">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">Subtotal</span>
          <span className="display text-[16px] tracking-[0.06em]">
            {formatMoney(cart!.cost.subtotalAmount)}
          </span>
        </div>

        <p className="dim mt-4 text-[14px] leading-[1.8]">
          {COMMERCE.freeShipping} ✦
        </p>
        <p className="mt-2 text-[13px] text-[color:var(--bone-faint)]">
          Shipping and tax are calculated at checkout. We ship within the{" "}
          {COMMERCE.shipsTo} only.
        </p>

        <form action={checkoutAction} className="mt-8">
          <button type="submit" className="btn btn-solid w-full">
            Checkout
          </button>
        </form>

        <p className="mt-4 text-center text-[13px] text-[color:var(--bone-faint)]">
          You finish on Shopify&apos;s secure checkout.
        </p>
      </div>
    </div>
  );
}
