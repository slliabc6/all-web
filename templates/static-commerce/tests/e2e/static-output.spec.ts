import { expect, test } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";

const outputRoot = path.resolve("exports", "现代极简零售", "网站成品");

test("static homepage loads local images without network requests", async ({ page }) => {
  const networkRequests: string[] = [];
  page.on("request", (request) => {
    if (/^https?:/.test(request.url())) networkRequests.push(request.url());
  });
  await page.goto(pathToFileURL(path.join(outputRoot, "index.html")).href);
  await expect(page.getByRole("heading", { level: 1, name: "Still Form" })).toBeVisible();
  const images = page.locator("img");
  await expect(images.first()).toBeVisible();
  expect(await images.evaluateAll((nodes) => nodes.every((node) => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0))).toBe(true);
  expect(networkRequests).toEqual([]);
});

test("static links, search and cart work across nested pages", async ({ page }, testInfo) => {
  await page.goto(pathToFileURL(path.join(outputRoot, "index.html")).href);
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open menu" }).click();
  }
  await page.getByRole("link", { name: "Shop" }).first().click();
  await expect(page).toHaveURL(/shop\.html$/);
  await page.getByRole("link", { name: "Linen tray" }).first().click();
  await expect(page).toHaveURL(/products\/linen-tray\.html$/);
  await page.getByRole("button", { name: "Add to cart" }).click();
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open menu" }).click();
  }
  await page.getByRole("link", { name: /Cart/ }).click();
  await expect(page.getByRole("heading", { name: "Linen tray" })).toBeVisible();

  await page.goto(pathToFileURL(path.join(outputRoot, "search.html")).href);
  await page.getByRole("searchbox", { name: "Search products" }).fill("basket");
  await expect(page.locator("[data-search-result]:visible")).toHaveCount(1);
});
