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

## 2. Create a custom app

1. Shopify admin, bottom left, **Settings**.
2. **Apps and sales channels**.
3. **Develop apps** (top right). If this is your first time, click
   **Allow custom app development** and confirm.
4. **Create an app**.
5. Name it something obvious like `Pretty Vicious Storefront`. App developer
   can stay as you.
6. **Create app**.

---

## 3. Turn on the Storefront API scopes

1. In the app you just made, open the **Configuration** tab.
2. Find **Storefront API integration** and click **Configure**.
3. Tick these scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_product_tags`
   - `unauthenticated_read_product_pickup_locations` (optional, harmless)
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
   - `unauthenticated_read_content` (lets the site read collection copy)
4. **Save**.

You do **not** need the Admin API. Leave that section alone. An Admin token
can read orders and customers, and it must never end up in a website.

---

## 4. Install the app and copy the token

1. Open the **API credentials** tab.
2. Click **Install app**, then **Install**.
3. Under **Storefront API access token**, click to reveal, and copy it.

That string is your `SHOPIFY_STOREFRONT_ACCESS_TOKEN`. It is a public scoped
token, so it is not a disaster if it leaks, but do not paste it anywhere
public on purpose.

Your `SHOPIFY_STORE_DOMAIN` is the `your-store.myshopify.com` part of your
admin URL. Not the custom domain. Not `https://`. Just the host.

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
- **Free shipping over $68.** In that same US zone, add a second rate,
  condition "based on order price", minimum `$68.00`, price `$0.00`.
  The roughly $5 Tapstitch shipping cost comes out of margin. That is
  expected and already priced in.
- **United States only.** Do not add international shipping zones yet. No
  zone means no checkout for that country, which is what we want at launch.
- **Policies.** Settings > Policies. The copy for the refund and shipping
  policies is in `src/app/policies/`, and matches what the site shows.
  Paste the same text into Shopify so checkout and site agree. Also click
  the buttons to generate the starter **Privacy Policy** and **Terms of
  Service**. Payment providers expect those to exist.
- **Customer email.** Settings > Notifications. Set the sender to
  `support@prettyvicious.com` once Cloudflare email routing is live.

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
Almost always the Online Store sales channel is unchecked on the product
(step 1), or the token or domain has a typo. Check the server logs, the
Storefront API error is printed there.

**Checkout URL 404s or errors.**
Usually no shipping rate for the United States. See step 6.

**Prices look wrong.**
The site reads prices from Shopify, it never hardcodes them. Fix the price in
Shopify and it changes on the site within five minutes.
