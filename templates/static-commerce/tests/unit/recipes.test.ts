import { describe, expect, it } from "vitest";
import { siteConfigSchema } from "../../src/domain/schemas";
import { parseRecipe, renderableSections } from "../../src/recipes/section-registry";

const validRecipe = {
  id: "retail-default",
  sections: [
    { type: "hero", variant: "split" },
    { type: "categories", variant: "grid" },
    { type: "featured", variant: "grid" },
    { type: "wholesale-callout", variant: "band", audience: ["wholesale", "hybrid"] },
    { type: "brand-story", variant: "editorial" },
    { type: "faq", variant: "list" }
  ]
};

describe("site recipes", () => {
  it("preserves valid section order", () => {
    expect(parseRecipe(validRecipe).sections.map((section) => section.type)).toEqual([
      "hero", "categories", "featured", "wholesale-callout", "brand-story", "faq"
    ]);
  });

  it("rejects unknown modules", () => {
    expect(() => parseRecipe({ id: "bad", sections: [{ type: "video-wall", variant: "full" }] })).toThrow("video-wall");
  });

  it("rejects invalid component variants", () => {
    expect(() => parseRecipe({ id: "bad", sections: [{ type: "hero", variant: "carousel" }] })).toThrow("carousel");
  });

  it("rejects duplicate hero modules", () => {
    expect(() => parseRecipe({ id: "bad", sections: [
      { type: "hero", variant: "split" },
      { type: "hero", variant: "minimal" }
    ] })).toThrow("hero");
  });

  it("accepts the furniture storytelling variants", () => {
    const recipe = parseRecipe({ id: "furniture-story", sections: [
      { type: "hero", variant: "room-story" },
      { type: "categories", variant: "atelier-index" },
      { type: "featured", variant: "staggered" },
      { type: "brand-story", variant: "workshop" },
      { type: "faq", variant: "list" }
    ] });

    expect(recipe.sections.map((section) => section.variant)).toEqual([
      "room-story", "atelier-index", "staggered", "workshop", "list"
    ]);
  });

  it("accepts the packaging catalog theme and section variants", () => {
    const site = siteConfigSchema.parse({
      id: "packaging-demo",
      defaultLanguage: "en",
      languages: ["en", "zh"],
      currency: { code: "USD", symbol: "$" },
      salesMode: "hybrid",
      themeId: "packaging",
      recipeId: "packaging-catalog",
      catalogId: "packaging-essentials",
      navigation: [{ id: "home", label: { en: "Home", zh: "首页" }, href: "/" }],
      contact: { email: "hello@example.com" },
      inquiryMethods: ["copy", "email"],
      features: { search: true, cart: true, wholesale: true }
    });
    const recipe = parseRecipe({ id: "packaging-catalog", sections: [
      { type: "hero", variant: "packaging-collage" },
      { type: "categories", variant: "use-case-cards" },
      { type: "featured", variant: "counter-grid" },
      { type: "brand-story", variant: "service-story" },
      { type: "wholesale-callout", variant: "planning-banner" }
    ] });

    expect(site.themeId).toBe("packaging");
    expect(recipe.sections.map((section) => section.variant)).toEqual([
      "packaging-collage", "use-case-cards", "counter-grid", "service-story", "planning-banner"
    ]);
  });

  it("rejects a packaging variant under the wrong section type", () => {
    expect(() => parseRecipe({
      id: "bad-packaging",
      sections: [{ type: "categories", variant: "packaging-collage" }]
    })).toThrow("packaging-collage");
  });

  it("filters audience-specific sections for each sales mode", () => {
    const recipe = parseRecipe(validRecipe);
    expect(renderableSections(recipe, "retail").some((section) => section.type === "wholesale-callout")).toBe(false);
    expect(renderableSections(recipe, "wholesale").some((section) => section.type === "wholesale-callout")).toBe(true);
    expect(renderableSections(recipe, "hybrid").some((section) => section.type === "wholesale-callout")).toBe(true);
  });
});
