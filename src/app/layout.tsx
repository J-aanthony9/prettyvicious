import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope, Pirata_One } from "next/font/google";
import "./globals.css";
import Atmosphere from "@/components/Atmosphere";
import AnnouncementBar from "@/components/AnnouncementBar";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { readCart } from "@/lib/cart-session";
import { BRAND } from "@/lib/brand";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://prettyvicious.com";

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
      </body>
    </html>
  );
}
