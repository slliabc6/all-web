# Meldora Mahjong B2B Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-quality, reusable Astro + React static B2B mahjong catalog that publishes reviewed prices and sends verifiable email inquiries without cart or checkout behavior.

**Architecture:** Astro owns routes, content loading, SEO, and static HTML; React Islands own only stateful interactions. Brand data, pricing, and asset manifests live outside page components and are validated before build. The static site posts to an environment-configured inquiry receiver; local tests use a deterministic mock, while production success requires receiver, notification, and mailbox evidence.

**Tech Stack:** Product Design prototype bootstrap, Astro, React 19, TypeScript, Zod, Vitest, Testing Library, Playwright, axe-core, Sharp, Node.js 20+, npm lockfile, Hostinger-compatible static output.

**Spec:** `docs/superpowers/specs/2026-10-13-meldora-b2b-site-design.md`

## Global Constraints

- Bootstrap `templates/b2b-catalog-astro` with the Product Design `prototype` template before converting it to Astro; do not hand-roll the initial app shell.
- Generate complete static HTML for home, collection, product, inquiry, 404, sitemap, and robots routes; readable content and navigation must survive JavaScript failure.
- Use only local product information and publishable derivatives; never hotlink or redistribute Givingli assets.
- Do not fabricate reviews, stock, ship dates, certifications, capacity, lead times, trademarks, or product specifications.
- Store money as integer minor units. USD values are fixed editorial values with `pricingReviewedAt`, `exchangeRate`, and source note; do not call a live FX API in the browser.
- Preserve the 43% one-set uplift rule and explicit override reasons; omit unavailable tiers instead of inventing them.
- No cart, payment, checkout, login, runtime CMS, or client-side secret is permitted.
- Treat `local-only/**` as private source material and never commit it; public derivatives go under `brands/meldora/assets/web/**` with manifest provenance.
- Do not publish the Alabama-themed set until name, rights, and the 11 mm image batch are confirmed; unresolved 15/18 mm conflicts stay hidden.
- Only display inquiry success after the receiver returns the agreed 2xx `accepted: true` contract; a production completion claim additionally requires actual mailbox receipt.
- Honor keyboard navigation, visible focus, contrast, semantic headings, responsive layouts, and `prefers-reduced-motion`.
- Preserve unrelated working-tree changes and the untracked text file; each task stages only its own files.

## Review Focus

1. Missing or malformed public endpoint configuration must leave the form usable via a direct-email fallback and must never show a false success; Task 7 pins this in transport and component tests.
2. Duplicate product slugs, missing asset references, unapproved assets, or incomplete pricing review metadata must fail validation before build; Task 2 pins all four conditions.
3. A product with no 100-set tier or with `item` units must render only valid quantity choices and labels; Task 5 pins both cases.
4. Disabled JavaScript, reduced motion, and keyboard-only input must preserve content access and primary navigation; Tasks 4, 6, and 8 pin these behaviors.
5. Repeated submission, timeout, 429, 5xx, and stale responses must produce distinct recoverable states without duplicate accepted inquiries; Task 7 pins the full failure matrix.

---

## File Map and Execution Graph

- `brands/meldora/**`: public brand copy, products, reviewed pricing, asset derivatives, and manifest.
- `templates/b2b-catalog-astro/**`: runnable first-site implementation and its unit, component, build, E2E, and visual tests.
- `components/b2b-site-kit/**`: promoted, brand-agnostic React components, contracts, and usage documentation after first-site validation.
- `projects/meldora-launch/**`: launch handoff, environment contract, inquiry evidence checklist, and unresolved production gates.
- `catalog/assets.json`, `docs/STATUS.md`, `docs/STORAGE.md`, `knowledge/CHANGELOG.md`: reusable-asset registry and operational state.
- `design-qa.md`: dated visual/a11y verification with screenshot paths and zero open P0/P1/P2 issues at handoff.

Execution order:

1. Task 1 establishes the scaffold and test harness.
2. Tasks 2, 3, and 7 may run in parallel with exclusive ownership of brand data, image assets, and inquiry code respectively.
3. Tasks 4–6 consume Tasks 2–3 and should merge in order because they share page composition.
4. Task 8 verifies the integrated site; Task 9 promotes stable assets; Task 10 performs external synchronization and records production gates.

