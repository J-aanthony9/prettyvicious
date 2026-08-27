import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Refund policy",
  description:
    "Pretty Vicious is made to order, so all sales are final. Misprints, damage, defects and lost packages are replaced free.",
};

export default function RefundPolicyPage() {
  return (
    <PageShell eyebrow="Policies" title="Refunds and returns">
      <h2>Every piece is made for you.</h2>
      <p>
        Pretty Vicious is made to order. Nothing is sitting in a warehouse. When
        you place an order, your piece is printed just for you, which means we
        can&apos;t restock it, resell it, or take it back once it&apos;s made. So
        all sales are final. No returns or exchanges for change of mind, wrong
        size, or &ldquo;it wasn&apos;t what I pictured.&rdquo; We know that&apos;s
        a firm line, and we hold it because it&apos;s the honest one for a
        made-to-order brand.
      </p>

      <h2>Here&apos;s what we absolutely will make right.</h2>
      <p>
        If something&apos;s wrong with your order, we fix it. If your piece
        arrives misprinted, damaged, or defective, or your package is lost in
        transit, we replace it, no charge. Just send us a clear photo or video of
        the issue within 5 days of delivery (for lost packages, reach out within
        5 days of the expected delivery date). Email{" "}
        <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a> with
        your order number and a quick description, and we&apos;ll take it from
        there. Approved cases get a fresh replacement sent straight to you. You
        won&apos;t need to ship anything back.
      </p>

      <h2>A few things to know.</h2>
      <ul>
        <li>We ship within the United States only right now.</li>
        <li>
          Because pieces are made to order, we can&apos;t cancel or change an
          order once it&apos;s placed. Please double-check your size and shipping
          details before you check out.
        </li>
        <li>
          You&apos;re responsible for entering the correct shipping address. We
          can&apos;t cover reshipping on packages sent to a wrong address.
        </li>
        <li>
          Defect and damage claims need a photo or video within 5 days of
          delivery. It&apos;s how we get you a replacement fast.
        </li>
      </ul>

      <p>
        Questions before you buy? We&apos;d rather answer them than have you
        guess. Reach us at{" "}
        <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a> and
        we&apos;ll get back to you within {BRAND.replyWindow}.
      </p>
    </PageShell>
  );
}
