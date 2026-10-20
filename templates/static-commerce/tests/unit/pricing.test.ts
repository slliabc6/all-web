import { describe, expect, it } from "vitest";
import { formatProductPrice } from "../../src/domain/pricing";
import type { Product } from "../../src/domain/types";

const currency = { code: "USD", symbol: "$" };
const base: Product = {
  id: "item",
  slug: "item",
  sku: "ITEM",
  name: { en: "Item" },
  description: { en: "Description" },
  categoryIds: ["home"],
  tags: [],
  images: [{ src: "assets/item.svg", alt: { en: "Item" }, width: 800, height: 800 }],
  priceMode: "fixed",
  price: 29,
  inventoryStatus: "in-stock",
  relatedProductIds: []
};

describe("formatProductPrice", () => {
  it("formats a fixed price and original price", () => {
    const result = formatProductPrice({ ...base, price: 29, originalPrice: 39 }, currency);
    expect(result).toEqual({ kind: "fixed", primary: "$29.00", original: "$39.00" });
  });

  it("formats sorted wholesale tiers", () => {
    const result = formatProductPrice({
      ...base,
      priceMode: "tiered",
      price: undefined,
      priceTiers: [
        { minQuantity: 50, unitPrice: 10 },
        { minQuantity: 10, unitPrice: 12 }
      ]
    }, currency);

    expect(result.primary).toBe("From $10.00");
    expect(result.tiers).toEqual([
      { minQuantity: 10, label: "10+", unitPrice: "$12.00" },
      { minQuantity: 50, label: "50+", unitPrice: "$10.00" }
    ]);
  });

  it("does not invent a numeric price for inquiry products", () => {
    expect(formatProductPrice({ ...base, priceMode: "inquiry", price: undefined }, currency)).toEqual({
      kind: "inquiry",
      primary: "Request a quote"
    });
  });
});