### Task 1: Bootstrap and Convert the Static Site Shell

**Files:**
- Create via bootstrap, then modify: `templates/b2b-catalog-astro/package.json`, `package-lock.json`, `.npmrc`, `AGENTS.md`
- Replace: `templates/b2b-catalog-astro/vite.config.mjs`, `src/main.jsx`, `src/App.jsx`, `src/styles.css`
- Create: `templates/b2b-catalog-astro/astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, `src/layouts/SiteLayout.astro`, `src/styles/global.css`
- Create: `templates/b2b-catalog-astro/tests/build/static-shell.test.mjs`
- Preserve/adapt: `templates/b2b-catalog-astro/.openai/hosting.json`, `scripts/prepare-sites-build.mjs`, `tests/sites-worker.test.mjs`, `worker/index.js`

**Interfaces:**
- Produces: Astro project commands `dev`, `build:preview`, `build:release`, `preview`, `test`, `test:e2e`; static output in `dist/`; layout props `{ title: string; description: string; canonicalPath: string }`. `build:preview` permits visibly marked draft pricing, while `build:release` rejects it.

- [ ] **Step 1: Bootstrap the required Product Design starter**

Run from `D:\all-web`:

```powershell
node "C:\Users\Administrator\.codex\plugins\cache\openai-curated-remote\product-design\0.1.56\scripts\bootstrap-prototype.mjs" --dest "D:\all-web\templates\b2b-catalog-astro"
```

Expected: JSON reports `status: "created"`; destination contains the pinned React/Vite starter and hosting worker tests.

- [ ] **Step 2: Write the failing static-shell test**

Assert `npm run build:preview` creates `dist/index.html` containing an `<h1>`, a canonical link, and readable placeholder copy, with no `Add to cart`, `Checkout`, or payment route references.

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- --run tests/build/static-shell.test.mjs`

Expected: FAIL because Astro build and route do not exist.

- [ ] **Step 4: Convert the starter to Astro + React**

Install Astro, `@astrojs/react`, TypeScript, Vitest, Testing Library, Playwright, axe-core, Zod, and Sharp into the lockfile; configure `output: "static"`. Keep the hosting worker contract only where it serves the generated `dist` directory.

- [ ] **Step 5: Run the foundation checks**

Run: `npm test && npm run build:preview && npm run test:sites`

Expected: all pass; `dist/index.html` contains real static markup.

- [ ] **Step 6: Commit**

```powershell
git add templates/b2b-catalog-astro
git commit -m "feat: bootstrap meldora astro storefront"
```

### Task 2: Validate Brand, Product, and Pricing Data

**Files:**
- Create: `brands/meldora/brand.json`, `content/site.json`, `content/faqs.json`, `content/pricing-review.json`
- Create: `brands/meldora/content/products/{golden-west-coast,purple-bulldog,pink-gothic-dessert,checkerboard,white-racetrack,leopard-bag}.json`
- Create as quarantined draft only: `brands/meldora/content/drafts/white-alabama.json`
- Create: `templates/b2b-catalog-astro/src/domain/types.ts`, `src/domain/schemas.ts`, `src/domain/pricing.ts`, `src/domain/load-content.ts`
- Create: `templates/b2b-catalog-astro/tests/domain/{schemas,pricing,load-content}.test.ts`

**Interfaces:**
- Produces: `loadBrandCatalog(root: URL): Promise<BrandCatalog>`; `deriveRetailPrice(baseMinor: number, upliftBps: number, endingRule: PriceEndingRule): number`; `validateCatalog(input: unknown): BrandCatalog`.
- `BrandCatalog` exposes `site`, `products`, `faqs`, and `pricingReview`; product quantity tiers use `{ quantity: number; unit: "set" | "item"; unitPriceMinor: number }`.

- [ ] **Step 1: Write failing schema and pricing tests**

Cover valid fixtures plus duplicate slug, unknown/missing asset ID, `publishable: false`, absent `pricingReviewedAt`, absent `exchangeRate`, missing fixed-price override reason, 43% derivation, ending rule, integer-only money, the bag's `item` unit, and omitted 100-set tiers.

