/**
 * Every fixed brand string lives here so copy never drifts between pages.
 * House rule: no em dashes anywhere. Periods, commas, parentheses only.
 */

export const BRAND = {
  name: "Pretty Vicious",
  subLabel: "Beauty Professionals Club",
  established: "MMXXVI",
  establishedYear: 2026,
  tagline: "Beauty is an art",
  positioning: "Alternative apparel for artists.",
  ownerInitials: "MM",
  supportEmail: "support@shopprettyvicious.com",
  replyWindow: "1 to 2 business days",
} as const;

/**
 * U.S. orders at or above this subtotal (in dollars) ship free. The one place
 * to change it. Shopify decides the real charge at checkout, so keep the free
 * shipping rate in Settings > Shipping and delivery on the same number.
 * Never quote a shipping price on the site, only this threshold.
 */
export const FREE_SHIPPING_THRESHOLD = 64;

export const COMMERCE = {
  shipsTo: "United States",
  claimWindowDays: 5,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  freeShipping: `Free shipping on U.S. orders over $${FREE_SHIPPING_THRESHOLD}.`,
} as const;

export const ANNOUNCEMENT = `Free U.S. shipping on orders over $${FREE_SHIPPING_THRESHOLD}`;

/**
 * The featured drop. Swapping to the next drop is an edit to this block:
 * the homepage drop section, ledger strip, hero, nav, footer, product badges
 * and every "shop the drop" button read from it.
 *
 * `handle` is the Shopify collection handle (Products > Collections > the
 * collection > Search engine listing). Whatever is in that collection in
 * Shopify is what the drop shows. No product list lives in code.
 */
export const DROPS = {
  current: {
    number: "003",
    title: "Naughty List",
    handle: "naughty-list",
    /** Homepage drop section heading. */
    heading: "Never Nice",
    /** Homepage drop section line. {count} becomes the piece count, spelled out. */
    sub: "{count} pieces, frozen in. Printed dark.",
    /** Hero line, after the positioning sentence (seasons without their own hero). */
    heroLine: "Drop 003 is Naughty List, for the ones who were never trying to be nice.",
    /** The Naughty List hero: "Drop 003" over the drop name, then this. */
    status: "Out now",
    /**
     * Lead product cards with the back print when one can be found. This
     * drop's pieces carry a small front graphic and a large back graphic,
     * and the back is the hero.
     */
    leadWithBack: true,
  },
  /** Teased in the ledger strip. Null shows "Under wraps". */
  next: null as { number: string; title: string } | null,
} as const;

/**
 * The All Hallows first-visit welcome (components/WelcomeVeil.tsx): the bat
 * draws in and the drop name bleeds in. Kept for next Halloween; it only
 * runs while SEASON is "all-hallows". Plays once per visitor per drop.
 */
export const INTRO = {
  enabled: true,
  eyebrow: `Drop ${DROPS.current.number}`,
  title: DROPS.current.title,
  storageKey: `pv-intro-${DROPS.current.number}`,
} as const;

/**
 * Old URLs that may already be shared. Each one sends visitors to the
 * current drop's collection page. Add a retired drop's handles here when it
 * is replaced.
 *
 * Collections always redirect (next.config.ts). Products redirect only once
 * the product is gone from the storefront (unpublished or deleted), so a
 * piece that is still live never turns into a dead link from Shop all.
 */
export const RETIRED = {
  collections: ["drop-001", "all-hallows"],
  products: [
    // Drop 001
    "the-lash-artist-tee",
    "the-nail-tech-tee",
    "the-hair-stylist-tee",
    "the-esthetician-tee",
    // Drop 002, All Hallows
    "ghost-tees",
    "nails-never-die-snow-washed-oversized-ghost-tee",
    "booked-to-death-snow-washed-oversized-tee",
    "booked-to-death-essential-tee",
    "pretty-vicious-snow-washed-oversized-ghost-crew",
    "never-dies-snow-washed-oversized-tee",
    "pretty-vicious-oversized-ghost-crew",
    "booked-to-death-oversized-crew",
    "never-die-oversized-crew-1",
  ],
} as const;

/**
 * Seasonal look, one switch.
 *   "naughty-list"  Frozen PV centerpiece, engraved frost, slow snowfall,
 *                   colder fog, frost on the dividers, and the ice intro.
 *   "all-hallows"   Engraved bats, bat motes, cooler fog, the bat welcome.
 *                   Kept for next year; not reachable while unselected.
 *   "default"       The core look: the star mandala and star motes.
 */
export type Season = "default" | "all-hallows" | "naughty-list";
export const SEASON: Season = "naughty-list";

/**
 * Naughty List hero background, behind the frozen PV. Three options:
 *   "wall"   a dark frozen stone wall, frost creeping over its edges
 *            (photograph, public/brand/ice/wall.webp)
 *   "frost"  engraved frost creeping in from the edges
 *   "cracks" a faint web of cracked ice radiating from the centre
 */
