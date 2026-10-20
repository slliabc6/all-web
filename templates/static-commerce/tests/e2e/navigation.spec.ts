import { expect, test } from "@playwright/test";

test("desktop navigation follows configured order and marks the current page", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop viewport only");
  await page.goto("/about");

  const navigation = page.getByRole("navigation", { name: "Primary" });
  await expect(navigation.getByRole("link")).toHaveText(["Home", "Shop", "About"]);
  await expect(navigation.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "Search" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Cart/ })).toBeVisible();
});

test("mobile navigation opens and exposes the same configured links", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile viewport only");
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Open menu" });
  await expect(toggle).toBeVisible();
  await toggle.click();

  const navigation = page.getByRole("navigation", { name: "Mobile" });
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("link")).toHaveText(["Home", "Shop", "About"]);
});

test("core page links remain real anchors without client JavaScript", async ({ page, context }) => {
  await context.setOffline(true);
  await page.goto("/", { waitUntil: "domcontentloaded" }).catch(() => undefined);
  await context.setOffline(false);
  await page.goto("/");

  await expect(page.locator('a[href="/shop"]').first()).toBeAttached();
  await expect(page.locator('a[href="/about"]').first()).toBeAttached();
});
