# Shopify setup, click by click

You need two values from Shopify before the site shows real products. This
walks you through getting them. Budget about 20 minutes.

Do this in order. Step 1 comes first for a reason.

---

## Before you start: prove the money engine works

Get plain Shopify plus Tapstitch working and place one real test order end to
end (buy it, confirm it routes to Tapstitch, prints, ships, returns tracking)
**before** you point the custom domain at this site.

Why: if commerce is already proven on default Shopify, then any bug you hit
later is a front end bug, and you know exactly where to look. If you wire
everything up at once and an order fails, you will not know whether the
problem is Shopify, Tapstitch, or the site.

Use the free `your-store.myshopify.com` URL for that test.

---

## 1. Confirm you have at least one product in Shopify

The site reads products **from** Shopify. If Shopify is empty, the site shows
its "under wraps" placeholder cards and nothing else.

Products are created in Tapstitch and synced into Shopify, so:

1. Open Tapstitch and publish at least one product to Shopify.
2. In Shopify go to **Products** and confirm it landed there.
3. Open the product and make sure it is set to **Active**, and that the
   **Online Store** sales channel is checked under Publishing.

That last bit matters. The Storefront API only returns products published to
the Online Store channel. A product that exists but is not published will be
invisible to the site, which looks exactly like a broken site.

---

## 2. Get a Storefront API access token

This is the step people lose an afternoon to. There are two routes to the same
token. **Take route A.** Route B is the older path and it hides the thing you
are looking for in two separate places.

### Route A: the Headless channel (recommended)

1. Install **Headless** from the Shopify App Store
   (`apps.shopify.com/headless`). Free, made by Shopify.
2. Open it from the admin sidebar and create a storefront.
3. It shows a **Public access token** and a **Private access token** on one
   screen, with the product and cart permissions already set.
4. Copy the **public** token.

Use the public one. It is designed to be used from a storefront and is limited
to reading products and managing carts. The private token carries elevated
access and must never go into a website.

### Route B: custom app (the older path)

Only if route A does not work for you.

1. Shopify admin, bottom left, **Settings**.
2. **Apps and sales channels**.
3. **Develop apps**, top right. **If you cannot see this button**, click
   **Allow custom app development** first and confirm. It is hidden until you
   opt in, which is the first place people get stuck.
4. **Create an app**, name it something like `Pretty Vicious Storefront`,
   **Create app**.
5. Open the **Configuration** tab, find **Storefront API integration**, click
   **Configure**, and tick:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_product_tags`
   - `unauthenticated_read_content` (lets the site read collection copy)
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
6. **Save**.
7. Open the **API credentials** tab and click **Install app**, then
   **Install**.
8. The **Storefront API access token** now appears. Reveal it and copy it.

**The token does not exist until you install the app.** Before step 7 you will
only see an API key and a secret key, neither of which is what you want. That
is the second place people get stuck, and the Configuration tab where you set
the scopes is not the tab where the token appears.

You do **not** need the Admin API. Leave that section alone. An Admin token can
read orders and customers, and it must never end up in a website.

---

## 3. Check you copied the right string

Shopify hands out several credentials that look alike. Only one of them works
here.

| Credential | Looks like | Use it? |
|---|---|---|
| Storefront API access token | 32 hex characters, no prefix | Yes, this one |
| Admin API access token | starts with `shpat_` | No. Never in a website |
| API key / secret key | a pair of values | No |

If your string starts with `shpat_`, you are holding the Admin token. Go back
and find the Storefront one.

The Storefront token is public scoped, so it is not a disaster if it leaks, but
do not paste it anywhere public on purpose.

---

## 4. Your store domain

`SHOPIFY_STORE_DOMAIN` is the `your-store.myshopify.com` part of your admin
URL. Not the custom domain, which points at the Cloudflare site. No `https://`,
no trailing slash. Just the host.

---

## 5. Paste the two values into the site

Create a file called `.env.local` in the project root (it is gitignored, so it
will never be committed):

```
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=paste-the-token-here
```