- [ ] **Step 2: Run the domain tests to verify they fail**

Run: `npm test -- --run tests/domain`

Expected: FAIL because domain contracts and content do not exist.

- [ ] **Step 3: Implement schemas, pricing, and normalized loaders**

Transcribe the six currently publishable records (five sets plus the leopard bag) from `local-only/brands/麻将/SWN货盘明细(1).xlsx`. Keep original CNY tiers and source date; add a fixed USD candidate table with a documented planning conversion and explicit editorial review status. `build:release` must reject `reviewStatus !== "approved"`; `build:preview` sets `PUBLIC_ALLOW_DRAFT_PRICING=true` and visibly labels draft pricing. Present the table for human review before changing its status to `approved`.

- [ ] **Step 4: Add safety exclusions**

Keep White Alabama outside the public loader, suppress the disputed purple/pink thickness, and use `Lead time on request` instead of historical ship dates.

- [ ] **Step 5: Run domain tests**

Run: `npm test -- --run tests/domain`

Expected: PASS, including all four Review Focus validation failures.

- [ ] **Step 6: Commit**

```powershell
git add brands/meldora templates/b2b-catalog-astro/src/domain templates/b2b-catalog-astro/tests/domain
git commit -m "feat: add validated meldora product catalog"
```

### Task 3: Produce Publishable Image Derivatives and Manifest

**Files:**
- Create: `brands/meldora/assets/manifest.json`
- Create: `brands/meldora/assets/web/{golden-west-coast,purple-bulldog,pink-gothic-dessert,checkerboard,white-racetrack,leopard-bag}/**.{avif,webp,jpg}`
- Create: `templates/b2b-catalog-astro/scripts/build-image-derivatives.mjs`, `scripts/verify-asset-manifest.mjs`
- Create: `templates/b2b-catalog-astro/tests/assets/manifest.test.ts`

**Interfaces:**
- Produces: manifest entries `{ id, productId, role, src, width, height, focalPoint, alt, rights, publishable, kind, sourceRef, generationNote, checksum }`; `resolveAsset(id: string): AssetManifestEntry`.

- [ ] **Step 1: Write the failing manifest test**

Assert stable IDs, unique paths, existing files, nonzero dimensions, checksums, alt rules, rights status, source references, and separation of `evidence` from `marketing` imagery.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run tests/assets/manifest.test.ts`

Expected: FAIL because the manifest and public derivatives do not exist.

- [ ] **Step 3: Inspect and shortlist local source images**

Use `view_image` before every edit batch. Exclude disputed White Alabama images and any file whose product identity, tile thickness, or rights are uncertain.

- [ ] **Step 4: Create AI-enhanced marketing images**

Use the `imagegen` skill/tool for background, lighting, composition, and crop changes. Preserve tile faces, color, layer count, thickness, bag decoration, and included accessories; never treat generated ambience as product evidence.

- [ ] **Step 5: Generate responsive derivatives**

Implement the Sharp script to produce deterministic AVIF/WebP/JPEG sizes without overwriting source material, then populate dimensions and SHA-256 checksums in the manifest.

- [ ] **Step 6: Run asset verification and visually inspect contact sheets**

Run: `npm test -- --run tests/assets/manifest.test.ts && node scripts/verify-asset-manifest.mjs`

Expected: PASS with zero missing, private, unapproved, or checksum-mismatched assets.

- [ ] **Step 7: Commit**

```powershell
git add brands/meldora/assets templates/b2b-catalog-astro/scripts templates/b2b-catalog-astro/tests/assets
git commit -m "feat: add reviewed meldora web imagery"
```

### Task 4: Build the Editorial Shell, Navigation, Hero, and Story Sections

**Files:**
- Create: `templates/b2b-catalog-astro/src/components/react/{Navigation,HeroProductSwitcher}.tsx`
- Create: `templates/b2b-catalog-astro/src/components/astro/{PromoBar,ProductStorySection,EditorialFooter}.astro`
- Create: `templates/b2b-catalog-astro/src/pages/index.astro`, `src/styles/{tokens,layout,motion}.css`
- Create: `templates/b2b-catalog-astro/tests/components/{Navigation,HeroProductSwitcher}.test.tsx`, `tests/build/home-static.test.mjs`

**Interfaces:**
- Consumes: `BrandCatalog`, manifest asset IDs, and `SiteLayout` from Tasks 1–3.
- Produces: `NavigationProps { items, inquiryHref }`; `HeroProductSwitcherProps { products: HeroProduct[]; reducedMotion?: boolean }`; statically rendered story sections.

- [ ] **Step 1: Write failing shell and interaction tests**

Assert the exact approved hero title/subtitle/CTAs, numbered story headings, menu focus return/Escape behavior, hero previous/next and tabs, semantic static links, and no continuous transform under reduced motion.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --run tests/components/Navigation.test.tsx tests/components/HeroProductSwitcher.test.tsx tests/build/home-static.test.mjs`

