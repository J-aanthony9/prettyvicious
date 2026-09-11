"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { addItemAction } from "@/lib/actions";
import { EMPTY_ACTION_STATE } from "@/lib/action-state";
import { formatMoney } from "@/lib/money";
import type { Product, ProductVariant } from "@/lib/shopify/types";
import { isSizeOption, sortSizes } from "@/lib/sizes";
import { useCartDrawer } from "@/components/cart/CartDrawerProvider";
import Portal from "@/components/Portal";

const FORM_ID = "add-to-bag";

function optionKey(options: { name: string; value: string }[]): string {
  return [...options]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((option) => `${option.name}:${option.value}`)
    .join("|");
}

/**
 * Watches the real form. When it has scrolled up out of view, the sticky bar
 * on phones takes over. Both buttons submit the same form.
 */
function useFormScrolledAway(ref: React.RefObject<HTMLFormElement | null>): boolean {
  const [away, setAway] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setAway(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return away;
}

export default function AddToCart({ product }: { product: Product }) {
  const { openDrawer } = useCartDrawer();
  const formRef = useRef<HTMLFormElement>(null);
  const showBar = useFormScrolledAway(formRef);

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    // Start on the first variant that can actually be bought, reading sizes
    // in the order they are shown rather than the order Shopify created
    // them, so the highlighted chip is the first available one on screen.
    const sizeOrder = (variant: ProductVariant): number => {
      const size = variant.selectedOptions.find((option) => isSizeOption(option.name));
      if (!size) return 0;
      const option = product.options.find((candidate) => isSizeOption(candidate.name));
      const index = option ? sortSizes(option.values).indexOf(size.value) : -1;
      return index === -1 ? Number.POSITIVE_INFINITY : index;
    };
    const byDisplayOrder = [...product.variants].sort((a, b) => sizeOrder(a) - sizeOrder(b));
    const firstAvailable =
      byDisplayOrder.find((variant) => variant.availableForSale) ?? byDisplayOrder[0];
    const initial: Record<string, string> = {};
    for (const option of firstAvailable?.selectedOptions ?? []) {
      initial[option.name] = option.value;
    }
    return initial;
  });

  const [state, formAction, pending] = useActionState(addItemAction, EMPTY_ACTION_STATE);

  // A successful add is confirmed by the drawer sliding in, not by a message.
  useEffect(() => {
    if (state.ok) openDrawer();
  }, [state, openDrawer]);

  const variantsByKey = useMemo(() => {
    const map = new Map<string, ProductVariant>();
    for (const variant of product.variants) {
      map.set(optionKey(variant.selectedOptions), variant);
    }
    return map;
  }, [product.variants]);

  const activeVariant = useMemo(() => {
    const key = optionKey(
      product.options.map((option) => ({
        name: option.name,
        value: selected[option.name] ?? "",
      })),
    );
    return variantsByKey.get(key) ?? null;
  }, [product.options, selected, variantsByKey]);

  const price = activeVariant?.price ?? product.priceRange.minVariantPrice;
  const soldOut = activeVariant ? !activeVariant.availableForSale : true;
  const disabled = !activeVariant || soldOut || pending;
  const label = pending ? "Adding" : soldOut ? "Sold out" : "Add to bag";
  const sizeOption = product.options.find((option) => isSizeOption(option.name));
  const selectedSize = sizeOption ? selected[sizeOption.name] : undefined;

  /** True when picking this value leads to a variant that is in stock. */
  const isValueAvailable = (optionName: string, value: string): boolean => {
    const key = optionKey(
      product.options.map((option) => ({
        name: option.name,
        value: option.name === optionName ? value : (selected[option.name] ?? ""),
      })),
    );
    return variantsByKey.get(key)?.availableForSale ?? false;
  };

  return (
    <div>
      <p className="display mt-3 text-[17px] tracking-[0.06em] text-[color:var(--bone-dim)]">
        {formatMoney(price)}
      </p>

      <form id={FORM_ID} ref={formRef} action={formAction} className="mt-10">
        <input type="hidden" name="variantId" value={activeVariant?.id ?? ""} />
        <input type="hidden" name="quantity" value="1" />

        {product.options.map((option) => (
          <fieldset key={option.id} className="mb-8">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <legend className="eyebrow">{option.name}</legend>
              {isSizeOption(option.name) ? (
                <Link
                  href="/size-guide"
                  className="link-quiet text-[11px] uppercase tracking-[0.2em]"
                >
                  Size guide
                </Link>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {(isSizeOption(option.name) ? sortSizes(option.values) : option.values).map((value) => {
                const isSelected = selected[option.name] === value;
                const available = isValueAvailable(option.name, value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setSelected((current) => ({
                        ...current,
                        [option.name]: value,
                      }))
                    }
                    aria-pressed={isSelected}
                    title={available ? value : `${value} is sold out`}
                    className={`min-w-[52px] border px-4 py-2.5 text-[11px] uppercase tracking-[0.22em] transition-colors duration-400 ${
                      isSelected
                        ? "border-[color:var(--color-accent)] bg-[rgba(166,110,122,0.14)] text-bone"
                        : "border-[color:var(--hairline)] text-[color:var(--bone-dim)] hover:border-[color:var(--color-accent-deep)]"
                    } ${available ? "" : "opacity-40 line-through"}`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

        <button type="submit" className="btn btn-solid w-full" disabled={disabled}>
          {label}
        </button>
      </form>

      {/* Screen readers hear the result; sighted users see the drawer. */}
      <p className="sr-only" role="status">
        {state.ok ? state.message : ""}
      </p>
      {!state.ok && state.message ? (
        <p className="mt-5 text-[14px] text-accent" role="alert">
          {state.message}
        </p>
      ) : null}

      {/* Phone only. Pins the buy action once the form has scrolled away.
          Portalled so the footer cannot paint over it. */}
      <Portal>
      <div
        aria-hidden={!showBar}
        className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 md:hidden ${
          showBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center gap-4 border-t border-[color:var(--hairline)] bg-ink/95 px-5 py-3 backdrop-blur-md">
          <div className="min-w-0">
            <p className="display text-[15px] tracking-[0.06em]">{formatMoney(price)}</p>
            {selectedSize ? (
              <p className="truncate text-[11px] uppercase tracking-[0.2em] text-[color:var(--bone-dim)]">
                Size {selectedSize}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            form={FORM_ID}
            className="btn btn-solid flex-1"
            disabled={disabled}
            tabIndex={showBar ? 0 : -1}
          >
            {label}
          </button>
        </div>
      </div>
      </Portal>
    </div>
  );
}
