import { expect, test } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";

const outputRoot = path.resolve("exports", "现代极简零售", "网站成品");

test("static homepage loads local images without network requests", async ({ page }) => {
  const networkRequests: string[] = [];
  const failedLocalRequests: string[] = [];
  page.on("request", (request) => {
    if (/^https?:/.test(request.url())) networkRequests.push(request.url());
  });
  page.on("requestfailed", (request) => {
    if (request.url().startsWith("file:")) failedLocalRequests.push(request.url());
  });
  await page.goto(pathToFileURL(path.join(outputRoot, "index.html")).href);
  await expect(page.getByRole("heading", { level: 1, name: "Objects made slowly, for rooms lived in." })).toBeVisible();
  await expect(page.locator('[data-section="hero"][data-variant="room-story"] img')).toBeVisible();
  await expect(page.locator('[data-section="brand-story"][data-variant="workshop"] img')).toBeVisible();
  const images = page.locator("img");
  await expect(images.first()).toBeVisible();
  for (let index = 0; index < await images.count(); index += 1) {
    await images.nth(index).scrollIntoViewIfNeeded();
  }
  await expect.poll(() => images.evaluateAll((nodes) => nodes.every((node) => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0))).toBe(true);
  expect(networkRequests).toEqual([]);
  expect(failedLocalRequests).toEqual([]);
});

test("static links, search and cart work across nested pages", async ({ page }, testInfo) => {
  await page.goto(pathToFileURL(path.join(outputRoot, "index.html")).href);
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open menu" }).click();
  }
  await page.getByRole("link", { name: "Shop" }).first().click();
  await expect(page).toHaveURL(/shop\.html$/);
  await page.getByRole("link", { name: "Fold Sofa" }).first().click();
  await expect(page).toHaveURL(/products\/fold-sofa\.html$/);
  await expect(page.getByText("MH-01-26")).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open menu" }).click();
  }
  await page.getByRole("link", { name: /Cart/ }).click();
  await expect(page.getByRole("heading", { name: "Fold Sofa" })).toBeVisible();

  await page.goto(pathToFileURL(path.join(outputRoot, "search.html")).href);
  await page.getByRole("searchbox", { name: "Search products" }).fill("lamp");
  await expect(page.locator("[data-search-result]:visible")).toHaveCount(1);
  await expect(page.locator("[data-search-result]:visible")).toContainText("Reed Lamp");
});
