import { expect, test } from "@playwright/test";

test("catalog renders all price modes from shared product data", async ({ page }) => {
  await page.goto("/shop");
  const cards = page.locator("[data-product-card]");
  await expect(cards).toHaveCount(3);
  await expect(cards.filter({ hasText: "Linen tray" })).toContainText("$29.00");
  await expect(cards.filter({ hasText: "Woven basket" })).toContainText("From $10.00");
  await expect(cards.filter({ hasText: "Brass lamp" })).toContainText("Request a quote");
});

test("product detail renders gallery, options and related products", async ({ page }) => {
  await page.goto("/products/linen-tray");
  await expect(page.getByRole("heading", { level: 1, name: "Linen tray" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Color" })).toBeVisible();
  await expect(page.locator("[data-product-gallery] img")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Related products" })).toBeVisible();
});

test("search filters the embedded catalog without a server request", async ({ page }) => {
  await page.goto("/search");
  const input = page.getByRole("searchbox", { name: "Search products" });
  await input.fill("basket");
  await expect(page.locator("[data-search-result]:visible")).toHaveCount(1);
  await expect(page.locator("[data-search-result]:visible")).toContainText("Woven basket");

  await input.fill("not-a-product");
  await expect(page.getByText("No products found.")).toBeVisible();
});
