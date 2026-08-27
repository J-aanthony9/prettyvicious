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
import type { Cart, Product } from "./types";

export { isStorefrontConfigured, ShopifyError };
export * from "./types";

type Connection<T> = { nodes: T[] };

type RawProduct = Omit<Product, "images" | "variants"> & {
  images: Connection<Product["images"][number]>;
  variants: Connection<Product["variants"][number]>;
};

type RawCart = Omit<Cart, "lines"> & {
  lines: Connection<Cart["lines"][number]>;
};

function reshapeProduct(raw: RawProduct): Product {
  return {
    ...raw,
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
async function safe<T>(work: () => Promise<T>, fallback: T): Promise<T> {
  if (!isStorefrontConfigured()) return fallback;
  try {
    return await work();
  } catch (error) {
    console.error("[shopify]", error);
    return fallback;
  }
}

export async function getProducts(first = 24): Promise<Product[]> {
  return safe(async () => {
    const data = await storefront<{ products: Connection<RawProduct> }>({
      query: GET_PRODUCTS,
      variables: { first, sortKey: "BEST_SELLING", reverse: false },
      tags: ["products"],
    });
    return data.products.nodes.map(reshapeProduct);
  }, []);
}

export async function getProduct(handle: string): Promise<Product | null> {
  return safe(async () => {
    const data = await storefront<{ product: RawProduct | null }>({
      query: GET_PRODUCT_BY_HANDLE,
      variables: { handle },
      tags: ["products", `product:${handle}`],
    });
    return data.product ? reshapeProduct(data.product) : null;
  }, null);
}

export type CollectionResult = {
  title: string;
  description: string;
  products: Product[];
} | null;

export async function getCollection(
  handle: string,
  first = 24,
): Promise<CollectionResult> {
  return safe(async () => {
    const data = await storefront<{
      collection: {
        title: string;
        description: string;
        products: Connection<RawProduct>;
      } | null;
    }>({
      query: GET_COLLECTION_PRODUCTS,
      variables: { handle, first },
      tags: ["products", `collection:${handle}`],
    });
    if (!data.collection) return null;
    return {
      title: data.collection.title,
      description: data.collection.description,
      products: data.collection.products.nodes.map(reshapeProduct),
    };
  }, null);
}

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
  return safe(async () => {
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
