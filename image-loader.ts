import type { ImageLoaderProps } from "next/image";

/**
 * Image loader for next/image.
 *
 * On Cloudflare Workers there is no built in image optimiser, so instead of
 * asking one for a resize, this asks Shopify's CDN, which resizes any product
 * image on request with a width query and caches the result. Every product
 * image the site shows lives on that CDN.
 *
 * Anything else is served untouched, because a local file has no CDN behind
 * it to resize against. Those call sites pass `unoptimized` (see
 * components/Wordmark.tsx), which is how Next is told the no-op is deliberate.
 * Do not "fix" this by appending a width to a URL that cannot use one.
 */
export default function imageLoader({ src, width }: ImageLoaderProps): string {
  if (!/^https:\/\/cdn\.shopify\.com\//.test(src)) return src;
  const url = new URL(src);
  url.searchParams.set("width", String(width));
  return url.toString();
}
