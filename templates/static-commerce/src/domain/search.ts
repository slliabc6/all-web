import type { Product } from "./types";

export interface SearchQuery {
  term?: string;
  categoryId?: string;
  tags?: string[];
}

function searchableText(product: Product) {
  return [
    product.id,
    product.sku,
    product.name.en,
    product.name.zh,
    product.description.en,
    product.description.zh,
    ...product.tags
  ].filter(Boolean).join(" ").toLocaleLowerCase();
}

export function filterProducts(products: Product[], query: SearchQuery): Product[] {
  const term = query.term?.trim().toLocaleLowerCase();
  return products.filter((product) => {
    if (term && !searchableText(product).includes(term)) return false;
    if (query.categoryId && !product.categoryIds.includes(query.categoryId)) return false;
    if (query.tags?.some((tag) => !product.tags.includes(tag))) return false;
    return true;
  });
}
