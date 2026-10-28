# Cupsky Template Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract Cupsky's reusable packaging-store language into the existing Astro static-commerce system and deliver a brand-independent, offline-capable example to Google Drive.

**Architecture:** Extend the existing theme and recipe registries rather than copying the source HTML. A new packaging catalog and site configuration provide public-safe demo content; the user-provided source remains reference-only and outside Git.

**Tech Stack:** Astro 7, TypeScript, Zod, Vitest, Playwright, static HTML/CSS/SVG

**Spec:** `docs/superpowers/specs/2026-10-28-cupsky-template-extraction-design.md`

## Global Constraints

- Final output is one ordinary static directory with `index.html`; no duplicate offline/release packages.
- No CDN, online fonts, remote APIs, checkout backend, payment, login, or inventory service.
- Do not commit the user-provided Cupsky raw files or product imagery to the public repository.
- Preserve unrelated working-tree changes in `catalog/assets.json`, `projects/meldora-daylight/`, and the untracked desktop-note file.
- Google Drive delivery must use expanded folders rather than ZIP as the reference entry.

## Review Focus

- Unknown theme IDs must still fail schema parsing while `packaging` succeeds.
- A recipe variant registered for one section type must fail when used under another type.
- Missing or malformed packaging product data must fail the existing Zod loader rather than silently render.
- Static nested product links and asset paths must work under `file://`.
- Existing minimal, natural, and luxury sites must retain their current recipe order and theme tokens.

---

### Task 1: Register the packaging theme and recipe variants

**Files:**
- Modify: `templates/static-commerce/src/domain/schemas.ts`
- Modify: `templates/static-commerce/src/layouts/SiteLayout.astro`
- Modify: `templates/static-commerce/src/recipes/section-registry.ts`
- Create: `templates/static-commerce/recipes/packaging-catalog.json`
- Test: `templates/static-commerce/tests/unit/recipes.test.ts`
- Test: `templates/static-commerce/tests/integration/examples.test.ts`

**Interfaces:**
- Consumes: existing `siteConfigSchema`, `sectionVariants`, `parseRecipe()`.
- Produces: theme ID `packaging`; variants `packaging-collage`, `use-case-cards`, `counter-grid`, `service-story`, `planning-banner`.

- [ ] Write failing tests that accept the new theme/recipe and reject a cross-section variant.
- [ ] Run the focused Vitest files and confirm failure because the new IDs are unknown.
- [ ] Register the IDs and create the recipe with exactly one hero.
- [ ] Run the focused tests and confirm they pass.

### Task 2: Implement packaging-specific visual variants

**Files:**
- Create: `templates/static-commerce/src/styles/themes/packaging.css`
- Modify: `templates/static-commerce/src/styles/base.css`
- Modify: `templates/static-commerce/src/components/sections/HeroSection.astro`
- Modify: `templates/static-commerce/src/components/sections/CategorySection.astro`
- Modify: `templates/static-commerce/src/components/sections/FeaturedProducts.astro`
- Modify: `templates/static-commerce/src/components/sections/BrandStory.astro`
- Modify: `templates/static-commerce/src/components/sections/WholesaleCallout.astro`
- Modify: `templates/static-commerce/src/components/product/ProductCard.astro`
- Test: `templates/static-commerce/tests/e2e/themes.spec.ts`

**Interfaces:**
- Consumes: recipe variant strings and existing section props.
- Produces: accessible Astro markup scoped by variant class and `body[data-theme="packaging"]` styles.

- [ ] Write a failing E2E assertion for section order, packaging theme tokens, and the collage/category/card classes.
- [ ] Run the focused Playwright test and confirm the missing theme/markup failure.
- [ ] Add the minimal variant markup and scoped responsive CSS, including focus and reduced-motion behavior.
- [ ] Run the focused E2E test and confirm it passes without changing other theme assertions.

### Task 3: Add a public-safe packaging example

**Files:**
- Create: `templates/static-commerce/sites/轻快包装用品/site.json`
- Create: `templates/static-commerce/sites/轻快包装用品/brand.json`
- Create: `templates/static-commerce/data/catalogs/packaging-essentials/categories.json`
- Create: `templates/static-commerce/data/catalogs/packaging-essentials/products.json`
- Create: `templates/static-commerce/data/catalogs/packaging-essentials/assets/*.svg`
- Modify: `templates/static-commerce/scripts/build-examples.mjs`
- Test: `templates/static-commerce/tests/integration/examples.test.ts`
- Test: `templates/static-commerce/tests/e2e/static-output.spec.ts`

**Interfaces:**
- Consumes: existing site/catalog loader and static builder.
- Produces: site directory `轻快包装用品` and output `exports/轻快包装用品/网站成品/`.

- [ ] Write failing tests for the fourth example, eight valid products, required price modes, and local SVG references.
- [ ] Run focused tests and confirm failure because the site/catalog do not exist.
- [ ] Add the site, brand, catalog, self-created SVGs, and build-list entry.
- [ ] Run focused tests and confirm data parsing and static-output behavior pass.

### Task 4: Record provenance, verify, sync, and publish

**Files:**
- Create: `references/cupsky-template-source/README.md`
- Create: `templates/static-commerce/data/catalogs/packaging-essentials/README.md`
- Modify: `templates/static-commerce/README.md`
- Modify: `catalog/assets.json`
- Modify: `docs/STATUS.md`
- Modify: `knowledge/CHANGELOG.md`

**Interfaces:**
- Consumes: completed template, reference analysis, Google Drive folder URLs.
- Produces: indexed `reference-only` source record, verified template asset entry, Drive links, Git commit.

- [ ] Record the local Cupsky source path, observed modules, mapping, and unverified public rights without copying raw files.
- [ ] Document configuration fields, asset replacement, build command, limitations, and verification date.
- [ ] Run `npm test -- --run`, `npm run build:examples`, `npm run verify:static`, and `npm run test:e2e`.
- [ ] Open the final packaging `index.html` through `file://` at desktop and mobile widths; verify local assets, navigation, search, cart, and zero external requests.
- [ ] Upload the expanded static output and reusable template/data documentation to the user's `小李` Drive, then list each folder to verify contents.
- [ ] Update index/status/changelog with observed Drive URLs and verification evidence.
- [ ] Stage only task files, validate the staged JSON/Markdown paths, commit, push `main`, and verify remote HEAD.

## Self-review

- Spec coverage: all visual, architecture, rights, offline, Drive, and Git requirements map to Tasks 1–4.
- Step scan: implementation choices are fixed by IDs, paths, and focused assertions; no task requires inventing a second framework.
- Type consistency: recipe IDs and variants match the spec and Task 1 interfaces.
- Review focus: each listed failure mode is exercised in Tasks 1–3 or the final static verification.
- Proportion: the plan defines four independently checkable deliverables without transcribing component bodies.
