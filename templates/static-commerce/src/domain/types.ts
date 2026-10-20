export type LanguageCode = "en" | "zh";
export type LocalizedText = { en: string; zh?: string };
export type PriceMode = "fixed" | "tiered" | "inquiry";
export type SalesMode = "retail" | "wholesale" | "hybrid";
export type ThemeId = "minimal" | "natural" | "luxury";
export type RecipeId = string;
export type SectionType = "hero" | "categories" | "featured" | "brand-story" | "wholesale-callout" | "faq";

export interface RecipeSection {
  type: SectionType;
  variant: string;
  audience?: SalesMode[];
}

export interface SiteRecipe {
  id: RecipeId;
  sections: RecipeSection[];
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
}

export interface NavigationItem {
  id: string;
  label: LocalizedText;
  href: string;
}

export interface SiteConfig {
  id: string;
  defaultLanguage: LanguageCode;
  languages: LanguageCode[];
  currency: CurrencyConfig;
  salesMode: SalesMode;
  themeId: ThemeId;
  recipeId: RecipeId;
  catalogId: string;
  navigation: NavigationItem[];
  contact: { email: string };
  inquiryMethods: Array<"copy" | "email">;
  features: { search: boolean; cart: boolean; wholesale: boolean };
  header?: {
    variant: "minimal" | "catalog" | "announcement";
    announcement?: LocalizedText;
  };
  footer?: { variant: "simple" | "columns" };
}

export interface Brand {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  logo?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: LocalizedText;
}

export interface ProductImage {
  src: string;
  alt: LocalizedText;
  width: number;
  height: number;
}

export interface ProductOptionValue {
  id: string;
  label: LocalizedText;
}

export interface ProductOption {
  id: string;
  label: LocalizedText;
  values: ProductOptionValue[];
}

export interface PriceTier {
  minQuantity: number;
  unitPrice: number;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: LocalizedText;
  description: LocalizedText;
  categoryIds: string[];
  tags: string[];
  images: ProductImage[];
  options?: ProductOption[];
  priceMode: PriceMode;
  originalPrice?: number;
  price?: number;
  priceTiers?: PriceTier[];
  moq?: number;
  inventoryStatus: "in-stock" | "low-stock" | "out-of-stock" | "made-to-order";
  relatedProductIds: string[];
  seo?: { title?: LocalizedText; description?: LocalizedText };
}

export interface SiteBundle {
  site: SiteConfig;
  brand: Brand;
  categories: Category[];
  products: Product[];
  recipe: SiteRecipe;
  rootDir: string;
  catalogDir: string;
}
