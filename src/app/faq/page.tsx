import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Sizing, shipping times, replacements, and how made-to-order works.",
};

const FAQS = [
  {
    q: "How does the sizing run?",
    a: "Oversized, on purpose. These are heavyweight, relaxed streetwear cuts, so they wear big and boxy. The size chart shows flat, laid-flat measurements (the garment on a table), not body measurements. Take your usual size for the oversized look, or size down one for a closer fit.",
  },
  {
    q: "How long until it arrives?",
    a: "About 7 to 11 business days. Every piece is printed after you order it, so a few days go to production and a few to transit. Tracking is emailed the moment it ships.",
  },
  {
    q: "Do you ship outside the US?",
    a: "Not yet. We ship within the United States only at this time.",
  },
  {
    q: "Can I return or exchange it?",
    a: "No. Because each piece is printed to order just for you, all sales are final, including for fit or change of mind. That is why the fit note sits right next to the size selector. Read it before you order, and email us if you want help picking a size.",
  },
  {
    q: "What if it arrives damaged or misprinted?",
    a: "We replace it, free. Send a clear photo or video within 5 days of delivery along with your order number, and we will get a fresh one made and sent. You never need to ship anything back.",
  },
  {
    q: "Can I cancel or change my order?",
    a: "Once an order is placed we generally cannot cancel or change it, since production starts quickly. Double-check your size and shipping address before you check out. If you catch a mistake immediately, email us and we will do what we can.",
  },
  {
    q: "When is the next drop?",
    a: "Drop 002 is All Hallows. Join the club and you will hear about it before the feed does.",
  },
];

export default function FaqPage() {
  return (
    <PageShell eyebrow="Help" title="Questions">
      {FAQS.map((item) => (
        <div key={item.q}>
          <h2>{item.q}</h2>
          <p className="mt-3">{item.a}</p>
        </div>
      ))}
      <p>
        Still stuck? Email{" "}
        <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a> and we
        reply within {BRAND.replyWindow}.
      </p>
    </PageShell>
  );
}
