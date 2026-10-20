import type { CurrencyConfig, Product } from "./types";

export interface PricePresentation {
  kind: Product["priceMode"];
  primary: string;
  original?: string;
  tiers?: Array<{ minQuantity: number; label: string; unitPrice: string }>;
}

function money(value: number, currency: CurrencyConfig) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatProductPrice(product: Product, currency: CurrencyConfig): PricePresentation {
  if (product.priceMode === "inquiry") {
    return { kind: "inquiry", primary: "Request a quote" };
  }

  if (product.priceMode === "tiered") {
    const tiers = [...(product.priceTiers ?? [])]
      .sort((left, right) => left.minQuantity - right.minQuantity)
      .map((tier) => ({
        minQuantity: tier.minQuantity,
        label: `${tier.minQuantity}+`,
        unitPrice: money(tier.unitPrice, currency)
      }));
    const lowest = Math.min(...(product.priceTiers ?? []).map((tier) => tier.unitPrice));
    return { kind: "tiered", primary: `From ${money(lowest, currency)}`, tiers };
  }

  return {
    kind: "fixed",
    primary: money(product.price ?? 0, currency),
    ...(product.originalPrice === undefined ? {} : { original: money(product.originalPrice, currency) })
  };
}
