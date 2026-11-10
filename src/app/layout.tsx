import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope, Pirata_One } from "next/font/google";
import "./globals.css";
import Atmosphere from "@/components/Atmosphere";
import AnnouncementBar from "@/components/AnnouncementBar";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { readCart } from "@/lib/cart-session";
import { BRAND, ICE_INTRO, INTRO, SEASON } from "@/lib/brand";
import WelcomeVeil from "@/components/WelcomeVeil";
import IceIntroGate from "@/components/intro/IceIntroGate";
import FrostEdges from "@/components/FrostEdges";

/** The All Hallows bat welcome only runs in its own season. */
const BAT_WELCOME = INTRO.enabled && SEASON === "all-hallows";
/** The Naughty List ice intro: client only, homepage only, once a session. */
const ICE = ICE_INTRO && SEASON === "naughty-list";
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
      data-season={SEASON}
      // The intro scripts below may add data-intro or data-ice-cover before
      // React hydrates.
      suppressHydrationWarning
      className={`${cormorant.variable} ${pirata.variable} ${manrope.variable}`}
    >
      <head>
        {/* Decides before first paint whether the welcome plays, so the page
            never shows first and then gets covered. Homepage only, once per
            drop, never with reduced motion. See WelcomeVeil.tsx. */}
        {BAT_WELCOME ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `try{if(location.pathname==="/"&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&!localStorage.getItem(${JSON.stringify(INTRO.storageKey)}))document.documentElement.setAttribute("data-intro","")}catch(e){}`,
            }}
          />
        ) : null}
        {/* The ice intro: decides before first paint whether it will play
            (first homepage visit of the session, not back from checkout, or
            a ?intro= preview), and if so covers the page at once, so the
            homepage never flashes up and then gets fogged over. The intro
            lifts the cover once its fog has formed; CSS lifts it anyway
            after a few seconds if the intro never arrives. On those visits
            only, it also starts fetching the intro's ice photographs. See
            IceIntroGate.tsx. Without JavaScript nothing is covered. */}
        {ICE ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `try{var q=new URLSearchParams(location.search).get("intro");if(q==="script"||q==="blackletter"||(location.pathname==="/"&&document.cookie.split("; ").indexOf("pv-ice-intro=1")<0&&!/shopify|checkout/i.test(document.referrer))){document.documentElement.setAttribute("data-ice-cover","");["/brand/ice/depth.webp","/brand/ice/fog.webp","/brand/ice/frost-corner.webp"].forEach(function(h){var l=document.createElement("link");l.rel="preload";l.as="image";l.href=h;document.head.appendChild(l)})}}catch(e){}`,
            }}
          />
        ) : null}
        {/* Without JS the reveal observer never runs, so show everything. */}
        <noscript>
          <style>{`.reveal { opacity: 1; transform: none; }`}</style>
        </noscript>
      </head>
      <body>
        {BAT_WELCOME ? <WelcomeVeil /> : null}
        {ICE ? <IceIntroGate /> : null}
        <Atmosphere />
        {SEASON === "naughty-list" ? <FrostEdges /> : null}
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
