import { cache } from "react";
import {
  ADD_CART_LINES,
  CREATE_CART,
  GET_CART,
  GET_COLLECTION_PRODUCTS,
  GET_PRODUCTS,
  GET_PRODUCT_BY_HANDLE,
  REMOVE_CART_LINES,
  UPDATE_CART_LINES,
} from "./queries";
import { isStorefrontConfigured, ShopifyError, storefront } from "./client";
import type { Cart, CollectionRef, Product, ProductSummary } from "./types";

export { isStorefrontConfigured, ShopifyError };
export * from "./types";

type Connection<T> = { nodes: T[] };
type Page<T> = Connection<T> & {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

type RawSummary = Omit<ProductSummary, "collections" | "swatchVariants"> & {
  collections: Connection<CollectionRef>;
  swatchVariants: Connection<ProductSummary["swatchVariants"][number]>;
};

type RawProduct = RawSummary &
  Omit<Product, keyof ProductSummary | "images" | "variants"> & {
    images: Connection<Product["images"][number]>;
    variants: Connection<Product["variants"][number]>;
  };

type RawCart = Omit<Cart, "lines"> & {
  lines: Connection<Cart["lines"][number]>;
};

function reshapeSummary(raw: RawSummary): ProductSummary {
  return {
    ...raw,
    productType: raw.productType ?? "",
    collections: raw.collections?.nodes ?? [],
    swatchVariants: raw.swatchVariants?.nodes ?? [],
  };
}

function reshapeProduct(raw: RawProduct): Product {
  return {
    ...raw,
    ...reshapeSummary(raw),
    images: raw.images?.nodes ?? [],
    variants: raw.variants?.nodes ?? [],
  };
}

function reshapeCart(raw: RawCart): Cart {
  return { ...raw, lines: raw.lines?.nodes ?? [] };
}

/**
 * Product reads swallow errors and return an empty result. A misconfigured
 * or unreachable Shopify should show the pre-live placeholder state, not a
 * 500 page. Cart writes below do the opposite: they surface the failure,
 * because a silent add to cart is worse than an error.
 */
async function safe<T>(label: string, work: () => Promise<T>, fallback: T): Promise<T> {
  if (!isStorefrontConfigured()) {
    console.warn(`[shopify] ${label}: Shopify is not configured, showing placeholders.`);
    return fallback;
  }
  try {
    return await work();
  } catch (error) {
    // One line that names the read and Shopify's own words, so a single
    // `wrangler tail` shows what failed without digging.
    const message = error instanceof Error ? error.message : String(error);
    const detail = error instanceof ShopifyError && error.detail ? ` ${JSON.stringify(error.detail).slice(0, 400)}` : "";
    console.error(`[shopify] ${label} failed: ${message}${detail}`);
    return fallback;
  }
}

/**
 * Products per request. Listings ask for card fields only, so a full page
 * is cheap. Every listing follows the cursor until Shopify says there is no
 * next page, so nothing is ever cut off by a limit.
 */
const PAGE_SIZE = 100;
/** A runaway guard, not a limit anyone should reach: 100 pages of 100. */
const MAX_PAGES = 100;

async function collectPages<T>(
  fetchPage: (after: string | null) => Promise<Page<T> | null>,
): Promise<T[]> {
  const items: T[] = [];
  let after: string | null = null;
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const result = await fetchPage(after);
    if (!result) break;
    items.push(...result.nodes);
    if (!result.pageInfo.hasNextPage || !result.pageInfo.endCursor) break;
    after = result.pageInfo.endCursor;
  }
  return items;
}

/*
 * Reads are wrapped in React's cache so a page and its generateMetadata share
 * one request. Storefront calls are POSTs, which fetch does not dedupe.
 */

/** Every product published to the storefront's sales channel. */
export const getAllProducts = cache(async (): Promise<ProductSummary[]> => {
  return safe("getAllProducts", async () => {
    const raw = await collectPages<RawSummary>(async (after) => {
      const data = await storefront<{ products: Page<RawSummary> }>({
        query: GET_PRODUCTS,
        variables: { first: PAGE_SIZE, after, sortKey: "BEST_SELLING", reverse: false },
        tags: ["products"],
      });
      return data.products;
    });
    if (raw.length === 0) {
      // Not an error to Shopify, but the usual reason for an empty site.
      console.warn(
        "[shopify] getAllProducts: the storefront token sees 0 products. " +
          "Publish them to the Headless sales channel (SETUP.md step 1).",
      );
    }
    return raw.map(reshapeSummary);
  }, []);
});

