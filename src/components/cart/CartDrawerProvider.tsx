"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Cart } from "@/lib/shopify/types";

type CartDrawerContextValue = {
  cart: Cart | null;
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

/**
 * Holds the cart the server layout fetched, plus whether the drawer is
 * showing. Cart server actions call revalidatePath on the layout, so after
 * any add, update or remove the layout re-renders and the cart prop here is
 * fresh. The open flag is client state, so it survives that refresh.
 */
export function CartDrawerProvider({
  cart,
  children,
}: {
  cart: Cart | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  const value = useMemo(
    () => ({ cart, open, openDrawer, closeDrawer }),
    [cart, open, openDrawer, closeDrawer],
  );
  return <CartDrawerContext.Provider value={value}>{children}</CartDrawerContext.Provider>;
}

export function useCartDrawer(): CartDrawerContextValue {
  const context = useContext(CartDrawerContext);
  if (!context) throw new Error("useCartDrawer must be used inside CartDrawerProvider");
  return context;
}
