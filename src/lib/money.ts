import type { Money } from "@/lib/shopify/types";

const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(currency: string): Intl.NumberFormat {
  let formatter = formatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    });
    formatters.set(currency, formatter);
  }
  return formatter;
}

export function formatMoney(money: Money | null | undefined): string {
  if (!money) return "";
  const value = Number(money.amount);
  if (!Number.isFinite(value)) return "";
  return formatterFor(money.currencyCode || "USD").format(value);
}
