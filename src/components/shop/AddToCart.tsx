"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { addItemAction } from "@/lib/actions";
import { EMPTY_ACTION_STATE } from "@/lib/action-state";
import { formatMoney } from "@/lib/money";
import type { Product, ProductVariant } from "@/lib/shopify/types";

function optionKey(options: { name: string; value: string }[]): string {
  return [...options]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((option) => `${option.name}:${option.value}`)
    .join("|");
}

function SubmitButton({ disabled, label }: { disabled: boolean; label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-solid w-full"
      disabled={disabled || pending}
    >
      {pending ? "Adding" : label}
    </button>
  );
}

export default function AddToCart({ product }: { product: Product }) {
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    // Start on the first variant that can actually be bought.
    const firstAvailable =
      product.variants.find((variant) => variant.availableForSale) ??
      product.variants[0];
    const initial: Record<string, string> = {};
    for (const option of firstAvailable?.selectedOptions ?? []) {
      initial[option.name] = option.value;
    }
    return initial;
  });

  const [state, formAction] = useActionState(addItemAction, EMPTY_ACTION_STATE);

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

      <form action={formAction} className="mt-10">
        <input type="hidden" name="variantId" value={activeVariant?.id ?? ""} />
        <input type="hidden" name="quantity" value="1" />

        {product.options.map((option) => (
          <fieldset key={option.id} className="mb-8">
            <legend className="eyebrow mb-4">{option.name}</legend>
            <div className="flex flex-wrap gap-2.5">
              {option.values.map((value) => {
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
                    className={`min-w-[52px] border px-4 py-2.5 text-[10px] uppercase tracking-[0.22em] transition-colors duration-400 ${
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

        <SubmitButton
          disabled={!activeVariant || soldOut}
          label={soldOut ? "Sold out" : "Add to bag"}
        />
      </form>

      {state.message ? (
        <p
          className={`mt-5 text-[12px] ${state.ok ? "text-[color:var(--bone-dim)]" : "text-accent"}`}
          role="status"
        >
          {state.message}{" "}
          {state.ok ? (
            <Link href="/cart" className="link-quiet text-bone">
              View bag
            </Link>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
