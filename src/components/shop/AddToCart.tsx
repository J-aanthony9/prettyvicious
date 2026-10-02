"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addItemAction } from "@/lib/actions";
import { EMPTY_ACTION_STATE } from "@/lib/action-state";
import { formatMoney } from "@/lib/money";
import { useProduct } from "@/components/shop/ProductContext";
import {
  optionHasImages,
  optionLabel,
  swatchImage,
  valueState,
  type ValueState,
} from "@/lib/product";
import { isSizeOption, sortSizes } from "@/lib/sizes";

function SubmitButton({ disabled, label }: { disabled: boolean; label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-solid w-full" disabled={disabled || pending}>
      {pending ? "Adding" : label}
    </button>
  );
}

/** Shared look for every pickable value, so chips and swatches read as one system. */
function stateClasses(selected: boolean, state: ValueState): string {
  const base = selected
    ? "border-[color:var(--color-accent)] bg-[rgba(166,110,122,0.14)] text-bone"
    : "border-[color:var(--hairline)] text-[color:var(--bone-dim)] hover:border-[color:var(--color-accent-deep)]";
  if (state === "unavailable") return `${base} cursor-not-allowed opacity-30`;
  if (state === "unavailable-here") return `${base} opacity-45`;
  return base;
}

function stateTitle(value: string, state: ValueState): string {
  if (state === "unavailable") return `${value} is sold out`;
  if (state === "unavailable-here") return `${value} is not available with your other choices`;
  return value;
}

export default function AddToCart({ sizeGuideHref }: { sizeGuideHref: string }) {
  const { product, selection, variant, choose } = useProduct();
  const [state, formAction] = useActionState(addItemAction, EMPTY_ACTION_STATE);

  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const buyable = Boolean(variant?.availableForSale);
  const buttonLabel = !variant ? "Unavailable" : buyable ? "Add to bag" : "Sold out";

  return (
    <div>
      <p className="display mt-3 text-[17px] tracking-[0.06em] text-[color:var(--bone-dim)]">
        {formatMoney(price)}
      </p>

      <form action={formAction} className="mt-10">
        <input type="hidden" name="variantId" value={variant?.id ?? ""} />
        <input type="hidden" name="quantity" value="1" />

        {product.options.map((option) => {
          const label = optionLabel(option.name, product.title);
          const chosen = selection[option.name];

          // Nothing to choose: say what it is and move on.
          if (option.values.length < 2) {
            return (
              <p key={option.id} className="mb-8 flex items-baseline gap-3">
                <span className="eyebrow">{label}</span>
                <span className="text-[13px] text-bone">{option.values[0]}</span>
              </p>
            );
          }

          const size = isSizeOption(option.name);
          const values = size ? sortSizes(option.values) : option.values;
          const withImages = !size && optionHasImages(product, option);

          return (
            <fieldset key={option.id} className="mb-8 min-w-0">
              <legend className="sr-only">{label}</legend>
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <p aria-hidden="true" className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="eyebrow">{label}</span>
                  {chosen ? <span className="text-[13px] text-bone">{chosen}</span> : null}
                </p>
                {size ? (
                  <Link
                    href={sizeGuideHref}
                    className="link-quiet shrink-0 py-1 text-[11px] uppercase tracking-[0.2em]"
                  >
                    Size guide
                  </Link>
                ) : null}
              </div>

              {withImages ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-2.5">
                  {values.map((value) => {
                    const selected = chosen === value;
                    const status = valueState(product, selection, option.name, value);
                    const image = swatchImage(product, option.name, value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => choose(option.name, value)}
                        disabled={status === "unavailable"}
                        aria-pressed={selected}
                        title={stateTitle(value, status)}
                        className={`flex flex-col items-stretch gap-2 border p-1.5 text-left transition-colors duration-300 ${stateClasses(selected, status)}`}
                      >
                        <span className="relative block aspect-square w-full overflow-hidden bg-white">
                          {image ? (
                            <Image
                              src={image.url}
                              alt=""
                              fill
                              sizes="96px"
                              className="object-contain"
                            />
                          ) : null}
                        </span>
                        <span
                          className={`px-0.5 pb-0.5 text-[10px] font-semibold uppercase leading-[1.35] tracking-[0.14em] ${
                            status === "available" ? "" : "line-through"
                          }`}
                        >
                          {value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {values.map((value) => {
                    const selected = chosen === value;
                    const status = valueState(product, selection, option.name, value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => choose(option.name, value)}
                        disabled={status === "unavailable"}
                        aria-pressed={selected}
                        title={stateTitle(value, status)}
                        className={`min-h-[44px] min-w-[52px] border px-4 py-2.5 text-[11px] uppercase tracking-[0.22em] transition-colors duration-300 ${stateClasses(selected, status)} ${
                          status === "available" ? "" : "line-through"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              )}
            </fieldset>
          );
        })}

        <SubmitButton disabled={!buyable} label={buttonLabel} />
      </form>

      {state.message ? (
        <p
          className={`mt-5 text-[14px] ${state.ok ? "text-[color:var(--bone-dim)]" : "text-accent"}`}
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
