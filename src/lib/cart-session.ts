import "server-only";
import { cookies } from "next/headers";
import { getCart } from "@/lib/shopify";
import type { Cart } from "@/lib/shopify/types";

const CART_COOKIE = "pv_cart";
const CART_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function readCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

export async function writeCartId(cartId: string): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_MAX_AGE,
  });
}

export async function clearCartId(): Promise<void> {
  const store = await cookies();
  store.delete(CART_COOKIE);
}

/**
 * Returns the live cart, or null when there is no cart yet. A cart id that
 * Shopify no longer recognises (completed or expired) resolves to null so
 * the next add to cart starts a fresh one.
 */
export async function readCart(): Promise<Cart | null> {
  const cartId = await readCartId();
  if (!cartId) return null;
  return getCart(cartId);
}
