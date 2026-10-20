# 模块化静态购物站模板库实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建成一套可由品牌数据、商品数据、主题和站点配方批量生成纯前端购物展示站的 Astro 模板库。

**Architecture:** 模板库以共享 TypeScript 数据契约和 Astro 组件为核心，构建时选择站点配置并输出完整静态页面。主题只提供视觉令牌，站点配方只选择模块与变体；浏览器端脚本负责搜索、筛选、购物车和询盘，不接入后端。

**Tech Stack:** Astro、TypeScript、CSS 自定义属性、浏览器原生 JavaScript、Vitest、Playwright。

**Spec:** `docs/superpowers/specs/2026-10-20-modular-commerce-template-library-design.md`

## Global Constraints

- 页面和组件必须与品牌、商品内容分离。
- 默认语言为英文，数据结构允许中文；默认货币为 USD，不做实时汇率换算。
- 购物车、搜索和询盘全部为纯前端，不产生真实订单、支付或已发送邮件状态。
- 固定价、阶梯价和仅询价三种价格模式必须由同一商品组件支持。
- 每个生成网站只输出一份带 `index.html` 的常规静态资源目录。
- 静态成品不得依赖 CDN、在线字体、远程 API 或本地服务器。
- 第三方参考资产不得进入可发布模板，除非来源和许可记录明确允许。
- 程序内部稳定 ID 使用小写英文；面向用户的云盘与交付目录优先使用中文名称。

## Review Focus

- 商品字段缺失或图片不存在时，构建应给出带商品 ID 的明确错误，不得生成半成品页面。
- 旧版本或损坏的本地购物车数据应安全回退为空购物车，页面仍可操作。
- 仅询价商品和阶梯价商品不得被固定价求和逻辑误算为可结算订单。
- 嵌套商品详情页在 `file://` 下的图片、脚本、样式和跨页链接必须保持有效。
- 中英文内容不完整时必须按确定的回退规则显示，不得出现 `undefined`、空链接或混合字段名。

---

### Task 1: 建立模板工程与数据契约

**Files:**
- Create: `templates/static-commerce/package.json`
- Create: `templates/static-commerce/package-lock.json`
- Create: `templates/static-commerce/astro.config.mjs`
- Create: `templates/static-commerce/tsconfig.json`
- Create: `templates/static-commerce/src/domain/types.ts`
- Create: `templates/static-commerce/src/domain/schemas.ts`
- Create: `templates/static-commerce/src/domain/load-site.ts`
- Create: `templates/static-commerce/tests/unit/site-schema.test.ts`

**Interfaces:**
- Produces: `loadSite(siteId: string): Promise<SiteBundle>`。
- Produces: `SiteConfig`、`Brand`、`Category`、`Product`、`PriceMode`、`ThemeId`、`RecipeId`、`SiteBundle` 类型。
- Produces: 对品牌、站点、分类和商品 JSON 的构建时校验，错误包含文件路径与稳定 ID。

- [ ] **Step 1: 编写数据校验失败测试**

在 `site-schema.test.ts` 覆盖缺少商品 ID、重复 SKU、无效价格模式、无效推荐商品 ID、缺失英文默认文案和不存在图片路径。

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd templates/static-commerce; npm test -- --run tests/unit/site-schema.test.ts`

Expected: FAIL，因为数据类型和 `loadSite` 尚不存在。

- [ ] **Step 3: 初始化 Astro 与测试依赖并锁定依赖版本**

创建最小 Astro 工程，脚本至少包含 `dev`、`build`、`test`、`test:e2e`、`build:examples` 和 `verify:static`。提交 `package-lock.json`，不引入 React 或 UI 框架。

- [ ] **Step 4: 实现数据类型、校验与加载器**

`loadSite` 从 `sites/<site-id>/site.json` 读取配置，通过 `catalogId` 加载共享商品目录，并验证所有交叉引用和本地图片路径。

- [ ] **Step 5: 运行单元测试**

Run: `cd templates/static-commerce; npm test -- --run tests/unit/site-schema.test.ts`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add templates/static-commerce
git commit -m "feat: add commerce template data contracts"
```

