import type { ImageLoaderProps } from "next/image";

/**
 * Image loader for next/image.
 *
 * On Cloudflare Workers there is no built in image optimiser, so instead of
 * asking one for a resize, this asks Shopify's CDN, which resizes any product
 * image on request with a width query and caches the result. Every product
 * image the site shows lives on that CDN. Anything else (the logo webps in
 * /public, or a local file in development) is served untouched.
 */
export default function imageLoader({ src, width }: ImageLoaderProps): string {
  if (!/^https:\/\/cdn\.shopify\.com\//.test(src)) return src;
  const url = new URL(src);
  url.searchParams.set("width", String(width));
  return url.toString();
}
