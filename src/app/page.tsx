import Link from "next/link";
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

      <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <SectionHead
            eyebrow={`Drop ${DROPS.current.number}`}
            title={DROPS.current.title}
          />
        </Reveal>

        <div className="mt-16">
          <ProductGrid products={products} />
        </div>

        {products.length > 0 ? (
          <Reveal delay={140} className="mt-16 text-center">
            <Link href="/products" className="btn">
              View everything
            </Link>
          </Reveal>
        ) : null}
      </section>

      <QuoteBand />
      <Manifesto />
      <Perks />
      <ClubSignup />
    </>
  );
}
