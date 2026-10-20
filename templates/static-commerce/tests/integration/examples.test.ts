import { access } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadSite } from "../../src/domain/load-site";

const root = path.resolve(".");
const examples = [
  { directory: "现代极简零售", id: "minimal-retail", theme: "minimal", mode: "retail" },
  { directory: "自然生活批发", id: "natural-wholesale", theme: "natural", mode: "wholesale" },
  { directory: "深色精品混合", id: "luxury-hybrid", theme: "luxury", mode: "hybrid" }
] as const;

describe("example sites", () => {
  it("loads Chinese directories with stable English site ids", async () => {
    for (const example of examples) {
      const bundle = await loadSite(example.directory, root);
      expect(bundle.site.id).toBe(example.id);
      expect(bundle.site.themeId).toBe(example.theme);
      expect(bundle.site.salesMode).toBe(example.mode);
      expect(bundle.site.catalogId).toBe("demo");
    }
  });

  it("uses the exact same shared product ids for all three sites", async () => {
    const bundles = await Promise.all(examples.map((example) => loadSite(example.directory, root)));
    const ids = bundles[0].products.map((product) => product.id);
    expect(ids.length).toBeGreaterThanOrEqual(6);
    expect(bundles.slice(1).every((bundle) => JSON.stringify(bundle.products.map((product) => product.id)) === JSON.stringify(ids))).toBe(true);
  });

  it("has source templates for all nine required page types", async () => {
    const pages = ["index.astro", "shop.astro", "search.astro", "cart.astro", "about.astro", "wholesale.astro", "contact.astro", "404.astro", "products/[slug].astro"];
    await expect(Promise.all(pages.map((page) => access(path.join(root, "src", "pages", page))))).resolves.toBeDefined();
  });
});