### Task 2: 建立全站骨架、导航和信息页面

**Files:**
- Create: `templates/static-commerce/src/layouts/SiteLayout.astro`
- Create: `templates/static-commerce/src/components/navigation/SiteHeader.astro`
- Create: `templates/static-commerce/src/components/navigation/MobileNavigation.astro`
- Create: `templates/static-commerce/src/components/navigation/Breadcrumbs.astro`
- Create: `templates/static-commerce/src/components/navigation/SiteFooter.astro`
- Create: `templates/static-commerce/src/pages/index.astro`
- Create: `templates/static-commerce/src/pages/about.astro`
- Create: `templates/static-commerce/src/pages/wholesale.astro`
- Create: `templates/static-commerce/src/pages/contact.astro`
- Create: `templates/static-commerce/src/pages/404.astro`
- Create: `templates/static-commerce/src/styles/base.css`
- Create: `templates/static-commerce/tests/e2e/navigation.spec.ts`

**Interfaces:**
- Consumes: `SiteBundle` from Task 1。
- Produces: `SiteLayout` 的页面标题、描述、语言、主题、导航和页脚接口。
- Produces: 三种导航变体 `minimal`、`catalog`、`announcement`，以及两种页脚变体 `simple`、`columns`。

- [ ] **Step 1: 编写桌面与手机导航失败测试**

测试配置菜单顺序、手机菜单开关、搜索入口、购物车入口、当前页状态和无 JavaScript 时的基础链接可访问性。

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd templates/static-commerce; npm run test:e2e -- navigation.spec.ts`

Expected: FAIL，因为页面和导航尚不存在。

- [ ] **Step 3: 实现共享布局、导航和页脚**

菜单文字和链接完全来自站点配置；桌面和手机状态使用同一菜单数据。基础 CSS 提供可访问焦点、响应式容器和减少动效偏好支持。

- [ ] **Step 4: 实现信息页面骨架**

首页先渲染站点配方容器；关于、批发/零售、联系和 404 使用共享布局和品牌数据，不加入后端表单。

- [ ] **Step 5: 运行导航测试**

Run: `cd templates/static-commerce; npm run test:e2e -- navigation.spec.ts`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add templates/static-commerce/src templates/static-commerce/tests/e2e/navigation.spec.ts
git commit -m "feat: add reusable site shell and navigation"
```

### Task 3: 实现商品组件、列表、详情与搜索

**Files:**
- Create: `templates/static-commerce/src/domain/pricing.ts`
- Create: `templates/static-commerce/src/domain/search.ts`
- Create: `templates/static-commerce/src/components/product/ProductPrice.astro`
- Create: `templates/static-commerce/src/components/product/ProductCard.astro`
- Create: `templates/static-commerce/src/components/product/ProductGrid.astro`
- Create: `templates/static-commerce/src/components/product/ProductGallery.astro`
- Create: `templates/static-commerce/src/components/product/ProductOptions.astro`
- Create: `templates/static-commerce/src/pages/shop.astro`
- Create: `templates/static-commerce/src/pages/search.astro`
- Create: `templates/static-commerce/src/pages/products/[slug].astro`
- Create: `templates/static-commerce/src/scripts/product-search.ts`
- Create: `templates/static-commerce/tests/unit/pricing.test.ts`
- Create: `templates/static-commerce/tests/unit/search.test.ts`
- Create: `templates/static-commerce/tests/e2e/catalog.spec.ts`

**Interfaces:**
- Produces: `formatProductPrice(product: Product, currency: CurrencyConfig): PricePresentation`。
- Produces: `filterProducts(products: Product[], query: SearchQuery): Product[]`。
- Produces: 商品卡片变体 `standard`、`image-led`、`compact`。

- [ ] **Step 1: 编写价格与搜索失败测试**

覆盖固定价、原价、阶梯价、仅询价、英文查询、中文查询、分类、标签、无结果和空查询。

- [ ] **Step 2: 运行单元测试并确认失败**