export const getProduct = cache(async (handle: string): Promise<Product | null> => {
  return safe(`getProduct ${handle}`, async () => {
    const data = await storefront<{ product: RawProduct | null }>({
      query: GET_PRODUCT_BY_HANDLE,
      variables: { handle },
      tags: ["products", `product:${handle}`],
    });
    return data.product ? reshapeProduct(data.product) : null;
  }, null);
});

export type CollectionResult = {
  title: string;
  description: string;
  products: ProductSummary[];
} | null;

type RawCollection = {
  title: string;
  description: string;
  products: Page<RawSummary>;
} | null;

/**
 * A whole collection, in the order set in Shopify. Returns null when the
 * handle does not exist or the collection is not published to the
 * storefront's sales channel.
 */
export const getCollection = cache(async (handle: string): Promise<CollectionResult> => {
  return safe(`getCollection ${handle}`, async () => {
    // Held in an object because it is filled in from inside the page callback.
    const found: { meta: { title: string; description: string } | null } = { meta: null };
    const raw = await collectPages<RawSummary>(async (after) => {
      const data = await storefront<{ collection: RawCollection }>({
        query: GET_COLLECTION_PRODUCTS,
        variables: { handle, first: PAGE_SIZE, after },
        tags: ["products", `collection:${handle}`],
      });
      if (!data.collection) return null;
      found.meta ??= {
        title: data.collection.title,
        description: data.collection.description,
      };
      return data.collection.products;
    });
    if (!found.meta) return null;
    const { title, description } = found.meta;
    return { title, description, products: raw.map(reshapeSummary) };
  }, null);
});

/* -------------------------------------------------------------------------
   Cart
   Lives entirely in the Storefront API. Checkout is Shopify's hosted
   checkout, reached by redirecting to cart.checkoutUrl.
   ------------------------------------------------------------------------- */

type CartMutationPayload = {
  cart: RawCart | null;
  userErrors: Array<{ field: string[] | null; message: string }>;
};

function unwrapCart(payload: CartMutationPayload | undefined): Cart {
  if (!payload) throw new ShopifyError("Shopify returned an empty cart response.");
  if (payload.userErrors?.length) {
    throw new ShopifyError(payload.userErrors.map((e) => e.message).join(" "));
  }
  if (!payload.cart) throw new ShopifyError("Shopify returned no cart.");
  return reshapeCart(payload.cart);
}

export async function getCart(cartId: string): Promise<Cart | null> {
  return safe("getCart", async () => {
    const data = await storefront<{ cart: RawCart | null }>({
      query: GET_CART,
      variables: { id: cartId },
      revalidate: 0,
    });
    return data.cart ? reshapeCart(data.cart) : null;
  }, null);
}

export async function createCart(
  merchandiseId: string,
  quantity = 1,
): Promise<Cart> {
  const data = await storefront<{ cartCreate: CartMutationPayload }>({
    query: CREATE_CART,
    variables: {
      lines: [{ merchandiseId, quantity }],
      // US only at launch. This keeps Shopify's rates and taxes honest.
      buyerIdentity: { countryCode: "US" },
    },
    revalidate: 0,
  });
  return unwrapCart(data.cartCreate);
}

export async function addToCart(
  cartId: string,
  merchandiseId: string,
  quantity = 1,
): Promise<Cart> {
  const data = await storefront<{ cartLinesAdd: CartMutationPayload }>({
    query: ADD_CART_LINES,
    variables: { cartId, lines: [{ merchandiseId, quantity }] },
    revalidate: 0,
  });
  return unwrapCart(data.cartLinesAdd);
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<Cart> {
  const data = await storefront<{ cartLinesUpdate: CartMutationPayload }>({
    query: UPDATE_CART_LINES,
    variables: { cartId, lines: [{ id: lineId, quantity }] },
    revalidate: 0,
  });
  return unwrapCart(data.cartLinesUpdate);
}

export async function removeCartLine(
  cartId: string,
  lineId: string,
): Promise<Cart> {
  const data = await storefront<{ cartLinesRemove: CartMutationPayload }>({
    query: REMOVE_CART_LINES,
    variables: { cartId, lineIds: [lineId] },
    revalidate: 0,
  });
  return unwrapCart(data.cartLinesRemove);
}
