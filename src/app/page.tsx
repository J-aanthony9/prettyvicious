import Hero from "@/components/home/Hero";
import DropLedger from "@/components/home/DropLedger";
import QuoteBand from "@/components/home/QuoteBand";
import Manifesto from "@/components/home/Manifesto";
import Perks from "@/components/home/Perks";
import ClubSignup from "@/components/home/ClubSignup";
import ProductGrid from "@/components/shop/ProductGrid";
import SectionHead from "@/components/SectionHead";
import Reveal from "@/components/Reveal";
import { getAllProducts, getCollection } from "@/lib/shopify";
import { DROPS } from "@/lib/brand";

export const revalidate = 300;

const WORDS = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
  "Eighteen", "Nineteen", "Twenty",
];

/** The drop line, with the real piece count spelled out. */
function dropLine(count: number): string {
  if (count === 0) return "Under wraps. Printed dark.";
  const word = WORDS[count] ?? String(count);
  const line = DROPS.current.sub.replace("{count}", word);
  return count === 1 ? line.replace("pieces", "piece") : line;
}

export default async function HomePage() {
  // The whole drop collection, in its Shopify order. If the collection
  // cannot be read yet, fall back to everything so the grid still fills.
  const collection = await getCollection(DROPS.current.handle);
  const products = collection ? collection.products : await getAllProducts();

  return (
    <>
      <Hero />
      <DropLedger />

      <section
        id="drop"
        className="drop-bg relative z-10 scroll-mt-20 py-[clamp(72px,10vw,128px)]"
      >
        <div className="mx-auto max-w-[1200px] px-[clamp(20px,4vw,48px)]">
          <Reveal className="mb-[clamp(40px,6vw,64px)]">
            <SectionHead
              eyebrow={`Drop ${DROPS.current.number} ✦ ${DROPS.current.title}`}
              title={DROPS.current.heading}
              sub={dropLine(products.length)}
            />
          </Reveal>

          <ProductGrid products={products} />
        </div>
      </section>

      <QuoteBand />
      <Manifesto />
      <Perks />
      <ClubSignup />
    </>
  );
}
