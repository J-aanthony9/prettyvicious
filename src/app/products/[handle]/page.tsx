import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/shop/Gallery";
import AddToCart from "@/components/shop/AddToCart";
import { getProduct, getProducts } from "@/lib/shopify";
import { BRAND, COMMERCE, FIT_NOTE, PRODUCT_BLURB } from "@/lib/brand";

export const revalidate = 300;

type Params = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  const products = await getProducts(50);
  return products.map((product) => ({ handle: product.handle }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Not found" };

  return {
    title: product.title,
    description: product.description?.slice(0, 160) || BRAND.positioning,
    openGraph: {
      title: `${product.title} · ${BRAND.name}`,
      description: product.description?.slice(0, 160) || BRAND.positioning,
      images: product.featuredImage ? [product.featuredImage.url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const images = product.featuredImage
    ? [
        product.featuredImage,
        ...product.images.filter((image) => image.url !== product.featuredImage!.url),
      ]
    : product.images;

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <nav className="eyebrow mb-12">
        <Link href="/products" className="link-quiet">
          Shop
        </Link>
        <span className="mx-3 text-[color:var(--bone-faint)]">/</span>
        <span>{product.title}</span>
      </nav>

      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <Gallery images={images} title={product.title} />

        <div className="lg:pt-6">
          <p className="eyebrow">{BRAND.subLabel}</p>
          <h1 className="display mt-6 text-[clamp(1.4rem,4vw,2.2rem)]">
            {product.title}
          </h1>

          <AddToCart product={product} />

          {/* Required fit note. Sits right by the size selector on purpose. */}
          <div className="mt-12 border-l border-[color:var(--color-accent-deep)] bg-veil/50 p-6">
            <h2 className="display text-[10px] tracking-[0.24em]">
              {FIT_NOTE.heading}
            </h2>
            <p className="dim mt-4 text-[13px] leading-[1.85]">{FIT_NOTE.body}</p>
          </div>

          {product.descriptionHtml ? (
            <div
              className="dim mt-12 text-[14px] leading-[1.85] [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          ) : null}

          <div className="rule mt-12" />

          <div className="mt-8">
            <h2 className="eyebrow mb-4">Shipping and returns</h2>
            <p className="dim text-[13px] leading-[1.85]">{PRODUCT_BLURB}</p>
            <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[12px]">
              <Link href="/policies/shipping" className="link-quiet">
                Shipping policy
              </Link>
              <Link href="/policies/refunds" className="link-quiet">
                Refund policy
              </Link>
              <a href={`mailto:${BRAND.supportEmail}`} className="link-quiet">
                {BRAND.supportEmail}
              </a>
            </p>
            <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-[color:var(--bone-faint)]">
              Ships within the {COMMERCE.shipsTo} only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
