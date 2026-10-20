import { expect, test } from "@playwright/test";

test("homepage renders configured sections in recipe order", async ({ page }) => {
  await page.goto("/");
  const sections = page.locator("main > [data-section]");
  expect(await sections.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-section")))).toEqual([
    "hero", "categories", "featured", "wholesale-callout", "brand-story", "faq"
  ]);
});

test("three theme ids resolve to visibly different design tokens", async ({ page }) => {
  await page.goto("/");
  const values: string[] = [];
  for (const theme of ["minimal", "natural", "luxury"]) {
    values.push(await page.evaluate((themeId) => {
      document.documentElement.dataset.theme = themeId;
      return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    }, theme));
  }
  expect(new Set(values).size).toBe(3);
});
