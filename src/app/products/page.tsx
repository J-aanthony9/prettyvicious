import type { Metadata } from "next";
import ProductGrid from "@/components/shop/ProductGrid";
import SectionHead from "@/components/SectionHead";
import Reveal from "@/components/Reveal";
import { getProducts } from "@/lib/shopify";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shop",
  description: "Every piece, made to order and printed in the USA.",
};

export default async function ProductsPage() {
  const products = await getProducts(48);

  return (
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal>
        <SectionHead eyebrow="Everything" title="Shop all" />
      </Reveal>
      <div className="mt-16">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
