import type { Metadata } from "next";
import ProductGrid from "@/components/shop/ProductGrid";
import SectionHead from "@/components/SectionHead";
import Reveal from "@/components/Reveal";
import { getAllProducts } from "@/lib/shopify";
import TypeChips, { activeType, filterByType } from "@/components/shop/TypeChips";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shop",
  description: "Every piece, made to order and printed in the USA.",
};

type Props = { searchParams: Promise<{ type?: string | string[] }> };

export default async function ProductsPage({ searchParams }: Props) {
  // Every product published to the storefront, however many there are.
  const products = await getAllProducts();
  const type = activeType((await searchParams).type, products);
  
  return (
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal>
        <SectionHead eyebrow="Everything" title="Shop all" />
      </Reveal>
      <div className="mt-16 flex flex-col gap-10">
        <TypeChips products={products} active={type} basePath="/products" />
        <ProductGrid products={filterByType(products, type)} />
      </div>
    </div>
  );
}
