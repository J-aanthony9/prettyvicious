import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about an order, sizing, or a damaged item. We reply within 1 to 2 business days.",
};

export default function ContactPage() {
  return (
    <PageShell eyebrow="Help" title="Talk to us">
      <p>
        Need help with an order, a size question, or a damaged item? Email{" "}
        <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a> with
        your order number and we&apos;ll sort it out. We reply within{" "}
        {BRAND.replyWindow}.
      </p>
      <p>
        <a href={`mailto:${BRAND.supportEmail}`} className="btn mt-4 inline-flex">
          Email support
        </a>
      </p>
    </PageShell>
  );
}
