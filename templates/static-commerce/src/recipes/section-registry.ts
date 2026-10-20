import { z } from "zod";
import type { SalesMode, SiteRecipe } from "../domain/types";

export const sectionVariants = {
  hero: ["split", "full-bleed", "minimal", "room-story"],
  categories: ["grid", "pills", "atelier-index"],
  featured: ["grid", "editorial", "staggered"],
  "brand-story": ["split", "editorial", "workshop"],
  "wholesale-callout": ["band", "card"],
  faq: ["list", "columns"]
} as const;

const sectionSchema = z.object({
  type: z.enum(["hero", "categories", "featured", "brand-story", "wholesale-callout", "faq"]),
  variant: z.string().min(1),
  audience: z.array(z.enum(["retail", "wholesale", "hybrid"])).optional()
}).superRefine((section, ctx) => {
  const variants = sectionVariants[section.type] as readonly string[];
  if (!variants.includes(section.variant)) {
    ctx.addIssue({ code: "custom", path: ["variant"], message: `invalid ${section.type} variant ${section.variant}` });
  }
});

const recipeSchema = z.object({
  id: z.string().min(1),
  sections: z.array(sectionSchema).min(1)
}).superRefine((recipe, ctx) => {
  const heroes = recipe.sections.filter((section) => section.type === "hero").length;
  if (heroes > 1) ctx.addIssue({ code: "custom", path: ["sections"], message: "hero may appear only once" });
});

export function parseRecipe(value: unknown): SiteRecipe {
  if (value && typeof value === "object" && Array.isArray((value as { sections?: unknown }).sections)) {
    for (const section of (value as { sections: Array<{ type?: unknown }> }).sections) {
      if (typeof section?.type === "string" && !(section.type in sectionVariants)) {
        throw new Error(`unknown section type ${section.type}`);
      }
    }
  }
  const result = recipeSchema.safeParse(value);
  if (result.success) return result.data;
  throw new Error(result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "));
}

export function renderableSections(recipe: SiteRecipe, salesMode: SalesMode) {
  return recipe.sections.filter((section) => !section.audience || section.audience.includes(salesMode));
}
