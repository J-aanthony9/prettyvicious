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
  productionWindow: "about 7 to 11 business days",
  claimWindowDays: 5,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  freeShipping: `Free shipping on U.S. orders over $${FREE_SHIPPING_THRESHOLD}.`,
} as const;

export const ANNOUNCEMENT = `Free U.S. shipping on orders over $${FREE_SHIPPING_THRESHOLD}`;

export const DROPS = {
  current: {
    number: "001",
    title: "Beauty Professionals Club",
    handle: "drop-001",
  },
  next: {
    number: "002",
    title: "All Hallows",
  },
} as const;

/** Product page blurb, sits near add to cart. */
export const PRODUCT_BLURB =
  `Made to order and printed in the USA. Ships in about 7 to 11 business days. Free shipping on U.S. orders over $${FREE_SHIPPING_THRESHOLD}. All sales final, but if it arrives damaged or misprinted we'll replace it, just send a photo within 5 days. Questions? support@shopprettyvicious.com.`;

/** Required fit note. The top refund preventer, keep it visible. */
export const FIT_NOTE = {
  heading: "Runs oversized. Wear it that way, or size down.",
  body: "These are heavyweight, relaxed streetwear cuts, so they wear big and boxy on purpose. The size chart shows flat, laid-flat measurements (the garment on a table), not body measurements. If you want the oversized look, take your usual size. If you want a closer fit, size down. Check the chart before you order, since made-to-order pieces can't be exchanged for fit.",
} as const;

/**
 * The origin story. The heading is split so the last word can take the
 * gothic accent. The full text lives on the story page, verbatim.
 */
export const ORIGIN = {
  eyebrow: "The Origin",
  headingLead: "Some Dreams Don't",
  headingAccent: "Wait",
  teaser:
    "Pretty Vicious started in the last month of my pregnancy, and launched just one week after my baby boy was born. This is for the women behind the beauty, and anyone holding onto a dream.",
  signature: "Meghan Michelle",
} as const;

export const CLUB = {
  line: "Stay connected to everything Pretty Vicious. First looks, new drops, and all the exclusives.",
  success: "You're in. Watch your inbox, it gets dark in there. ✦",
} as const;

export const PERKS = [
  {
    title: "Made in USA",
    body: "Printed and shipped from our US facility. One drop, one fulfillment method, no split shipments.",
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
      { label: "Drop 001", href: "/collections/drop-001" },
      { label: "All tees", href: "/products" },
      { label: "All Hallows · soon", href: null },
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