Expected: FAIL because the sections do not exist.

- [ ] **Step 3: Implement tokens and static editorial composition**

Use the approved colors (`#24120B`, `#F2EDE4`, `#CF3E32`, `#A8C94A`, `#CBDDEA`, `#FFFFFF`), large editorial type, hard-edged primary regions, alternating product stories, and focused responsive breakpoints at 1440×1000 and 390×844.

- [ ] **Step 4: Implement React navigation and hero islands**

Hydrate only these components; keep the first hero and all story copy in server output. Mobile uses a single-card carousel instead of a scaled desktop scene.

- [ ] **Step 5: Run component/build tests and capture baseline screenshots**

Run: `npm test -- --run tests/components tests/build/home-static.test.mjs && npm run build:preview`

Expected: PASS; screenshots show a distinct Meldora implementation with Givingli-inspired rhythm but no copied brand assets or copy.

- [ ] **Step 6: Commit**

```powershell
git add templates/b2b-catalog-astro/src templates/b2b-catalog-astro/tests
git commit -m "feat: build meldora editorial landing shell"
```

### Task 5: Add Wholesale Flow, Use Cases, Tier Demo, and Collection Switch

**Files:**
- Create: `templates/b2b-catalog-astro/src/components/react/{WholesaleSteps,TierPriceDemo,CollectionSwitch}.tsx`
- Create: `templates/b2b-catalog-astro/src/components/astro/{UseCaseGrid,ProductCard}.astro`
- Modify: `templates/b2b-catalog-astro/src/pages/index.astro`, `src/styles/layout.css`
- Create: `templates/b2b-catalog-astro/tests/components/{WholesaleSteps,TierPriceDemo,CollectionSwitch}.test.tsx`

**Interfaces:**
- Consumes: normalized product tiers and asset resolver.
- Produces: `TierPriceDemoProps { products: PricedProduct[]; defaultProductId: string }`; `CollectionSwitchProps { sets: ProductSummary[]; accessories: ProductSummary[] }`.

- [ ] **Step 1: Write failing interaction tests**

Assert three ordered wholesale steps, pointer/keyboard step changes, all steps readable in static/mobile markup, six use cases, set/accessory switching, next-card mobile affordance, no nonexistent 100 tier, correct `item` labels for the bag, tax/shipping disclaimer, and inquiry-only CTAs.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --run tests/components/WholesaleSteps.test.tsx tests/components/TierPriceDemo.test.tsx tests/components/CollectionSwitch.test.tsx`

Expected: FAIL because the interactive sections do not exist.

- [ ] **Step 3: Implement the sections**

Desktop wholesale steps use sticky media with explicit controls; mobile renders the complete ordered sequence. Tier state derives from product data and never creates cart or order state.

- [ ] **Step 4: Run focused and full tests**

Run: `npm test -- --run tests/components && npm run build:preview`

Expected: PASS with valid set/item units and omitted unavailable tiers.

- [ ] **Step 5: Commit**

```powershell
git add templates/b2b-catalog-astro/src templates/b2b-catalog-astro/tests/components
git commit -m "feat: add b2b catalog interactions"
```

### Task 6: Add Collection, Product, Gallery, FAQ, and SEO Routes

**Files:**
- Create: `templates/b2b-catalog-astro/src/pages/collections/index.astro`, `src/pages/products/[slug].astro`, `src/pages/contact.astro`, `src/pages/404.astro`, `src/pages/robots.txt.ts`, `src/pages/sitemap.xml.ts`
- Create: `templates/b2b-catalog-astro/src/components/react/{ProductGallery,FAQList}.tsx`
- Create: `templates/b2b-catalog-astro/src/lib/{seo,jsonld}.ts`
- Create: `templates/b2b-catalog-astro/tests/components/{ProductGallery,FAQList}.test.tsx`, `tests/build/routes-seo.test.mjs`

**Interfaces:**
- Consumes: `BrandCatalog`, public manifest entries, and shared cards.
- Produces: `getProductJsonLd(product, site): ProductJsonLd`; `getFaqJsonLd(faqs): FAQPageJsonLd`; keyboard-operable gallery and accordion.

- [ ] **Step 1: Write failing route, SEO, and component tests**

Assert one static product route per public product, canonical/OG tags, Product and FAQPage JSON-LD, internal links, 404, sitemap/robots, unique H1, gallery arrow/thumbnail/keyboard behavior, FAQ ARIA state, and all primary product content present before hydration.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --run tests/components/ProductGallery.test.tsx tests/components/FAQList.test.tsx tests/build/routes-seo.test.mjs`

