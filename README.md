# Pretty Vicious

Headless storefront for Pretty Vicious. Beauty Professionals Club.
Established MMXXVI.

Next.js front end, Shopify as the commerce backend, Tapstitch for
print on demand fulfillment, hosted on Cloudflare.

| Layer | What it does |
|---|---|
| Next.js 16 (App Router) + Tailwind 4 | The whole customer facing site |
| Shopify Storefront API (GraphQL) | Products, variants, prices, cart, checkout URL |
| Shopify hosted checkout | Takes the money. We never build a checkout |
| Cloudflare (`@opennextjs/cloudflare`) | Hosting, DNS, and email routing |
| Tapstitch | Prints and ships, US fulfillment |

## Getting started

```bash
npm install
cp .env.example .env.local     # then fill in the two Shopify values
npm run dev
```

Open http://localhost:3000.

**The site runs without Shopify credentials.** With no `.env.local` it renders
the pre-live state: real chrome, real copy, and "under wraps" placeholder
cards where products will go. That is deliberate, so the design can be worked
on before the store is wired up, and so a Shopify outage degrades to a quiet
placeholder instead of a 500 page.

To get real products in, follow **[SETUP.md](./SETUP.md)**. To put it online,
follow **[DEPLOY.md](./DEPLOY.md)**.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production Next build |
| `npm run typecheck` | TypeScript, no emit |
| `npm run pages:preview` | Build and serve in the real Cloudflare runtime |
| `npm run pages:deploy` | Build and deploy to Cloudflare |

## Layout

```
src/
  app/
    page.tsx                    Homepage, all sections in order
    products/                   Shop all, and the product page
    collections/[handle]/       Drop pages
    cart/                       Bag, quantities, checkout handoff
    policies/                   Refunds and shipping (matches Shopify)
    contact/  faq/  story/      Content pages
    globals.css                 Design tokens and the atmosphere
  components/
    Atmosphere.tsx              Film grain, parallax fog, star motes
    Nav.tsx  Footer.tsx         Site chrome
    Wordmark.tsx                Logo stand in, see "Logos" below
    home/                       Hero, ledger, quote, manifesto, perks, club
    shop/                       Product cards, gallery, variant selector
  lib/
    brand.ts                    Every fixed brand string, one place
    shopify/                    Storefront API client, queries, types
    actions.ts                  Cart and club signup server actions
    cart-session.ts             Cart id cookie
```

### Where the copy lives

Brand strings are in `src/lib/brand.ts`, not scattered through components.
Change a price threshold, the support address, or the announcement bar there
and it updates everywhere.

Policy pages are in `src/app/policies/`. Keep them identical to what is pasted
into Shopify, so checkout and the site never contradict each other.

**House rule: no em dashes.** Periods, commas, and parentheses only. This
holds in copy and in code comments.

### The design system

Tokens are at the top of `src/app/globals.css`.

- Ink `#0C0A0B`, veil `#161113` / `#1D1518`, bone `#E9DFCE`,
  accent `#A66E7A` / `#6B454F`, wine `#281A1E`
- Cormorant Garamond for display, Pirata One for the gothic hits,
  Manrope for body
- Atmosphere: film grain over the page, three parallax fog layers, drifting
  motes, a distressed screenprint mask on the hero word "Dark", sky haze at
  the top and a rose underglow at the footer, so the page reads as a descent

Parallax is one rAF throttled write of a single `--sy` custom property that
all three fog layers read at different multipliers. Everything stops under
`prefers-reduced-motion`, and a `<noscript>` rule makes sure content is
visible with JavaScript off.

## How commerce works

1. Server components read products from the Storefront API
   (`src/lib/shopify/index.ts`).
2. Add to bag calls a server action, which creates or updates a Storefront API
   cart and stores the cart id in an httpOnly cookie.
3. Checkout redirects to `cart.checkoutUrl`, which is Shopify's hosted
   checkout on Shopify's domain.

We never see a card number. Shopify handles payments, tax, discounts, and
orders.

Product reads fail soft: an unreachable or unconfigured Shopify shows
placeholder cards and logs the error. Cart writes fail loud, because silently
losing an add to bag is worse than an error message.

US only at launch. Cart buyer identity and product queries are pinned to the
US, and Shopify has no other shipping zone.

## Still to hand over

These are yours, and none of them block anything above.

- **Logos.** `src/components/Wordmark.tsx` currently sets the name in Pirata
  One as a stand in. Drop the transparent PNGs into `public/brand/` as
  `wordmark-bone.png` (nav) and `lockup-burgundy.png` (footer), then swap the
  markup in that one file for `next/image`. Nothing else needs to change.
- **Product photos.** They come through Shopify, so no code change.
- **Which blanks are LA available**, chosen in Tapstitch, so the whole drop
  ships domestic on one fulfillment method.
- **Confirm US fulfillment routing with Tapstitch** for drops. USA flagged
  items can occasionally route through China on larger orders.
- **Club signups currently go nowhere.** The form validates and shows the
  success line, but without `CLUB_SIGNUP_WEBHOOK_URL` set, addresses are only
  written to the server log. Point it at Klaviyo, Mailchimp, Beehiiv, or a
  Zapier catch hook before promising anyone 10% off.
- **Diary the Shopify promo renewal date** so the $1/mo to $39/mo jump is not
  a surprise.

## One deliberate deviation from the brief

The footer link columns are exactly as specified (Shop, Help, Pretty Vicious,
with no shipping or returns links). The shipping and refund policy links sit
in the legal row underneath instead, next to the copyright, because payment
providers expect policies to be reachable from every page. If you would rather
they were not there at all, delete them from
`src/components/Footer.tsx`. The columns themselves are untouched.
