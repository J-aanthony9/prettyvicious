import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/shop/ProductGrid";
import SectionHead from "@/components/SectionHead";
import Reveal from "@/components/Reveal";
import { getCollection } from "@/lib/shopify";
import { DROPS } from "@/lib/brand";

export const revalidate = 300;

type Params = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollection(handle, 1);
  const title =
    collection?.title ??
    (handle === DROPS.current.handle ? DROPS.current.title : "Collection");
  return { title, description: collection?.description || undefined };
}

export default async function CollectionPage({ params }: Params) {
  const { handle } = await params;
  const collection = await getCollection(handle, 48);

  // The drop 001 handle always renders, with placeholder cards if the
  // collection has not been created in Shopify yet.
  const isCurrentDrop = handle === DROPS.current.handle;
  if (!collection && !isCurrentDrop) notFound();

  const eyebrow = isCurrentDrop ? `Drop ${DROPS.current.number}` : "Collection";
  const title = collection?.title ?? DROPS.current.title;

  return (
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal>
        <SectionHead eyebrow={eyebrow} title={title} />
      </Reveal>

      {collection?.description ? (
        <Reveal delay={100}>
          <p className="dim mx-auto mt-10 max-w-xl text-center text-[14px] leading-[1.85]">
            {collection.description}
          </p>
        </Reveal>
      ) : null}

      <div className="mt-16">
        <ProductGrid products={collection?.products ?? []} />
      </div>
    </div>
  );
}
