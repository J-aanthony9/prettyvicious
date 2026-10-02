import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import VariantGallery from "@/components/shop/VariantGallery";
import AddToCart from "@/components/shop/AddToCart";
import { ProductProvider } from "@/components/shop/ProductContext";
import { getProduct } from "@/lib/shopify";
import { BRAND, COMMERCE, DROPS, FIT_NOTES, PRODUCT_BLURB } from "@/lib/brand";
import { GARMENTS, garmentFor, sizeGuideHref } from "@/lib/garments";
import { cleanDescriptionHtml, cleanDescriptionText, inCurrentDrop } from "@/lib/product";

export const revalidate = 300;

type Params = { params: Promise<{ handle: string }> };

// No generateStaticParams here, on purpose. The root layout reads the cart
// cookie, so every page renders per request. Prebuilding product pages made
// any product the build had not seen (or every product, if the build could
// not reach Shopify) fail at runtime with DYNAMIC_SERVER_USAGE.

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Not found" };

  const description = cleanDescriptionText(product.description).slice(0, 160) || BRAND.positioning;
  return {
    title: product.title,
    description,
    openGraph: {
      title: `${product.title} · ${BRAND.name}`,
      description,
      images: product.featuredImage ? [product.featuredImage.url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const garment = garmentFor(product);
  const fitNote = garment ? FIT_NOTES[garment] : null;
  const chartHref = sizeGuideHref(garment);
  const description = cleanDescriptionHtml(product.descriptionHtml);
  const eyebrow = inCurrentDrop(product)
    ? `Drop ${DROPS.current.number} ✦ ${DROPS.current.title}`
    : BRAND.subLabel;

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <nav className="eyebrow mb-12">
        <Link href="/products" className="link-quiet">
          Shop
        </Link>
        <span className="mx-3 text-[color:var(--bone-faint)]">/</span>
        <span>{product.title}</span>
      </nav>

      <ProductProvider product={product}>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <VariantGallery />

          <div className="min-w-0 lg:pt-6">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="display mt-6 text-[clamp(1.4rem,4vw,2.2rem)]">{product.title}</h1>

            <AddToCart sizeGuideHref={chartHref} />

            {/* The fit note sits right by the size picker on purpose. Only
                garments with a written note make a fit claim; the rest get
                a straight link to their own chart. */}
            {fitNote ? (
              <div className="mt-12 border-l border-[color:var(--color-accent-deep)] bg-veil p-6">
                <h2 className="display text-[12px] tracking-[0.24em]">{fitNote.heading}</h2>
                <p className="dim mt-4 text-[15px] leading-[1.85]">{fitNote.body}</p>
                <Link
                  href={chartHref}
                  className="link-quiet mt-5 inline-block py-1 text-[11px] uppercase tracking-[0.22em] text-bone"
                >
                  See the size guide
                </Link>
              </div>
            ) : (
              <div className="mt-12 border-l border-[color:var(--color-accent-deep)] bg-veil px-6 py-5">
                <p className="dim text-[14px] leading-[1.8]">
                  Flat, laid-flat measurements for every size
                  {garment ? ` of the ${GARMENTS[garment].label.toLowerCase()}` : ""}.
                </p>
                <Link
                  href={chartHref}
                  className="link-quiet mt-3 inline-block py-1 text-[11px] uppercase tracking-[0.22em] text-bone"
                >
                  See the size guide
                </Link>
              </div>
            )}

            {/* Nothing renders until a real description is written in
                Shopify, so a blank product leaves no gap. */}
            {description ? (
              <div
                className="dim mt-12 text-[15px] leading-[1.85] [&_a]:underline [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-bone [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : null}

            <div className="rule mt-12" />

            <div className="mt-8">
              <h2 className="eyebrow mb-4">Shipping and returns</h2>
              <p className="dim text-[15px] leading-[1.85]">{PRODUCT_BLURB}</p>
              <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
                <Link href="/policies/shipping" className="link-quiet">
                  Shipping policy
                </Link>
                <Link href="/policies/refunds" className="link-quiet">
                  Refund policy
                </Link>
                <a href={`mailto:${BRAND.supportEmail}`} className="link-quiet break-all">
                  {BRAND.supportEmail}
                </a>
              </p>
              <p className="mt-5 text-[13px] uppercase tracking-[0.24em] text-[color:var(--bone-faint)]">
                Ships within the {COMMERCE.shipsTo} only
              </p>
            </div>
          </div>
        </div>
      </ProductProvider>
    </div>
  );
}
