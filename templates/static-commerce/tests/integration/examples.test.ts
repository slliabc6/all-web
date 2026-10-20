import { access } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadSite } from "../../src/domain/load-site";

const root = path.resolve(".");
const examples = [
  { directory: "现代极简零售", id: "minimal-retail", theme: "minimal", mode: "retail", catalog: "small-batch-furniture" },
  { directory: "自然生活批发", id: "natural-wholesale", theme: "natural", mode: "wholesale", catalog: "demo" },
  { directory: "深色精品混合", id: "luxury-hybrid", theme: "luxury", mode: "hybrid", catalog: "demo" }
] as const;

describe("example sites", () => {
  it("loads Chinese directories with stable English site ids", async () => {
    for (const example of examples) {
      const bundle = await loadSite(example.directory, root);
      expect(bundle.site.id).toBe(example.id);
      expect(bundle.site.themeId).toBe(example.theme);
      expect(bundle.site.salesMode).toBe(example.mode);
      expect(bundle.site.catalogId).toBe(example.catalog);
    }
  });

  it("gives the flagship furniture site its own coherent small-batch catalog", async () => {
    const bundles = await Promise.all(examples.map((example) => loadSite(example.directory, root)));
    const [furniture, wholesale, hybrid] = bundles;
    expect(furniture.brand.name.en).toBe("Morrow House");
    expect(furniture.products.map((product) => product.id)).toEqual([
      "fold-sofa", "vale-chair", "low-table-03", "gather-table", "alder-cabinet", "reed-lamp"
    ]);
    expect(furniture.products.every((product) => product.tags.includes("small-batch"))).toBe(true);
    expect(wholesale.products.map((product) => product.id)).toEqual(hybrid.products.map((product) => product.id));
    expect(furniture.products.map((product) => product.id)).not.toEqual(wholesale.products.map((product) => product.id));
  });

  it("uses the room-led recipe for the flagship furniture site", async () => {
    const bundle = await loadSite("现代极简零售", root);
    expect(bundle.recipe.sections.map(({ type, variant }) => `${type}:${variant}`)).toEqual([
      "hero:room-story",
      "categories:atelier-index",
      "featured:staggered",
      "brand-story:workshop",
      "faq:list"
    ]);
  });

  it("has source templates for all nine required page types", async () => {
    const pages = ["index.astro", "shop.astro", "search.astro", "cart.astro", "about.astro", "wholesale.astro", "contact.astro", "404.astro", "products/[slug].astro"];
    await expect(Promise.all(pages.map((page) => access(path.join(root, "src", "pages", page))))).resolves.toBeDefined();
  });
});
