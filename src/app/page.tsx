import Hero from "@/components/home/Hero";
import DropLedger from "@/components/home/DropLedger";
import QuoteBand from "@/components/home/QuoteBand";
import Manifesto from "@/components/home/Manifesto";
import Perks from "@/components/home/Perks";
import ClubSignup from "@/components/home/ClubSignup";
import ProductGrid from "@/components/shop/ProductGrid";
import SectionHead from "@/components/SectionHead";
import Reveal from "@/components/Reveal";
import { getCollection, getProducts } from "@/lib/shopify";
import { DROPS } from "@/lib/brand";

export const revalidate = 300;

const WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

function teeCount(count: number): string {
  if (count === 0) return "Printed dark.";
  const word = WORDS[count] ?? String(count);
  return `${word} ${count === 1 ? "tee" : "tees"}. Printed dark.`;
}

export default async function HomePage() {
  // Prefer the drop collection. Fall back to the whole catalogue so the grid
  // still fills in before the collection exists in Shopify.
  const collection = await getCollection(DROPS.current.handle, 8);
  const products = collection?.products.length
    ? collection.products
    : await getProducts(8);

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
              title="The First Drop"
              sub={teeCount(products.length)}
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