Run: `cd templates/static-commerce; npm test -- --run tests/unit/pricing.test.ts tests/unit/search.test.ts`

Expected: FAIL，因为定价和搜索接口尚不存在。

- [ ] **Step 3: 实现定价、筛选和商品组件**

所有组件读取同一 `Product` 类型；缺失的可选字段不渲染空标签。图片必须包含尺寸、替代文字和本地路径。

- [ ] **Step 4: 实现商品列表、搜索和静态详情路由**

`[slug].astro` 使用 `getStaticPaths` 为有效商品生成详情页；搜索页面嵌入当前站点的必要商品索引，在浏览器本地过滤。

- [ ] **Step 5: 运行单元与浏览器测试**

Run: `cd templates/static-commerce; npm test -- --run tests/unit/pricing.test.ts tests/unit/search.test.ts; npm run test:e2e -- catalog.spec.ts`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add templates/static-commerce/src templates/static-commerce/tests
git commit -m "feat: add catalog product and search templates"
```

### Task 4: 实现本地购物车与询盘输出

**Files:**
- Create: `templates/static-commerce/src/domain/cart.ts`
- Create: `templates/static-commerce/src/domain/inquiry.ts`
- Create: `templates/static-commerce/src/components/cart/AddToCart.astro`
- Create: `templates/static-commerce/src/components/cart/CartLine.astro`
- Create: `templates/static-commerce/src/components/cart/CartDrawer.astro`
- Create: `templates/static-commerce/src/pages/cart.astro`
- Create: `templates/static-commerce/src/scripts/cart-client.ts`
- Create: `templates/static-commerce/tests/unit/cart.test.ts`
- Create: `templates/static-commerce/tests/unit/inquiry.test.ts`
- Create: `templates/static-commerce/tests/e2e/cart.spec.ts`

**Interfaces:**
- Produces: `CartStore`，包含 `load()`、`add(item)`、`update(lineId, quantity)`、`remove(lineId)`、`clear()` 和 `subscribe(listener)`。
- Produces: `buildInquiryText(cart: Cart, site: SiteConfig): string`。
- Produces: `buildMailtoUrl(text: string, site: SiteConfig): string`。
- 本地存储键固定为带版本号的 `all-web-cart:v1:<site-id>`。

- [ ] **Step 1: 编写购物车与询盘失败测试**

覆盖重复商品不同规格、数量修改、删除、损坏存储数据、固定价合计、阶梯价展示、仅询价、复制文本和 mailto 编码。

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd templates/static-commerce; npm test -- --run tests/unit/cart.test.ts tests/unit/inquiry.test.ts`

Expected: FAIL，因为购物车和询盘接口尚不存在。

- [ ] **Step 3: 实现购物车领域逻辑和浏览器适配器**

领域逻辑不直接访问 DOM；浏览器脚本负责 localStorage、事件绑定和页面同步。无法计算真实金额的商品显示为询价项，不伪造总价。

- [ ] **Step 4: 实现购物车页面、抽屉和询盘操作**

复制操作必须给出成功或失败反馈；邮件操作只打开草稿，界面明确说明仍需用户发送。

- [ ] **Step 5: 运行单元与浏览器测试**

