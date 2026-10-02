import type { NextConfig } from "next";
import { DROPS, RETIRED } from "./src/lib/brand";

// Development only. Hosts that may load the dev server's JavaScript, so the
// site can be tested on a phone over the local network. Comes from
// NEXT_DEV_ORIGINS in .env.local (gitignored) so no personal IP is committed,
// and it has no effect at all on production builds.
const devOrigins = (process.env.NEXT_DEV_ORIGINS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const currentDrop = `/collections/${DROPS.current.handle}`;

const nextConfig: NextConfig = {
  ...(devOrigins.length ? { allowedDevOrigins: devOrigins } : {}),
  images: {
    // Shopify's CDN does the resizing. See image-loader.ts.
    loader: "custom",
    loaderFile: "./image-loader.ts",
  },
  // Retired drops send any shared link to the current drop. Temporary (307)
  // rather than permanent, so a handle can be reused one day without
  // browsers having cached the old redirect forever. The list lives in
  // RETIRED in src/lib/brand.ts.
  async redirects() {
    return [
      ...RETIRED.collections.map((handle) => ({
        source: `/collections/${handle}`,
        destination: currentDrop,
        permanent: false,
      })),
      ...RETIRED.products.map((handle) => ({
        source: `/products/${handle}`,
        destination: currentDrop,
        permanent: false,
      })),
    ];
  },
};

export default nextConfig;
