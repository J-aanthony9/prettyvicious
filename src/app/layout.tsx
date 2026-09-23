import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope, Pirata_One } from "next/font/google";
import "./globals.css";
import Atmosphere from "@/components/Atmosphere";
import AnnouncementBar from "@/components/AnnouncementBar";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { readCart } from "@/lib/cart-session";
import { BRAND } from "@/lib/brand";
import Script from "next/script";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-cormorant",
  display: "swap",
});

const pirata = Pirata_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pirata",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-manrope",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shopprettyvicious.com";

/** The 1200x630 share card. Regenerate with scripts/make-og.mjs. */
const SHARE_IMAGE = "/og.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND.name} · ${BRAND.subLabel}`,
    template: `%s · ${BRAND.name}`,
  },
  description: `${BRAND.positioning} ${BRAND.tagline}.`,
  openGraph: {
    title: `${BRAND.name} · ${BRAND.subLabel}`,
    description: `${BRAND.positioning} ${BRAND.tagline}.`,
    url: siteUrl,
    siteName: BRAND.name,
    type: "website",
    // Absolute, because Slack, iMessage and the rest will not resolve a
    // relative path. metadataBase would make it absolute anyway, but spelling
    // it out means a misconfigured NEXT_PUBLIC_SITE_URL fails loudly instead
    // of silently emitting a localhost URL into a share card.
    images: [
      {
        url: `${siteUrl}${SHARE_IMAGE}`,
        width: 1200,
        height: 630,
        alt: `${BRAND.name}. ${BRAND.tagline}.`,
      },
    ],
  },
  twitter: {
    // summary_large_image gives the full width card. Plain "summary" is the
    // small square thumbnail, which is what a 1200x630 graphic gets wasted on.
    card: "summary_large_image",
    title: `${BRAND.name} · ${BRAND.subLabel}`,
    description: `${BRAND.positioning} ${BRAND.tagline}.`,
    images: [`${siteUrl}${SHARE_IMAGE}`],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0C0A0B",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cart = await readCart();
  // Cloudflare Web Analytics. Cookieless, free, and only rendered once a
  // token from the Cloudflare dashboard is set. See DEPLOY.md.
  const beaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${pirata.variable} ${manrope.variable}`}
    >
      <head>
        {/* Without JS the reveal observer never runs, so show everything. */}
        <noscript>
          <style>{`.reveal { opacity: 1; transform: none; }`}</style>
        </noscript>
      </head>
      <body>
        <Atmosphere />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-veil focus:px-4 focus:py-2 focus:text-xs"
        >
          Skip to content
        </a>
        <AnnouncementBar />
        <Nav cartCount={cart?.totalQuantity ?? 0} />
        <main id="main" className="relative z-10">
          {children}
        </main>
        <Footer />
        {beaconToken ? (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon={JSON.stringify({ token: beaconToken })}
          />
        ) : null}
      </body>
    </html>
  );
}
