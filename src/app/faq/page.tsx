import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { BRAND, COMMERCE } from "@/lib/brand";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Sizing, shipping times, replacements, and how made-to-order works.",
};

const FAQS = [
  {
    q: "How does the sizing run?",
    a: "It depends on the piece, so each one has its own chart. The snow washed oversized tees run big on purpose: take your usual size for the oversized look, or size down one for a closer fit. The essential tees and crewnecks have their own charts on the size guide, and every product page links to the right one. All charts are flat, laid-flat measurements (the garment on a table), not body measurements.",
  },
  {
    q: "How long until it arrives?",
    a: "Every piece is made to order after you buy it, so it takes a little longer than off the shelf. Tracking is emailed the moment it ships.",
  },
  {
    q: "Is shipping free?",
    a: `On U.S. orders over $${COMMERCE.freeShippingThreshold}, yes. Below that, shipping is calculated at checkout before you pay.`,
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
    a: "It is under wraps for now. Join the club and you will hear about it before the feed does.",
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
