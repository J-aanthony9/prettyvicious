import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

/**
 * Android home screen saves. iOS uses apple-icon.png instead, which Next
 * picks up from the file name.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} · ${BRAND.subLabel}`,
    short_name: BRAND.name,
    description: `${BRAND.positioning} ${BRAND.tagline}.`,
    start_url: "/",
    display: "standalone",
    background_color: "#0C0A0B",
    theme_color: "#0C0A0B",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
