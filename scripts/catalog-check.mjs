/**
 * What can the site actually see in Shopify?
 *
 *   npm run catalog:check
 *
 * Reads SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN from the
 * environment, or from .env.local or .dev.vars in the project root, then
 * asks the Storefront API (with the site's own token) for every product and
 * collection it can see.
 *
 * It also reads the store's public Online Store catalogue, which needs no
 * token, and lists any product that is live on the Online Store but missing
 * from the site's channel. That gap is the usual reason a new product does
 * not show up: it was never published to the sales channel the token
 * belongs to (Headless, for most setups).
 */
import { existsSync, readFileSync } from "node:fs";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(".env.local");
loadEnvFile(".dev.vars");

const domain = (process.env.SHOPIFY_STORE_DOMAIN ?? "")
  .trim()
  .replace(/^https?:\/\//, "")
  .replace(/\/+$/, "");
const token = (process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "").trim();
const version = process.env.SHOPIFY_STOREFRONT_API_VERSION || "2026-04";

if (!domain || !token) {
  console.error(
    "Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN, in the environment or in .env.local.",
  );
  process.exit(1);
}

const brand = readFileSync("src/lib/brand.ts", "utf8");
const dropHandle =
  process.argv[2] ?? brand.match(/current:\s*{[\s\S]*?handle:\s*"([^"]+)"/)?.[1] ?? "";

async function storefront(query, variables = {}) {
  const response = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.errors) {
    throw new Error(
      `Storefront API ${response.status}: ${JSON.stringify(payload.errors ?? payload).slice(0, 300)}`,
    );
  }
  return payload.data;
}

async function allPages(query, pick, variables = {}) {
  const items = [];
  let after = null;
  for (;;) {
    const page = pick(await storefront(query, { ...variables, after }));
    if (!page) break;
    items.push(...page.nodes);
    if (!page.pageInfo.hasNextPage) break;
    after = page.pageInfo.endCursor;
  }
  return items;
}

const visible = await allPages(
  `query ($after: String) {
    products(first: 250, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { handle title productType availableForSale }
    }
  }`,
  (data) => data.products,
);

const collections = await allPages(
  `query ($after: String) {
    collections(first: 250, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { handle title }
    }
  }`,
  (data) => data.collections,
);

const drop = dropHandle
  ? await storefront(
      `query ($handle: String!) {
        collection(handle: $handle) {
          title
          products(first: 250) { nodes { handle } }
        }
      }`,
      { handle: dropHandle },
    )
  : null;

console.log(`\nStore: ${domain}  (Storefront API ${version})\n`);
console.log(`Products the site can see: ${visible.length}`);
for (const product of visible) {
  const type = product.productType ? `  [type: ${product.productType}]` : "  [no product type]";
  const sold = product.availableForSale ? "" : "  (sold out)";
  console.log(`  - ${product.title}  /products/${product.handle}${type}${sold}`);
}

console.log(`\nCollections the site can see: ${collections.length}`);
for (const collection of collections) {
  console.log(`  - ${collection.title}  /collections/${collection.handle}`);
}

if (dropHandle) {
  const found = drop?.collection;
  console.log(
    found
      ? `\nCurrent drop "${dropHandle}": visible, ${found.products.nodes.length} products.`
      : `\nCurrent drop "${dropHandle}": NOT visible. Check the handle in src/lib/brand.ts, and that the collection is published to the storefront's sales channel.`,
  );
}

// The public Online Store catalogue. Needs no token, but is unavailable
// while the store is password protected.
try {
  const online = [];
  for (let page = 1; page <= 40; page += 1) {
    const response = await fetch(`https://${domain}/products.json?limit=250&page=${page}`);
    const data = await response.json();
    online.push(...(data.products ?? []));
    if ((data.products ?? []).length < 250) break;
  }
  const seen = new Set(visible.map((product) => product.handle));
  const missing = online.filter((product) => !seen.has(product.handle));
  console.log(`\nLive on the Online Store: ${online.length}`);
  if (missing.length) {
    console.log("Live on the Online Store but NOT visible to the site:");
    for (const product of missing) console.log(`  - ${product.title}  (${product.handle})`);
    console.log(
      "\nPublish those to the storefront's sales channel: Products, tick them, then\n" +
        "\"Include in sales channels\" (or open one and use Publishing > Manage) and\n" +
        "tick Headless. Collections have their own Publishing setting too.",
    );
  } else {
    console.log("Everything on the Online Store is visible to the site.");
  }
} catch {
  console.log(
    "\nCould not read the public Online Store catalogue (store password on?), so the comparison was skipped.",
  );
}
