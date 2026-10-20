import { describe, expect, it } from "vitest";
import { filterProducts } from "../../src/domain/search";
import type { Product } from "../../src/domain/types";

const products = [
  { id: "tray", sku: "TRAY-01", name: { en: "Linen tray", zh: "亚麻托盘" }, description: { en: "Table organizer" }, categoryIds: ["home"], tags: ["new"] },
  { id: "basket", sku: "BASKET-02", name: { en: "Woven basket", zh: "编织篮" }, description: { en: "Natural storage" }, categoryIds: ["home"], tags: ["wholesale"] },
  { id: "scarf", sku: "SCARF-03", name: { en: "Silk scarf", zh: "丝巾" }, description: { en: "Light accessory" }, categoryIds: ["fashion"], tags: ["new"] }
] as Product[];

describe("filterProducts", () => {
  it("returns all products for an empty query", () => {
    expect(filterProducts(products, {})).toHaveLength(3);
  });

  it.each(["basket", "BASKET-02", "编织", "natural"])("searches names, SKU and descriptions for %s", (term) => {
    expect(filterProducts(products, { term }).map((product) => product.id)).toEqual(["basket"]);
  });

  it("combines category and tag filters", () => {
    expect(filterProducts(products, { categoryId: "home", tags: ["new"] }).map((product) => product.id)).toEqual(["tray"]);
  });

  it("returns an empty collection when nothing matches", () => {
    expect(filterProducts(products, { term: "missing" })).toEqual([]);
  });
});