export const FROST_BACKGROUND: "wall" | "frost" | "cracks" = "wall";

/**
 * The homepage ice intro (components/intro): fog creeps over the glass,
 * "Pretty Vicious" is written into it with a kiss pressed underneath, and
 * three taps break it (crack, more cracks, shatter). First homepage
 * visit per browser session only, Naughty List season only. Set to false to
 * turn it off instantly.
 */
export const ICE_INTRO = true;

export const ICE_INTRO_COPY = {
  /** "script" is fingertip handwriting, "blackletter" is the wordmark revealed by a brush. */
  lettering: "script" as "script" | "blackletter",
  promptTouch: "Tap to break the ice",
  promptPointer: "Click to break the ice",
  /** After the first tap cracks it. */
  promptSecond: "Again",
  /** After the second tap, before the third breaks it. */
  promptThird: "Once more",
} as const;

/**
 * Christmas order-by date (the store's own time zone). Before the end of
 * this day the site says to order by it; from the next day until Christmas
 * it says orders will arrive after Christmas; from Dec 26 it goes quiet and
 * the normal free shipping banner returns. Never promises delivery.
 */
export const CHRISTMAS_ORDER_BY = "2026-12-08";
export const STORE_TIME_ZONE = "America/Chicago";

/** Product page blurb, sits near add to cart. */
export const PRODUCT_BLURB =
  `Made to order, just for you. Free shipping on U.S. orders over $${FREE_SHIPPING_THRESHOLD}. All sales final, but if it arrives damaged or misprinted we'll replace it, just send a photo within 5 days. Questions? support@shopprettyvicious.com.`;

/**
 * Fit notes, one per garment type (see src/lib/garments.ts). The top refund
 * preventer, shown right by the size picker. A garment set to null shows
 * only a link to its chart: no fit claim is made until one is written here.
 */
export const FIT_NOTES = {
  "oversized-tee": {
    heading: "Runs oversized. Wear it that way, or size down.",
    body: "These are heavyweight, relaxed streetwear cuts, so they wear big and boxy on purpose. The size chart shows flat, laid-flat measurements (the garment on a table), not body measurements. If you want the oversized look, take your usual size. If you want a closer fit, size down. Check the chart before you order, since made-to-order pieces can't be exchanged for fit.",
  },
  // Waiting on fit notes from Meghan. Do not invent these.
  "essential-tee": null,
  crewneck: null,
} as const satisfies Record<string, { heading: string; body: string } | null>;

/**
 * The origin story. The heading is split so the last word can take the
 * gothic accent. The full text lives on the story page, verbatim.
 */
export const ORIGIN = {
  eyebrow: "The Origin",
  headingLead: "Some Dreams Don't",
  headingAccent: "Wait",
  teaser:
    "Pretty Vicious started in the last month of my pregnancy, and launched just one week after my baby boy was born. This is for the artists behind the beauty, and anyone holding onto a dream.",
  signature: "Meghan Michelle",
} as const;

/**
 * The email signup (homepage, #club). Same Klaviyo list all year; only the
 * words change with the season. Footer and nav keep "Join the club".
 */
const CLUB_COPY = {
  default: {
    eyebrow: "The Club",
    heading: "Join the Beauty Professionals Club",
    line: "Stay connected to everything Pretty Vicious. First looks, new drops, and all the exclusives.",
    button: "Join the club",
    pending: "Joining",
    success: "You're in. Watch your inbox, it gets dark in there. ✦",
  },
  "naughty-list": {
    eyebrow: "The List",
    heading: "Get on the Naughty List",
    line: "First looks, new drops, and the exclusives, before anyone nice hears about them.",
    button: "Get on the list",
    pending: "Adding you",
    success: "You're on the list. Watch your inbox, it gets cold in there. ✦",
  },
} as const;

export const CLUB = SEASON === "naughty-list" ? CLUB_COPY["naughty-list"] : CLUB_COPY.default;

export const PERKS = [
  {
    title: "Made to Order",
    body: "Printed for you after you order, so nothing sits in a warehouse. Tracking sent the moment it ships.",
  },
  {
    title: "Quality You Can Feel",
    body: "Heavyweight cotton with a substantial hand. It holds its shape, and the print sits in the fabric instead of on top of it.",
  },
  {
    title: `Free Shipping Over $${FREE_SHIPPING_THRESHOLD}`,
    body: `Orders over $${FREE_SHIPPING_THRESHOLD} ship free. Tracking sent the moment it moves.`,
  },
] as const;

/** Footer columns. Fixed. Do not add shipping, returns, or referral links here. */
export const FOOTER_LINKS = [
  {
    heading: "Shop",
    links: [
      { label: DROPS.current.title, href: `/collections/${DROPS.current.handle}` },
      { label: "All products", href: "/products" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Size guide", href: "/size-guide" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    heading: "Pretty Vicious",
    links: [
      { label: "Our story", href: "/story" },
      { label: "Join the club", href: "/#club" },
    ],
  },
] as const;
