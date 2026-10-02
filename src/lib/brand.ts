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
    number: "002",
    title: "All Hallows",
    handle: "all-hallows",
    /** Homepage drop section heading. */
    heading: "To Die For",
    /** Homepage drop section line. {count} becomes the piece count, spelled out. */
    sub: "{count} pieces for the haunting season. Printed dark.",
    /** Hero line, after the positioning sentence. */
    heroLine: "Drop 002 is All Hallows. Booked to death, still to die for.",
  },
  /** Teased in the ledger strip. Null shows "Under wraps". */
  next: null as { number: string; title: string } | null,
} as const;

/**
 * The first-visit welcome on the homepage (components/WelcomeVeil.tsx).
 * Plays once per visitor per drop: the storage key carries the drop number,
 * so the next drop greets everyone again. Set enabled to false to turn it off.
 */
export const INTRO = {
  enabled: true,
  eyebrow: `Drop ${DROPS.current.number}`,
  title: DROPS.current.title,
  storageKey: `pv-intro-${DROPS.current.number}`,
} as const;

/**
 * Old URLs that may already be shared. Each one redirects to the current
 * drop's collection page (see next.config.ts). Add a retired drop's handles
 * here when it is replaced.
 */
export const RETIRED = {
  collections: ["drop-001"],
  products: [
    "the-lash-artist-tee",
    "the-nail-tech-tee",
    "the-hair-stylist-tee",
    "the-esthetician-tee",
  ],
} as const;

/**
 * Seasonal look. "all-hallows" swaps the hero star for engraved bats, lets a
 * couple of bats into the drifting motes and cools the fog a touch. Set it
 * back to "default" after Halloween and everything returns to the core look.
 */
export type Season = "default" | "all-hallows";
export const SEASON: Season = "all-hallows";

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

export const CLUB = {
  line: "Stay connected to everything Pretty Vicious. First looks, new drops, and all the exclusives.",
  success: "You're in. Watch your inbox, it gets dark in there. ✦",
} as const;

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