Expected: FAIL because routes and metadata do not exist.

- [ ] **Step 3: Implement routes and progressive enhancement**

Render a useful first gallery image, thumbnail links, and FAQ answers in static HTML; React enhances controls without making content dependent on JavaScript.

- [ ] **Step 4: Run tests and inspect the generated route tree**

Run: `npm test && npm run build:preview`

Expected: PASS; `dist/products/*/index.html`, collection, contact, 404, sitemap, and robots exist; no cart or checkout route exists.

- [ ] **Step 5: Commit**

```powershell
git add templates/b2b-catalog-astro/src templates/b2b-catalog-astro/tests
git commit -m "feat: add static product and seo routes"
```

### Task 7: Implement the Inquiry Contract, Form, and Test Receiver

**Files:**
- Create: `templates/b2b-catalog-astro/src/inquiry/{types,schema,transport}.ts`
- Create: `templates/b2b-catalog-astro/src/components/react/InquiryForm.tsx`
- Create: `templates/b2b-catalog-astro/worker/inquiry-test-receiver.js`
- Create: `templates/b2b-catalog-astro/tests/inquiry/{schema,transport,InquiryForm}.test.tsx`
- Create: `projects/meldora-launch/inquiry-endpoint-contract.md`, `inquiry-evidence-template.md`
- Modify: `templates/b2b-catalog-astro/src/pages/contact.astro`, product inquiry CTAs

**Interfaces:**
- Produces: `InquiryPayload`; `InquiryResult = { status: "accepted"; inquiryId: string } | { status: "invalid" | "rate_limited" | "timeout" | "server_error" | "unavailable"; fieldErrors?: Record<string,string> }`; `submitInquiry(payload, config, signal): Promise<InquiryResult>`.
- Public configuration: `PUBLIC_INQUIRY_ENDPOINT`, `PUBLIC_CONTACT_EMAIL`, `PUBLIC_INQUIRY_TIMEOUT_MS`; no secret values.

- [ ] **Step 1: Write failing schema, transport, and form tests**

