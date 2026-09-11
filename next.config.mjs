// Development only. Hosts that may load the dev server's JavaScript, so the
// site can be tested on a phone over the local network. Comes from
// NEXT_DEV_ORIGINS in .env.local (gitignored) so no personal IP is committed,
// and it has no effect at all on production builds.
const devOrigins = (process.env.NEXT_DEV_ORIGINS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(devOrigins.length ? { allowedDevOrigins: devOrigins } : {}),
  images: {
    // Shopify's CDN does the resizing. See image-loader.ts.
    loader: "custom",
    loaderFile: "./image-loader.ts",
  },
};

export default nextConfig;
