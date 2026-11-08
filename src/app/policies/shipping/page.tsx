import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { COMMERCE } from "@/lib/brand";
import { HOLIDAY_FAQ, currentHolidayPhase } from "@/lib/holiday";

export const metadata: Metadata = {
  title: "Shipping policy",
  description: `Made to order. Tracking is emailed the moment your order ships. ${COMMERCE.freeShipping}`,
};

export default function ShippingPolicyPage() {
  const holiday = currentHolidayPhase() !== "off";
  return (
    <PageShell eyebrow="Policies" title="Shipping">
      <h2>Made to order.</h2>
      <p>
        Every Pretty Vicious piece is made after you order it, so it takes a
        little longer than something pulled off a shelf. We&apos;ll email you
        tracking the moment it&apos;s on the way.
      </p>
      <p>
        {COMMERCE.freeShipping} Shipping for your order is calculated at
        checkout. We ship within the United States only at this time.
      </p>
      {holiday ? (
        <>
          <h2>Ordering for Christmas.</h2>
          <p>{HOLIDAY_FAQ.a}</p>
        </>
      ) : null}
    </PageShell>
  );
}
