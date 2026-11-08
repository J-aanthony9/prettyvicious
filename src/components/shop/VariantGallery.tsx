"use client";

import { useRef } from "react";
import Gallery from "@/components/shop/Gallery";
import { useProduct } from "@/components/shop/ProductContext";
import { galleryFor, imageSide, leadBack } from "@/lib/product";

/**
 * The gallery for whichever variant is chosen. Keyed on the chosen design's
 * front, so picking another design starts the gallery fresh instead of
 * leaving it parked on an image of the previous one.
 *
 * When the drop leads with the back, the page opens on the back. Once the
 * visitor picks a different design, the gallery opens on that design's
 * front instead, since the front is what changed.
 */
export default function VariantGallery() {
  const { product, variant } = useProduct();
  const images = galleryFor(product, variant);
  const back = leadBack(product);
  const front = variant?.image?.url ?? product.featuredImage?.url ?? images[0]?.url ?? "empty";
  const firstFront = useRef(front);
  const frontIndex = images.findIndex((image) => image.url === front);
  const start = back && front !== firstFront.current && frontIndex > 0 ? frontIndex : 0;
  const labels = Object.fromEntries(
    images.map((image) => [image.url, imageSide(product, image)] as const).filter(([, side]) => side),
  ) as Record<string, "Back" | "Front">;
  return <Gallery key={front} images={images} title={product.title} start={start} labels={labels} />;
}
