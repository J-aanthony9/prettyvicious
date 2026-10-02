import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/shop/ProductGrid";
import SectionHead from "@/components/SectionHead";
import Reveal from "@/components/Reveal";
import { getAllProducts, getCollection } from "@/lib/shopify";
import { DROPS } from "@/lib/brand";
import TypeChips, { activeType, filterByType } from "@/components/shop/TypeChips";

export const revalidate = 300;

type Params = { params: Promise<{ handle: string }> };
type Props = Params & { searchParams: Promise<{ type?: string | string[] }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollection(handle);
  const title =
    collection?.title ??
    (handle === DROPS.current.handle ? DROPS.current.title : "Collection");
  return { title, description: collection?.description || undefined };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle } = await params;
    const collection = await getCollection(handle);

  // The current drop's page always renders, even before its collection is
  // visible to the storefront, so the hero and nav never lead to a 404.
  const isCurrentDrop = handle === DROPS.current.handle;
  if (!collection && !isCurrentDrop) notFound();

  const eyebrow = isCurrentDrop ? `Drop ${DROPS.current.number}` : "Collection";
  const title = collection?.title ?? DROPS.current.title;

  // Whatever is in the collection in Shopify, in its Shopify order. If the
  // current drop's collection cannot be read at all (not created yet, or not
  // published to the storefront's sales channel), show every product rather
  // than an empty page, and say why in the log.
  let products = collection?.products ?? [];
  if (!collection && isCurrentDrop) {
    console.warn(
      `[shopify] Collection "${handle}" is not visible to the storefront. ` +
        "Check it exists and is published to the storefront's sales channel. " +
        "Showing all products instead.",
    );
    products = await getAllProducts();
  }

  const type = activeType((await searchParams).type, products);

  return (
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal>
        <SectionHead eyebrow={eyebrow} title={title} />
      </Reveal>

      {collection?.description ? (
        <Reveal delay={100}>
          <p className="dim mx-auto mt-10 max-w-xl text-center text-[15px] leading-[1.85]">
            {collection.description}
          </p>
        </Reveal>
      ) : null}

      <div className="mt-16 flex flex-col gap-10">
        <TypeChips products={products} active={type} basePath={`/collections/${handle}`} />
        <ProductGrid products={filterByType(products, type)} />
      </div>
    </div>
  );
}