Then run `npm run dev` and open http://localhost:3000. The placeholder cards
should be replaced by your real products.

For the live site, the same two values go into Cloudflare. See DEPLOY.md.

---

## 6. Store settings to confirm

These live in Shopify, not in this codebase. The site cannot fix them.

- **Shopify Payments** connected to your bank account, in
  Settings > Payments. Without this you cannot take money.
- **Price** set to `$34.99` per tee on each product.
- **Shipping rate exists.** Settings > Shipping and delivery. Create a
  shipping zone covering the United States and give it at least one rate.
  This is not optional. **A store with no shipping rate for the customer's
  country breaks checkout**, and the error message Shopify shows is vague.
- **Free shipping on everything, no minimum.** Shipping is a launch promo
  right now, so that US zone needs exactly one rate, priced `$0.00`, with no
  order-value condition on it. Do not add a "spend this much" threshold rate.
  The site says free shipping on all U.S. orders with no minimum anywhere, so
  a threshold in Shopify would contradict it at checkout. The roughly $5
  Tapstitch shipping cost comes out of margin. That is expected.
  When the promo ends, change the rate here and the wording in
  `src/lib/brand.ts` (`COMMERCE.freeShipping` and `ANNOUNCEMENT`) together.
- **United States only.** Do not add international shipping zones yet. No
  zone means no checkout for that country, which is what we want at launch.
- **Size option order.** Tapstitch can sync sizes into Shopify with S at the
  end of the list. The site sorts sizes into wearing order itself, so this
  does not need fixing, but if you want the admin tidy, drag them into order
  on the product's Variants section.
- **The `drop-001` collection is optional.** Products > Collections > Create
  collection, title `Beauty Professionals Club`, and set its handle to
  `drop-001` under Search engine listing. Add the drop's products and make
  sure it is published to the Online Store channel. Until it exists, the drop
  pages simply show every product, which is the same thing while the drop is
  the whole catalogue.
- **Policies.** Settings > Policies. The copy for the refund and shipping
  policies is in `src/app/policies/`, and matches what the site shows.
  Paste the same text into Shopify so checkout and site agree. Also click
  the buttons to generate the starter **Privacy Policy** and **Terms of
  Service**. Payment providers expect those to exist.
- **Customer email.** Settings > Notifications. Set the sender to
  `support@shopprettyvicious.com` once Cloudflare email routing is live.
- **Remove the storefront password.** Checkout is hosted on your store's
  domain, and a new store is password protected by default, so until this is
  done every checkout lands on an "Opening soon" page. Online Store >
  Preferences > Password protection, untick "Restrict access to visitors
  with the password", Save. Shopify only allows this once you have picked a
  plan, and the business address under Settings > General has to be filled
  in for Shopify Payments anyway, so do those first.
- **Test the flow for free before the real order.** Settings > Payments >
  Manage (Shopify Payments) > Test mode lets you complete a checkout with a
  test card number and no money moving. Do one of those to prove the
  handoff, then place the single real order that proves Tapstitch.

---

## 7. Do not connect the custom domain to Shopify

The domain points at the Cloudflare Pages site, not at Shopify. Shopify keeps
using its free `myshopify.com` URL, and customers only ever see it during
checkout.

That is normal for a headless build, and it is the one step people get wrong.
If you connect the domain to Shopify, Shopify will start serving its own theme
at your domain and fight with the Cloudflare site.

---

## Troubleshooting

**Site shows placeholder cards even though products exist.**
The placeholder state is what the site falls back to whenever it cannot read
products, so it is the symptom of every wiring problem. The actual reason is
printed in the terminal running `npm run dev`, prefixed `[shopify]`. Read that
first. Almost always it is one of two things: the **Online Store** sales
channel is unchecked on the product (step 1), so the Storefront API does not
return it even though it exists in your admin, or there is a typo in the token
or the domain.

**Checkout URL 404s or errors.**
Usually no shipping rate for the United States. See step 6.

**Prices look wrong.**
The site reads prices from Shopify, it never hardcodes them. Fix the price in
Shopify and it changes on the site within five minutes.
