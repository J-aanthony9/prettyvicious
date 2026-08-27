"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  addToCart,
  createCart,
  removeCartLine,
  updateCartLine,
} from "@/lib/shopify";
import { clearCartId, readCart, readCartId, writeCartId } from "@/lib/cart-session";
import { CLUB } from "@/lib/brand";
import type { ActionState } from "@/lib/action-state";

/* -------------------------------------------------------------------------
   Cart
   ------------------------------------------------------------------------- */

export async function addItemAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const merchandiseId = String(formData.get("variantId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1) || 1;

  if (!merchandiseId) {
    return { ok: false, message: "Pick a size first." };
  }

  try {
    const existingId = await readCartId();
    if (existingId) {
      const cart = await addToCart(existingId, merchandiseId, quantity).catch(
        async () => {
          // The stored cart is gone (completed or expired). Start a new one.
          const fresh = await createCart(merchandiseId, quantity);
          await writeCartId(fresh.id);
          return fresh;
        },
      );
      await writeCartId(cart.id);
    } else {
      const cart = await createCart(merchandiseId, quantity);
      await writeCartId(cart.id);
    }
  } catch (error) {
    console.error("[cart:add]", error);
    return { ok: false, message: "We couldn't add that. Try again in a moment." };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Added to bag." };
}

export async function updateItemAction(formData: FormData): Promise<void> {
  const lineId = String(formData.get("lineId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  const cartId = await readCartId();
  if (!cartId || !lineId) return;

  try {
    if (quantity <= 0) {
      await removeCartLine(cartId, lineId);
    } else {
      await updateCartLine(cartId, lineId, quantity);
    }
  } catch (error) {
    console.error("[cart:update]", error);
  }

  revalidatePath("/", "layout");
}

export async function removeItemAction(formData: FormData): Promise<void> {
  const lineId = String(formData.get("lineId") ?? "");
  const cartId = await readCartId();
  if (!cartId || !lineId) return;

  try {
    await removeCartLine(cartId, lineId);
  } catch (error) {
    console.error("[cart:remove]", error);
  }

  revalidatePath("/", "layout");
}

/**
 * Hands the shopper to Shopify's hosted checkout. We never build a custom
 * checkout, we just follow cart.checkoutUrl.
 */
export async function checkoutAction(): Promise<void> {
  const cart = await readCart();
  if (!cart || !cart.checkoutUrl || cart.totalQuantity === 0) {
    if (cart && cart.totalQuantity === 0) await clearCartId();
    redirect("/cart");
  }
  redirect(cart.checkoutUrl);
}

/* -------------------------------------------------------------------------
   Club signup
   ------------------------------------------------------------------------- */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function joinClubAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  // Honeypot. Real people leave this empty.
  if (String(formData.get("company") ?? "")) {
    return { ok: true, message: CLUB.success };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, message: "That address doesn't look right." };
  }

  const webhook = process.env.CLUB_SIGNUP_WEBHOOK_URL;
  if (!webhook) {
    // No list connected yet. Recorded in the logs so nothing is silently lost.
    console.info("[club:signup]", email);
    return { ok: true, message: CLUB.success };
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "prettyvicious.com/#club" }),
    });
    if (!response.ok) throw new Error(`Signup webhook responded ${response.status}`);
  } catch (error) {
    console.error("[club:signup]", error);
    return { ok: false, message: "Something went wrong. Try again in a moment." };
  }

  return { ok: true, message: CLUB.success };
}
