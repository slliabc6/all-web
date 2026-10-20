import { describe, expect, it } from "vitest";
import { CartStore } from "../../src/domain/cart";
import { buildInquiryText, buildMailtoUrl } from "../../src/domain/inquiry";

const site = {
  id: "demo",
  contact: { email: "sales@example.com" },
  currency: { code: "USD", symbol: "$" }
};

describe("inquiry output", () => {
  it("includes products, options, quantities and known totals", () => {
    const store = new CartStore("demo");
    store.add({
      productId: "tray",
      sku: "TRAY-01",
      name: "Linen tray",
      quantity: 2,
      selectedOptions: { Color: "Olive" },
      priceMode: "fixed",
      price: 29
    });

    const text = buildInquiryText(store.load(), site);
    expect(text).toContain("Linen tray (TRAY-01)");
    expect(text).toContain("Color: Olive");
    expect(text).toContain("Quantity: 2");
    expect(text).toContain("Known total: $58.00 USD");
  });

  it("marks quote-only items without inventing a total", () => {
    const store = new CartStore("demo");
    store.add({ productId: "lamp", sku: "LAMP", name: "Lamp", quantity: 1, selectedOptions: {}, priceMode: "inquiry" });
    const text = buildInquiryText(store.load(), site);
    expect(text).toContain("Price: Request a quote");
    expect(text).not.toContain("Known total:");
  });

  it("builds an encoded mail draft URL", () => {
    const url = buildMailtoUrl("Line one\nLine & two", site);
    expect(url).toBe("mailto:sales@example.com?subject=Product%20enquiry&body=Line%20one%0ALine%20%26%20two");
  });
});