Run: `cd templates/static-commerce; npm test -- --run tests/unit/cart.test.ts tests/unit/inquiry.test.ts; npm run test:e2e -- cart.spec.ts`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add templates/static-commerce/src templates/static-commerce/tests
git commit -m "feat: add local cart and inquiry flow"
```

### Task 5: 实现页面模块、主题和站点配方

**Files:**
- Create: `templates/static-commerce/src/components/sections/HeroSection.astro`
- Create: `templates/static-commerce/src/components/sections/CategorySection.astro`
- Create: `templates/static-commerce/src/components/sections/FeaturedProducts.astro`
- Create: `templates/static-commerce/src/components/sections/BrandStory.astro`
- Create: `templates/static-commerce/src/components/sections/WholesaleCallout.astro`
- Create: `templates/static-commerce/src/components/sections/FaqSection.astro`
- Create: `templates/static-commerce/src/recipes/section-registry.ts`
- Create: `templates/static-commerce/src/styles/themes/minimal.css`
- Create: `templates/static-commerce/src/styles/themes/natural.css`
- Create: `templates/static-commerce/src/styles/themes/luxury.css`
- Create: `templates/static-commerce/tests/unit/recipes.test.ts`
- Create: `templates/static-commerce/tests/e2e/themes.spec.ts`

**Interfaces:**
- Produces: `renderableSections(recipe: SiteRecipe): ResolvedSection[]`。
- Produces: 主题 ID `minimal`、`natural`、`luxury`。
- Produces: 销售模式 `retail`、`wholesale`、`hybrid` 对模块可见性和主要操作的规则。

- [ ] **Step 1: 编写站点配方失败测试**

覆盖未知模块、重复必需模块、无效组件变体、零售/批发/混合模式的操作按钮和模块可见性。

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd templates/static-commerce; npm test -- --run tests/unit/recipes.test.ts`

Expected: FAIL，因为模块注册表和主题尚不存在。

- [ ] **Step 3: 实现页面模块和注册表**

首页按配方顺序渲染模块；注册表是模块名称到 Astro 组件的唯一映射，不允许在品牌数据中写任意组件路径。

- [ ] **Step 4: 实现三个主题**

主题通过语义化 CSS 自定义属性覆盖视觉规则，组件不按品牌复制。字体使用系统字体栈或打包的本地字体。

- [ ] **Step 5: 运行配方与主题测试**

Run: `cd templates/static-commerce; npm test -- --run tests/unit/recipes.test.ts; npm run test:e2e -- themes.spec.ts`

Expected: PASS，且三个主题在桌面和手机截图中具有明显差异。

- [ ] **Step 6: 提交**

```bash
git add templates/static-commerce/src templates/static-commerce/tests
git commit -m "feat: add themes and composable page sections"
```

### Task 6: 建立共享示例商品与三个验证站点

**Files:**
- Create: `templates/static-commerce/data/catalogs/demo/categories.json`
- Create: `templates/static-commerce/data/catalogs/demo/products.json`
- Create: `templates/static-commerce/data/catalogs/demo/assets/`
- Create: `templates/static-commerce/sites/现代极简零售/site.json`
- Create: `templates/static-commerce/sites/现代极简零售/brand.json`
- Create: `templates/static-commerce/sites/自然生活批发/site.json`
- Create: `templates/static-commerce/sites/自然生活批发/brand.json`
- Create: `templates/static-commerce/sites/深色精品混合/site.json`
- Create: `templates/static-commerce/sites/深色精品混合/brand.json`
- Create: `templates/static-commerce/tests/integration/examples.test.ts`

**Interfaces:**
- Consumes: Tasks 1–5 的数据、组件、主题和配方接口。
- Produces: 三个站点配置，共用 `catalogId: "demo"`，分别验证零售、批发和混合模式。

- [ ] **Step 1: 编写示例站点集成失败测试**

断言三个站点加载同一商品 ID 集合、使用不同主题和销售模式，并都能生成九类页面。

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd templates/static-commerce; npm test -- --run tests/integration/examples.test.ts`

Expected: FAIL，因为示例数据和站点尚不存在。

- [ ] **Step 3: 建立公开安全的示例数据与本地素材**

使用可公开或自行生成的演示内容，不把 `local-only` 的公司原件直接复制进公开模板。商品同时覆盖三种价格模式、规格、颜色、MOQ 和库存展示状态。

- [ ] **Step 4: 建立三个站点配置**

目录使用中文名称，内部站点 ID 使用小写英文。三个站点只通过配置、主题和配方产生差异。

- [ ] **Step 5: 运行集成测试**

Run: `cd templates/static-commerce; npm test -- --run tests/integration/examples.test.ts`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add templates/static-commerce/data templates/static-commerce/sites templates/static-commerce/tests/integration
git commit -m "feat: add three composable commerce examples"
```

### Task 7: 输出单一静态网站成品

