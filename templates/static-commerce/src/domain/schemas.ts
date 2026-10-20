import { z } from "zod";

export const localizedTextSchema = z.object({
  en: z.string().trim().min(1),
  zh: z.string().trim().min(1).optional()
});

export const siteConfigSchema = z.object({
  id: z.string().trim().min(1),
  defaultLanguage: z.enum(["en", "zh"]),
  languages: z.array(z.enum(["en", "zh"])).min(1),
  currency: z.object({ code: z.string().length(3), symbol: z.string().min(1) }),
  salesMode: z.enum(["retail", "wholesale", "hybrid"]),
  themeId: z.enum(["minimal", "natural", "luxury"]),
  recipeId: z.string().trim().min(1),
  catalogId: z.string().trim().min(1),
  navigation: z.array(
    z.object({
      id: z.string().trim().min(1),
      label: localizedTextSchema,
      href: z.string().trim().min(1)
    })
  ),
  contact: z.object({ email: z.email() }),
  inquiryMethods: z.array(z.enum(["copy", "email"])).min(1),
  features: z.object({ search: z.boolean(), cart: z.boolean(), wholesale: z.boolean() }),
  header: z.object({
    variant: z.enum(["minimal", "catalog", "announcement"]),
    announcement: localizedTextSchema.optional()
  }).optional(),
  footer: z.object({ variant: z.enum(["simple", "columns"]) }).optional()
});

export const brandSchema = z.object({
  id: z.string().trim().min(1),
  name: localizedTextSchema,
  description: localizedTextSchema,
  logo: z.string().trim().min(1).optional()
});

export const categorySchema = z.object({
  id: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  name: localizedTextSchema
});

const productImageSchema = z.object({
  src: z.string().trim().min(1),
  alt: localizedTextSchema,
  width: z.number().int().positive(),
  height: z.number().int().positive()
});

const productOptionSchema = z.object({
  id: z.string().trim().min(1),
  label: localizedTextSchema,
  values: z.array(
    z.object({
      id: z.string().trim().min(1),
      label: localizedTextSchema
    })
  ).min(1)
});

export const productSchema = z.object({
  id: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  sku: z.string().trim().min(1),
  name: localizedTextSchema,
  description: localizedTextSchema,
  categoryIds: z.array(z.string().trim().min(1)).min(1),
  tags: z.array(z.string().trim().min(1)).default([]),
  images: z.array(productImageSchema).min(1),
  options: z.array(productOptionSchema).optional(),
  priceMode: z.enum(["fixed", "tiered", "inquiry"]),
  originalPrice: z.number().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
  priceTiers: z.array(
    z.object({ minQuantity: z.number().int().positive(), unitPrice: z.number().nonnegative() })
  ).optional(),
  moq: z.number().int().positive().optional(),
  inventoryStatus: z.enum(["in-stock", "low-stock", "out-of-stock", "made-to-order"]),
  relatedProductIds: z.array(z.string().trim().min(1)).default([]),
  seo: z.object({ title: localizedTextSchema.optional(), description: localizedTextSchema.optional() }).optional()
}).superRefine((product, ctx) => {
  if (product.priceMode === "fixed" && product.price === undefined) {
    ctx.addIssue({ code: "custom", path: ["price"], message: "fixed pricing requires price" });
  }
  if (product.priceMode === "tiered" && !product.priceTiers?.length) {
    ctx.addIssue({ code: "custom", path: ["priceTiers"], message: "tiered pricing requires priceTiers" });
  }
});

export const categoriesSchema = z.array(categorySchema).min(1);
export const productsSchema = z.array(productSchema).min(1);
