"use client";

import Gallery from "@/components/shop/Gallery";
import { useProduct } from "@/components/shop/ProductContext";
import { galleryFor } from "@/lib/product";

/**
 * The gallery for whichever variant is chosen. Keyed on the lead image, so
 * picking another design starts the gallery fresh on that design's front
 * instead of leaving it parked on an image of the previous one.
 */
export default function VariantGallery() {
  const { product, variant } = useProduct();
  const images = galleryFor(product, variant);
  return <Gallery key={images[0]?.url ?? "empty"} images={images} title={product.title} />;
}
