# Deploying to Cloudflare

## Read this first: it is a Worker, not a Pages project

The original brief said Cloudflare Pages. This does not deploy to Pages.

`@opennextjs/cloudflare` builds a Cloudflare **Worker** at
`.open-next/worker.js` and Wrangler uploads it. If you connect this repo in
the **Pages** section of the dashboard, or follow a Pages guide asking for a
"build output directory", it will not work. There is no output directory to
set, because that field only exists for Pages.

`@cloudflare/next-on-pages`, the actual Pages adapter, supports Next up to
15.5.2 and is in maintenance mode. This project is on Next 16, so it uses the
Workers adapter, which is Cloudflare's current supported path.

---

## 1. Pre-flight, before you touch Cloudflare

```bash
npm install
npm run cf:preview
```

`cf:preview` builds the Worker and runs it in `workerd`, the same runtime
Cloudflare runs in production. If a product page renders here, it will render
on Cloudflare. This catches build problems on your machine, where you can
read the error, instead of in a deploy log.

Stop it with Ctrl-C when you are satisfied.

---

## 2. Log in and deploy

```bash
npx wrangler login    # opens a browser, one time only
npm run cf:deploy     # builds and uploads in one step
```

The Worker is created on the first deploy. There is nothing to set up in the
dashboard beforehand.

When it finishes it prints a URL like:

```
https://prettyvicious.<your-subdomain>.workers.dev
```

That address is free, automatic, and permanent. It is not an alternative to
your own domain: you attach the domain in step 5 and both keep serving.

**Expect placeholder "under wraps" cards on this first visit.** The Worker
has no Shopify credentials yet. That is step 3.

---

## 3. Add the Shopify credentials as secrets

Two values, both from SETUP.md. Either route works.

**Dashboard:** **Workers & Pages** → the **prettyvicious** Worker →
**Settings** → **Variables and Secrets** → **Add** → type **Secret** → enter
the name and value → **Deploy**. Repeat for the second one.

**CLI** (faster, and your token never goes through a browser):

```bash
npx wrangler secret put SHOPIFY_STORE_DOMAIN
# paste: hpxgj0-ih.myshopify.com

npx wrangler secret put SHOPIFY_STOREFRONT_ACCESS_TOKEN
# paste your Storefront API token (32 hex characters, no shpat_ prefix)
```

Use **Secret**, not plain text, for the token. The store domain is not
sensitive, but keeping both together is simpler.

---

## 4. Redeploy so the secrets take effect

```bash
npm run cf:deploy
```

**This step is not optional and it is the most confusing thing here.**
Secrets apply to versions uploaded *after* they are set. The version already
running was uploaded without them, so until you redeploy the live site keeps
showing placeholder cards while your local machine works perfectly. If you
are ever staring at a live site full of placeholders, this is almost always
why.

After the redeploy, the `workers.dev` URL should show real products.

---

## 5. Attach your domain

Worker → **Settings** → **Domains & Routes** → **Add** → **Custom domain** →
`shopprettyvicious.com`. Repeat for `www.shopprettyvicious.com`.

Cloudflare already runs DNS for the domain, so it writes the records itself.
Certificates issue in a few minutes. The `workers.dev` URL keeps working
alongside, which is useful for testing.

Then set the site URL so canonical and share links stop pointing at a domain
that was not live yet. This one is a plain **Variable**, not a Secret:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://shopprettyvicious.com` |

Redeploy once more after adding it.

MX records for email routing and the site records coexist on the same domain
without conflict. Attaching the site does not disturb
`support@shopprettyvicious.com` forwarding.

---

## 6. Verify on the live domain

Walk the whole path, not just the homepage:

1. Homepage shows real products, not placeholder cards.
2. A product page shows price, sizes in order (S first), and the fit note.
3. Pick a size, add to bag, the nav count goes up.
4. The bag shows the right line and subtotal.
5. Checkout lands on Shopify's own checkout domain.

Step 5 is the handoff. If it lands anywhere else, the Storefront token or the
cart is misconfigured.

---

## Optional: env vars

| Name | Type | Notes |
|---|---|---|
| `SHOPIFY_STORE_DOMAIN` | Secret | Required |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Secret | Required |
| `NEXT_PUBLIC_SITE_URL` | Variable | Canonical and share URLs |
| `SHOPIFY_STOREFRONT_API_VERSION` | Variable | Pins the API version, defaults to `2026-04` |
| `CLUB_SIGNUP_WEBHOOK_URL` | Secret | Where club signups POST. Unset means they only reach the log |
| `NEXT_PUBLIC_CF_BEACON_TOKEN` | Variable | Cloudflare Web Analytics, see below |

For local development the same values go in `.env.local` (gitignored). There
is a template in `.env.example`. `npm run cf:preview` reads `.dev.vars`
instead, since it runs the Workers runtime; copy `.dev.vars.example` if you
want products in the preview.

---

## Build settings, for reference

You do not enter these anywhere for a CLI deploy: they live in
`wrangler.jsonc` and are already correct. They are recorded here so a future
change does not silently break the build.

| Setting | Value |
|---|---|
| Build and deploy | `npm run cf:deploy` |
| Worker entry (`main`) | `.open-next/worker.js` |
| Static assets | `.open-next/assets`, binding `ASSETS` |
| `compatibility_date` | `2025-09-23` (the adapter needs `2024-09-23` or later) |
| `compatibility_flags` | `nodejs_compat`, `global_fetch_strictly_public` |
| Node | 20 or later (this repo builds on 22) |

`nodejs_compat` is required. Without it the Worker fails at runtime, not at
build time, which makes it an unpleasant one to debug.

---

## Later: Git connected builds

Cloudflare can build and deploy on every merge (Workers Builds: **Workers &
Pages** → your Worker → **Settings** → **Build**, connect the repo). Good
follow-up once the first deploy is proven.

Not for the first deploy. The CLI puts the build on your machine where you
can read errors directly, instead of debugging a remote build environment at
the same time as first contact with Shopify in production. Note that a Git
build runs `generateStaticParams`, which calls Shopify, so the Shopify values
have to exist as **build-time** variables there too, not just runtime
secrets.

---

## Analytics

Shopify's analytics only see checkout. To see the storefront itself, turn on
Cloudflare Web Analytics: dashboard → **Analytics & Logs** → **Web
Analytics** → **Add a site**, enter `shopprettyvicious.com`, and copy the
token out of the snippet it offers (you do not need the snippet). Set it as
`NEXT_PUBLIC_CF_BEACON_TOKEN` and redeploy. Free, cookieless, no consent
banner. Without the token the site renders no beacon at all.

---

## Images

Product images are resized by Shopify's CDN, not by Cloudflare. The custom
loader in `image-loader.ts` appends a width to every `cdn.shopify.com` URL,
so there is no Cloudflare image binding to configure and no image
optimisation cost. Do not add `images.remotePatterns` back; a custom loader
replaces it.

---

## Troubleshooting

**Live site shows placeholder cards, local works.** You set the secrets but
did not redeploy. See step 4.

**Worker deploys but every route 500s.** Check `nodejs_compat` is still in
`compatibility_flags`. Watch live logs with `npx wrangler tail`.

**Checkout lands on "Opening soon".** That is Shopify's storefront password,
not this site. Online Store → Preferences → Password protection. See SETUP.md.

**Build fails on a fresh machine.** Delete `.next`, `.open-next` and
`node_modules`, then `npm install` and try again.
