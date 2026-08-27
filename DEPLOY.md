# Deploying to Cloudflare

The site is a Next.js app running on Cloudflare's platform, in the same
account that already holds the DNS and the email routing for the domain.

## A note on the adapter

The brief named `@cloudflare/next-on-pages`. That package supports Next.js up
to 15.5.2 and is in maintenance mode. This project is on Next.js 16, so it
uses **`@opennextjs/cloudflare`**, which is Cloudflare's current, supported
adapter and the direct successor. Same hosting, same account, same domain, same
dashboard (Workers and Pages). If you specifically want `next-on-pages`, the
project would need pinning back to Next 15 and every dynamic route marked
`export const runtime = "edge"`. Say the word and that is a small change.

## First deploy

```bash
npm install
npx wrangler login          # opens a browser, authorises this machine
npm run pages:deploy        # builds and uploads
```

`npm run pages:deploy` runs the Next build, converts it to a Cloudflare Worker
bundle in `.open-next/`, and uploads it. The project name is `prettyvicious`,
set in `wrangler.jsonc`.

To check it locally in the real Workers runtime before uploading:

```bash
npm run pages:preview
```

## Environment variables

The two Shopify values from SETUP.md have to be set in Cloudflare too, or the
live site will show placeholder cards.

Dashboard route: **Workers and Pages > prettyvicious > Settings > Variables and
Secrets**. Add both as **Secrets** (encrypted), not plain text:

| Name | Value |
|---|---|
| `SHOPIFY_STORE_DOMAIN` | `your-store.myshopify.com` |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | the Storefront token |

Optional:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://prettyvicious.com` |
| `SHOPIFY_STOREFRONT_API_VERSION` | pin the API version, defaults to `2026-04` |
| `CLUB_SIGNUP_WEBHOOK_URL` | where club signups get POSTed |

Or from the CLI:

```bash
npx wrangler secret put SHOPIFY_STORE_DOMAIN
npx wrangler secret put SHOPIFY_STOREFRONT_ACCESS_TOKEN
```

Redeploy after adding them.

For local development the same values go in `.env.local` (gitignored). There
is a template in `.env.example`.

`npm run pages:preview` runs the real Workers runtime, which reads `.dev.vars`
rather than `.env.local`. Copy `.dev.vars.example` to `.dev.vars` (also
gitignored) if you want products to show up in the preview.

## Connecting the domain

Cloudflare already controls DNS for the domain, so this is nearly automatic.

1. **Workers and Pages > prettyvicious > Settings > Domains and Routes**.
2. **Add > Custom domain**.
3. Enter `prettyvicious.com`, then repeat for `www.prettyvicious.com`.
4. Cloudflare writes the DNS records itself. Certificates issue in a few
   minutes.

The MX records for email routing and the site records live on the same domain
without conflicting. MX handles mail, the site records handle web traffic.
Adding the site does not disturb `support@prettyvicious.com` forwarding.

## Verify after deploying

Walk the whole path on the live domain, not just the homepage:

1. Homepage loads and shows real products, not placeholder cards.
2. Click a product. Price, sizes, and the fit note are all there.
3. Pick a size, add to bag. The bag count in the nav goes up.
4. Open the bag. Line item, quantity controls, and subtotal are correct.
5. Click Checkout. You land on Shopify's checkout on their domain.
6. Complete a real test order and confirm it reaches Tapstitch.

Step 5 is the handoff. If it lands anywhere other than Shopify's hosted
checkout, the Storefront token or the cart is misconfigured.

## Caching

Pages render per request, which keeps prices and stock accurate and needs no
extra Cloudflare resources. Calls to Shopify are cached for five minutes, so
traffic does not translate into Storefront API calls one for one.

If the store gets busy enough to want fully cached pages, add an R2 bucket as
an incremental cache and set it in `open-next.config.ts`. It is not needed for
launch.
