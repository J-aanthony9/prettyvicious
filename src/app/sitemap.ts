import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/shopify";
import { DROPS } from "@/lib/brand";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://shopprettyvicious.com";

const STATIC: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/products", priority: 0.9 },
  { path: `/collections/${DROPS.current.handle}`, priority: 0.9 },
  { path: "/size-guide", priority: 0.6 },
  { path: "/story", priority: 0.5 },
  { path: "/faq", priority: 0.5 },
  { path: "/contact", priority: 0.4 },
  { path: "/policies/shipping", priority: 0.3 },
  { path: "/policies/refunds", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts(100);
  const now = new Date();
  return [
    ...STATIC.map((entry) => ({
      url: `${base}${entry.path}`,
      lastModified: now,
      priority: entry.priority,
    })),
    ...products.map((product) => ({
      url: `${base}/products/${product.handle}`,
      lastModified: now,
      priority: 0.8,
    })),
  ];
}
