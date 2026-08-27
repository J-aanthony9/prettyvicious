import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Shipping policy",
  description:
    "Made to order and shipped from the USA. Most orders arrive in about 7 to 11 business days. Free U.S. shipping over $68.",
};

export default function ShippingPolicyPage() {
  return (
    <PageShell eyebrow="Policies" title="Shipping">
      <h2>Made to order, shipped from the USA.</h2>
      <p>
        Every Pretty Vicious piece is printed after you order it, so give it a
        little time. Orders are produced and shipped from our US facility, and
        most arrive within about 7 to 11 business days from the day you order (a
        few days to print, a few days to ship). We&apos;ll email you tracking the
        moment it&apos;s on the way.
      </p>
      <p>
        Free U.S. shipping on orders over $68. We ship within the United States
        only at this time.
      </p>
    </PageShell>
  );
}
