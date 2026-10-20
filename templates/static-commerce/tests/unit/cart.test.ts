import { describe, expect, it, vi } from "vitest";
import { CartStore, calculateCartSummary } from "../../src/domain/cart";
import type { CartLineInput, StorageLike } from "../../src/domain/cart";

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

const fixedItem: CartLineInput = {
  productId: "tray",
  sku: "TRAY-01",
  name: "Linen tray",
  quantity: 2,
  selectedOptions: { color: "Sand" },
  priceMode: "fixed",
  price: 29
};

describe("CartStore", () => {
  it("merges identical options and keeps different options separate", () => {
    const store = new CartStore("demo", new MemoryStorage());
    store.add(fixedItem);
    store.add({ ...fixedItem, quantity: 1 });
    store.add({ ...fixedItem, quantity: 1, selectedOptions: { color: "Olive" } });

    expect(store.load().lines.map((line) => line.quantity)).toEqual([3, 1]);
  });

  it("updates, removes and clears cart lines", () => {
    const store = new CartStore("demo", new MemoryStorage());
    store.add(fixedItem);
    const [line] = store.load().lines;
    store.update(line.lineId, 5);
    expect(store.load().lines[0].quantity).toBe(5);
    store.remove(line.lineId);
    expect(store.load().lines).toEqual([]);
    store.add(fixedItem);
    store.clear();
    expect(store.load().lines).toEqual([]);
  });

  it("recovers from damaged or old local data", () => {
    const storage = new MemoryStorage();
    storage.setItem("all-web-cart:v1:demo", "not-json");
    const store = new CartStore("demo", storage);
    expect(store.load()).toEqual({ version: 1, siteId: "demo", lines: [] });
    expect(storage.getItem("all-web-cart:v1:demo")).toBeNull();
  });

  it("notifies subscribers after changes", () => {
    const store = new CartStore("demo", new MemoryStorage());
    const listener = vi.fn();
    store.subscribe(listener);
    store.add(fixedItem);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ lines: [expect.objectContaining({ quantity: 2 })] }));
  });
});

describe("calculateCartSummary", () => {
  it("calculates fixed and quantity-dependent tier prices", () => {
    const store = new CartStore("demo", new MemoryStorage());
    store.add(fixedItem);
    store.add({
      productId: "basket",
      sku: "BASKET",
      name: "Woven basket",
      quantity: 50,
      selectedOptions: {},
      priceMode: "tiered",
      priceTiers: [{ minQuantity: 10, unitPrice: 12 }, { minQuantity: 50, unitPrice: 10 }]
    });

    expect(calculateCartSummary(store.load())).toEqual({ knownTotal: 558, hasInquiryItems: false });
  });

  it("keeps inquiry items out of numeric totals", () => {
    const store = new CartStore("demo", new MemoryStorage());
    store.add({ productId: "lamp", sku: "LAMP", name: "Lamp", quantity: 1, selectedOptions: {}, priceMode: "inquiry" });
    expect(calculateCartSummary(store.load())).toEqual({ knownTotal: 0, hasInquiryItems: true });
  });
});
