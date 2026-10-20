import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("adds a configured product, persists it and updates quantity", async ({ page }) => {
  await page.goto("/products/linen-tray");
  await page.getByLabel("Olive").check();
  await page.getByLabel("Quantity").fill("2");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.locator("[data-cart-count]").first()).toHaveText("2");

  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Linen tray" })).toBeVisible();
  await expect(page.getByText("Color: Olive")).toBeVisible();
  const quantity = page.getByLabel("Quantity for Linen tray");
  await expect(quantity).toHaveValue("2");
  await quantity.fill("3");
  await quantity.blur();
  await expect(page.getByText("$87.00 USD")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Quantity for Linen tray")).toHaveValue("3");
});

test("creates copy and email enquiry actions without claiming submission", async ({ page }) => {
  await page.goto("/products/brass-lamp");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/cart");

  await expect(page.getByRole("article").getByText("Quoted separately")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open email draft" })).toHaveAttribute("href", /mailto:sales@example.com/);
  await expect(page.getByText("You still need to send the email from your mail app.")).toBeVisible();
  await expect(page.getByText(/order submitted|payment successful|email sent/i)).toHaveCount(0);
});

test("removes a cart line", async ({ page }) => {
  await page.goto("/products/linen-tray");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/cart");
  await page.getByRole("button", { name: "Remove Linen tray" }).click();
  await expect(page.getByText("Your cart is empty.")).toBeVisible();
});

test("keeps the cart count across non-product pages", async ({ page }) => {
  await page.goto("/products/linen-tray");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/about");
  await expect(page.locator("[data-cart-count]").first()).toHaveText("1");
});