Cover wholesale versus one-set required fields, honeypot rejection, missing/malformed endpoint, accepted 2xx contract, 2xx without `accepted: true`, 400 field errors, 429, 5xx, timeout, repeated click, stale response after a new attempt, network failure, direct-email fallback, and focus placement on errors/success.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run tests/inquiry`

Expected: FAIL because inquiry code does not exist.

- [ ] **Step 3: Implement the receiver-independent contract and transport**

Validate client input for UX, abort at the configured timeout, attach page/product context, ignore client-submitted price as authority, and map every response class to the exact discriminated result.

- [ ] **Step 4: Implement the form state machine**

Disable duplicate submits while pending, show success only for `accepted`, expose a retry path for recoverable states, and always show the configured direct email when the endpoint is unavailable.

- [ ] **Step 5: Add a local deterministic receiver and production evidence template**

The local receiver records test payload IDs and can return the response matrix. The evidence template requires browser timestamp, receiver record/ID, notification acceptance, and a screenshot or message ID from the actual business inbox.

- [ ] **Step 6: Run inquiry tests**

Run: `npm test -- --run tests/inquiry`

Expected: PASS for every Review Focus failure mode; no test or client bundle contains credentials.

- [ ] **Step 7: Commit**

```powershell
git add templates/b2b-catalog-astro/src/inquiry templates/b2b-catalog-astro/src/components/react/InquiryForm.tsx templates/b2b-catalog-astro/worker templates/b2b-catalog-astro/tests/inquiry projects/meldora-launch
git commit -m "feat: add verifiable inquiry workflow"
```

### Task 8: Run Integrated E2E, Accessibility, and Visual Design QA

**Files:**
- Create: `templates/b2b-catalog-astro/playwright.config.ts`
- Create: `templates/b2b-catalog-astro/tests/e2e/{desktop,mobile,no-js,inquiry,a11y}.spec.ts`
- Create: `templates/b2b-catalog-astro/tests/visual/{desktop,mobile}.spec.ts`
- Create: `templates/b2b-catalog-astro/design-qa.md`
- Create test artifacts: `templates/b2b-catalog-astro/test-results/**` (ignore raw transient traces; retain approved comparison screenshots under `tests/visual/baselines/**`)

**Interfaces:**
- Consumes: complete local site and deterministic inquiry receiver.
- Produces: repeatable Playwright suite, approved desktop/mobile baselines, and `design-qa.md` with P0/P1/P2 disposition.

- [ ] **Step 1: Write E2E and visual assertions before fixing integration defects**

Cover desktop 1440×1000, mobile 390×844, navigation, all islands, product route, inquiry success/failure matrix, disabled JavaScript, reduced motion, keyboard-only flow, and axe scans on every route class.

- [ ] **Step 2: Run the suite and record expected initial failures**

Run: `npm run build:preview && npm run test:e2e`

Expected: at least the new baseline comparison and any integration defects fail; record them in `design-qa.md`.

- [ ] **Step 3: Compare against saved Givingli structural evidence**

Use the captured reference screenshots only for layout rhythm and interaction-state comparison. Check navigation, typography, spacing, section pacing, imagery, content, focus states, and responsive composition; do not force pixel imitation.

- [ ] **Step 4: Fix all P0/P1/P2 findings one at a time**

For each finding, add or tighten the owning automated assertion, apply the smallest fix, rerun that test, and mark the dated evidence path in `design-qa.md`.

- [ ] **Step 5: Run the complete verification matrix**

Run: `npm test && npm run build:preview && npm run test:e2e && npm run test:sites`

Expected: all pass; `design-qa.md` reports zero open P0/P1/P2, with desktop/mobile screenshots and manual keyboard results.

- [ ] **Step 6: Commit**

```powershell
git add templates/b2b-catalog-astro
git commit -m "test: verify meldora responsive experience"
```

### Task 9: Promote Reusable Components and Register the Project

**Files:**
- Create: `components/b2b-site-kit/README.md`, `package.json`, `package-lock.json`, `src/index.ts`, `src/types/index.ts`, `src/schema/index.ts`, `src/pricing/index.ts`, `src/components/index.ts`
- Move or extract: stable brand-agnostic code from `templates/b2b-catalog-astro/src/{domain,components/react}`
- Create: `components/b2b-site-kit/tests/public-api.test.ts`
- Modify: `templates/b2b-catalog-astro/package.json`, `package-lock.json`, and imports to consume `file:../../components/b2b-site-kit`
- Create/modify: `projects/meldora-launch/README.md`, `catalog/assets.json`, `docs/STATUS.md`, `docs/STORAGE.md`, `knowledge/CHANGELOG.md`

**Interfaces:**
- Produces: package exports for `Navigation`, `HeroProductSwitcher`, `WholesaleSteps`, `TierPriceDemo`, `ProductGallery`, `CollectionSwitch`, `FAQList`, `InquiryForm`, schemas, and pricing utilities.

- [ ] **Step 1: Write the failing public API test**

Import every promised export from the package root, render representative components with a second synthetic brand fixture, and assert no Meldora name, copy, path, or color is hard-coded in the reusable package.

- [ ] **Step 2: Run the test to verify it fails**

Run from `components/b2b-site-kit`: `npm test -- --run tests/public-api.test.ts`

Expected: FAIL because the package does not exist.

- [ ] **Step 3: Extract only validated boundaries**

Move shared types, schemas, pricing, and interactive components behind explicit props; keep Meldora page composition and content in the template/brand folders.

- [ ] **Step 4: Register assets and update handoff documents**

Add draft catalog entries for the brand, reference analysis, template, component kit, image set, and launch project; change to `verified` only where Task 8 provides evidence. Merge with existing documentation changes instead of overwriting them.

- [ ] **Step 5: Run package and site regression tests**

Run from `components/b2b-site-kit`: `npm test`. Then run from `templates/b2b-catalog-astro`: `npm test && npm run build:preview && npm run test:e2e`.

Expected: PASS using the package exports; catalog JSON validates and contains no `local-only` path or secret.

- [ ] **Step 6: Commit**

```powershell
git add components/b2b-site-kit templates/b2b-catalog-astro projects/meldora-launch catalog/assets.json docs/STATUS.md docs/STORAGE.md knowledge/CHANGELOG.md
git commit -m "feat: publish reusable b2b site kit"
```

### Task 10: Sync GitHub and Notion, Then Record Deployment Gates

**Files:**
- Modify: `projects/meldora-launch/README.md`, `inquiry-evidence-template.md`
- Modify if evidence changes status: `catalog/assets.json`, `docs/STATUS.md`, `knowledge/CHANGELOG.md`
- External records: GitHub repository `slliabc6/all-web`; Notion hub and `建站资产目录` database.

**Interfaces:**
- Consumes: green verification from Task 8, reusable entries from Task 9, GitHub remote access, Notion connection, and actual Hostinger/inquiry endpoint details if available.
- Produces: pushed commits, linked Notion records, and an explicit list of verified versus unverified production conditions.

- [ ] **Step 1: Run pre-sync verification**

Run `git status --short; git diff --check` from the repository root. Run `npm test` in the component package; run `npm test; npm run build:preview; npm run test:e2e` in the template. Run `npm run build:release` only after the USD review status is explicitly approved.

Expected: only intentional files remain, all checks pass, no private source or credentials are tracked.

- [ ] **Step 2: Push the reviewed branch to GitHub**

Push only after confirming the configured remote is `https://github.com/slliabc6/all-web`. Record the commit SHA and repository paths in the project handoff.

- [ ] **Step 3: Update Notion as a navigation layer**

Create or update records for the Givingli reference analysis, Meldora brand, Astro template, component kit, image derivative group, and launch handoff. Link GitHub paths and local locations; do not duplicate the product/price database in Notion.

- [ ] **Step 4: Verify the available Hostinger deployment path**

Record whether the account provides static file upload, Git deployment, SSH, or VPS access; document the selected upload directory and rollback method. If access is absent, leave deployment explicitly `unverified` rather than guessing.

- [ ] **Step 5: Verify the real inquiry chain when endpoint access exists**

Submit one labeled test inquiry and collect all four evidence layers: browser accepted, receiver record, notification provider accepted, and actual email received at the confirmed business inbox. If any layer is unavailable, do not claim production inquiry completion.

- [ ] **Step 6: Commit final evidence/status changes and push**

```powershell
git add projects/meldora-launch catalog/assets.json docs/STATUS.md knowledge/CHANGELOG.md
git commit -m "docs: record meldora launch verification"
git push origin main
```

Expected: GitHub and Notion point to the same reviewed commit; the handoff clearly distinguishes local-ready, GitHub-synced, Hostinger-deployed, and mailbox-verified states.

## Completion Gate

Do not mark this plan complete until:

- All project tests, static build, E2E, hosting-worker checks, and asset validation pass.
- `design-qa.md` has zero open P0/P1/P2 issues and includes final desktop/mobile evidence.
- The public site contains six publishable mahjong/accessory records, reviewed pricing state, no banned commerce flow, and no excluded Alabama content.
- Inquiry behavior is truthful at every state; production email is called complete only with four-layer evidence.
- Reusable components/assets are registered, the GitHub commit is linked, and Notion contains navigation/status records.
- Unavailable Hostinger or email credentials are reported as explicit external blockers, not silently substituted or invented.
