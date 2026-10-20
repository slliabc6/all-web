import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Brand, Category, Product, SiteBundle, SiteConfig } from "./types";
import { brandSchema, categoriesSchema, productsSchema, siteConfigSchema } from "./schemas";
import { parseRecipe } from "../recipes/section-registry";

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

async function readJson(filePath: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function parseFile<T>(filePath: string, schema: { safeParse(value: unknown): { success: true; data: T } | { success: false; error: { issues: Array<{ path: PropertyKey[]; message: string }> } } }, value: unknown): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const details = result.error.issues
    .map((issue) => `${issue.path.map(String).join(".") || "root"}: ${issue.message}`)
    .join("; ");
  throw new Error(`${path.basename(filePath)}: ${details}`);
}

function assertUnique(products: Product[], field: "id" | "slug" | "sku") {
  const seen = new Set<string>();
  for (const product of products) {
    const value = product[field];
    if (seen.has(value)) throw new Error(`products.json: duplicate ${field.toUpperCase()} ${value}`);
    seen.add(value);
  }
}

async function validateReferences(products: Product[], categories: Category[], catalogDir: string) {
  const productIds = new Set(products.map((product) => product.id));
  const categoryIds = new Set(categories.map((category) => category.id));
  const catalogRoot = path.resolve(catalogDir);

  for (const product of products) {
    for (const categoryId of product.categoryIds) {
      if (!categoryIds.has(categoryId)) {
        throw new Error(`products.json: product ${product.id} references unknown category ${categoryId}`);
      }
    }
    for (const relatedId of product.relatedProductIds) {
      if (!productIds.has(relatedId)) {
        throw new Error(`products.json: product ${product.id} references unknown product ${relatedId}`);
      }
    }
    for (const image of product.images) {
      const imagePath = path.resolve(catalogDir, image.src);
      if (imagePath !== catalogRoot && !imagePath.startsWith(`${catalogRoot}${path.sep}`)) {
        throw new Error(`products.json: product ${product.id} image escapes catalog directory: ${image.src}`);
      }
      try {
        await access(imagePath);
      } catch {
        throw new Error(`products.json: product ${product.id} missing image ${image.src}`);
      }
    }
  }
}

export async function loadSite(siteId: string, rootDir = defaultRoot): Promise<SiteBundle> {
  const siteDir = path.join(rootDir, "sites", siteId);
  const sitePath = path.join(siteDir, "site.json");
  const brandPath = path.join(siteDir, "brand.json");
  const site = parseFile<SiteConfig>(sitePath, siteConfigSchema, await readJson(sitePath));
  const brand = parseFile<Brand>(brandPath, brandSchema, await readJson(brandPath));
  const recipePath = path.join(rootDir, "recipes", `${site.recipeId}.json`);
  let recipe;
  try {
    recipe = parseRecipe(await readJson(recipePath));
  } catch (error) {
    throw new Error(`${path.basename(recipePath)}: ${error instanceof Error ? error.message : String(error)}`);
  }
  const catalogDir = path.join(rootDir, "data", "catalogs", site.catalogId);
  const categoriesPath = path.join(catalogDir, "categories.json");
  const productsPath = path.join(catalogDir, "products.json");
  const categories = parseFile<Category[]>(categoriesPath, categoriesSchema, await readJson(categoriesPath));
  const products = parseFile<Product[]>(productsPath, productsSchema, await readJson(productsPath));

  if (site.id !== siteId) throw new Error(`site.json: id ${site.id} does not match directory ${siteId}`);
  assertUnique(products, "id");
  assertUnique(products, "slug");
  assertUnique(products, "sku");
  await validateReferences(products, categories, catalogDir);

  return { site, brand, categories, products, recipe, rootDir, catalogDir };
}