**Files:**
- Create: `templates/static-commerce/scripts/build-site.mjs`
- Create: `templates/static-commerce/scripts/build-examples.mjs`
- Create: `templates/static-commerce/scripts/verify-static-output.mjs`
- Create: `templates/static-commerce/tests/unit/static-paths.test.ts`
- Create: `templates/static-commerce/tests/e2e/static-output.spec.ts`
- Create: `templates/static-commerce/exports/.gitkeep`

**Interfaces:**
- Produces: `buildSite(siteDirectory: string): Promise<BuildResult>`。
- Produces: `exports/<站点名称>/网站成品/`。
- Produces: 静态路径转换函数 `rewriteStaticReferences(html: string, pagePath: string): string`。

- [ ] **Step 1: 编写静态路径失败测试**

覆盖根页面、嵌套商品页、带查询字符串和锚点的链接、图片、CSS、脚本以及已经是相对路径的引用。

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd templates/static-commerce; npm test -- --run tests/unit/static-paths.test.ts`

Expected: FAIL，因为构建与转换脚本尚不存在。

- [ ] **Step 3: 实现单站点和批量构建脚本**

每次构建使用独立临时输出，避免并行写入同一目录。成功后再原子地放入中文交付目录。

- [ ] **Step 4: 实现单一静态成品转换与完整性检查**

检查所有 HTML 内部引用均指向包内存在的文件；发现缺失文件、绝对站内路径或远程请求时构建失败。

- [ ] **Step 5: 通过 HTTP 与 file:// 浏览器验证**

Run: `cd templates/static-commerce; npm run build:examples; npm run verify:static; npm run test:e2e -- static-output.spec.ts`

Expected: 三个网站成品目录生成；九类页面、图片、导航、搜索和购物车通过；外部 HTTP 请求为零。

- [ ] **Step 6: 提交**

```bash
git add templates/static-commerce/scripts templates/static-commerce/tests templates/static-commerce/exports/.gitkeep templates/static-commerce/package.json
git commit -m "feat: export single static site bundle"
```

### Task 8: 登记模板资产与使用说明

**Files:**
- Create: `templates/static-commerce/README.md`
- Modify: `templates/README.md`
- Modify: `catalog/assets.json`
- Modify: `docs/STATUS.md`
- Modify: `docs/STORAGE.md`
- Modify: `knowledge/CHANGELOG.md`

**Interfaces:**
- Consumes: Tasks 1–7 的最终命令、输入字段、输出路径和验证结果。
- Produces: 可由新会话独立执行的模板说明、资产索引和状态记录。

- [ ] **Step 1: 编写模板使用说明**

说明新增站点、品牌、商品、主题和配方的方法；列出真实存在的安装、开发、测试、构建和静态成品验证命令。

- [ ] **Step 2: 更新资产索引和存储说明**

新增模板、导航、商品模块、页面模板和主题记录；云盘固定目录使用中文名称，程序内部 ID 保持英文。

- [ ] **Step 3: 更新状态和变更记录**

只记录实际完成并验证的能力；参考网站爬取和云盘上传仍标记为下一阶段，除非本任务中确实执行。

- [ ] **Step 4: 运行最终验证**

Run: `cd templates/static-commerce; npm test -- --run; npm run build:examples; npm run verify:static; npm run test:e2e`

Expected: 所有测试通过，三个站点的网站成品目录存在。

Run: `cd ../..; Get-Content -Raw -Encoding utf8 catalog/assets.json | ConvertFrom-Json | Out-Null; git diff --check`

Expected: JSON 解析成功，`git diff --check` 无输出。

- [ ] **Step 5: 提交**

```bash
git add templates/static-commerce templates/README.md catalog/assets.json docs/STATUS.md docs/STORAGE.md knowledge/CHANGELOG.md
git commit -m "docs: register modular commerce template library"
```

## 后续独立阶段

模板库通过上述验证后，再单独制定参考网站采集计划。该阶段负责筛选并分析 30–50 个公开网站、保存截图和结构记录、上传到“小李”Google Drive 的 `网页模板资产库/参考网站/`，不与模板实现任务混合。

