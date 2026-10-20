import { describe, expect, it } from "vitest";
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

  it("filters audience-specific sections for each sales mode", () => {
    const recipe = parseRecipe(validRecipe);
    expect(renderableSections(recipe, "retail").some((section) => section.type === "wholesale-callout")).toBe(false);
    expect(renderableSections(recipe, "wholesale").some((section) => section.type === "wholesale-callout")).toBe(true);
    expect(renderableSections(recipe, "hybrid").some((section) => section.type === "wholesale-callout")).toBe(true);
  });
});
