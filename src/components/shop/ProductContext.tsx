"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Product, ProductVariant } from "@/lib/shopify/types";
import {
  defaultVariant,
  findVariant,
  selectValue,
  selectionOf,
  type Selection,
} from "@/lib/product";

type ProductState = {
  product: Product;
  selection: Selection;
  /** Null when the chosen combination does not exist in Shopify. */
  variant: ProductVariant | null;
  choose: (optionName: string, value: string) => void;
};

const ProductContext = createContext<ProductState | null>(null);

/**
 * The one place the chosen options live, so the gallery, the pickers and
 * the add to bag button always agree on which variant is selected.
 */
export function ProductProvider({
  product,
  children,
}: {
  product: Product;
  children: React.ReactNode;
}) {
  const [selection, setSelection] = useState<Selection>(() => {
    const initial = defaultVariant(product);
    return initial ? selectionOf(initial) : {};
  });

  const state = useMemo<ProductState>(
    () => ({
      product,
      selection,
      variant: findVariant(product, selection),
      choose: (optionName, value) =>
        setSelection((current) => selectValue(product, current, optionName, value)),
    }),
    [product, selection],
  );

  return <ProductContext.Provider value={state}>{children}</ProductContext.Provider>;
}

export function useProduct(): ProductState {
  const state = useContext(ProductContext);
  if (!state) throw new Error("useProduct must be used inside ProductProvider");
  return state;
}
