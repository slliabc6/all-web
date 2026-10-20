import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { rm } from "node:fs/promises";
import { loadSite } from "../../src/domain/load-site";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(value), "utf8");
}

async function fixture(overrides?: {
  site?: Record<string, unknown>;
  products?: unknown[];
  categories?: unknown[];
  brand?: Record<string, unknown>;
  createImage?: boolean;
}) {
  const root = await mkdtemp(path.join(tmpdir(), "all-web-site-"));
  roots.push(root);
  const siteId = "demo-site";
  const catalogDir = path.join(root, "data", "catalogs", "demo");
  const imagePath = path.join(catalogDir, "assets", "item.jpg");

  const site = {
    id: siteId,
    defaultLanguage: "en",
    languages: ["en", "zh"],
    currency: { code: "USD", symbol: "$" },
    salesMode: "retail",
    themeId: "minimal",
    recipeId: "retail-default",
    catalogId: "demo",
    navigation: [{ id: "home", label: { en: "Home", zh: "首页" }, href: "index.html" }],
    contact: { email: "sales@example.com" },
    inquiryMethods: ["copy", "email"],
    features: { search: true, cart: true, wholesale: false },
    ...overrides?.site
  };
  const brand = {
    id: "demo-brand",
    name: { en: "Demo Brand", zh: "演示品牌" },
    description: { en: "Reusable commerce fixtures." },
    ...overrides?.brand
  };
  const categories = overrides?.categories ?? [
    { id: "home", slug: "home", name: { en: "Home", zh: "家居" } }
  ];
  const products = overrides?.products ?? [
    {
      id: "item-1",
      slug: "item-1",
      sku: "ITEM-1",
      name: { en: "Sample item", zh: "示例商品" },
      description: { en: "A sample product." },
      categoryIds: ["home"],
      tags: ["featured"],
      images: [
        { src: "assets/item.jpg", alt: { en: "Sample item" }, width: 800, height: 800 }
      ],
      priceMode: "fixed",
      price: 29,
      inventoryStatus: "in-stock",
      relatedProductIds: []
    }
  ];

  await writeJson(path.join(root, "sites", siteId, "site.json"), site);
  await writeJson(path.join(root, "sites", siteId, "brand.json"), brand);
  await writeJson(path.join(catalogDir, "categories.json"), categories);
  await writeJson(path.join(catalogDir, "products.json"), products);
  if (overrides?.createImage !== false) {
    await mkdir(path.dirname(imagePath), { recursive: true });
    await writeFile(imagePath, "image", "utf8");
  }

  return { root, siteId, product: products[0] as Record<string, unknown> };
}

describe("loadSite", () => {
  it("loads a valid site bundle", async () => {
    const { root, siteId } = await fixture();
    const bundle = await loadSite(siteId, root);

    expect(bundle.site.id).toBe(siteId);
    expect(bundle.brand.name.en).toBe("Demo Brand");
    expect(bundle.products).toHaveLength(1);
  });

  it.each([
    ["missing product id", { id: undefined }, "products.json"],
    ["invalid price mode", { priceMode: "auction" }, "priceMode"],
    ["missing English name", { name: { zh: "只有中文" } }, "name.en"]
  ])("rejects %s", async (_label, productPatch, expected) => {
    const base = await fixture();
    const invalidProduct = { ...base.product, ...productPatch };
    await writeJson(
      path.join(base.root, "data", "catalogs", "demo", "products.json"),
      [invalidProduct]
    );

    await expect(loadSite(base.siteId, base.root)).rejects.toThrow(expected);
  });

  it("rejects duplicate SKUs", async () => {
    const base = await fixture();
    const duplicate = { ...base.product, id: "item-2", slug: "item-2" };
    await writeJson(
      path.join(base.root, "data", "catalogs", "demo", "products.json"),
      [base.product, duplicate]
    );

    await expect(loadSite(base.siteId, base.root)).rejects.toThrow("duplicate SKU ITEM-1");
  });

  it("rejects unknown related product ids", async () => {
    const base = await fixture();
    const invalid = { ...base.product, relatedProductIds: ["missing-product"] };
    await writeJson(
      path.join(base.root, "data", "catalogs", "demo", "products.json"),
      [invalid]
    );

    await expect(loadSite(base.siteId, base.root)).rejects.toThrow("missing-product");
  });

  it("rejects missing local product images", async () => {
    const { root, siteId } = await fixture({ createImage: false });

    await expect(loadSite(siteId, root)).rejects.toThrow("item-1");
  });
});
