# Meldora Mahjong B2B 网站实施计划

> **供智能体执行：** 必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 子技能，逐项实施本计划。所有步骤均使用复选框（`- [ ]`）跟踪。

**目标：** 建设一套高质量、可复用的 Astro + React 静态麻将 B2B 产品站，公开经审核的价格，提供真实可验证的邮件询盘，同时不包含购物车与结账功能。

**架构：** Astro 负责路由、内容读取、SEO 和静态 HTML；React Islands 只负责需要浏览器状态的交互。品牌数据、价格和素材清单独立于页面组件，并在构建前校验。静态站向环境变量指定的询盘接收端提交数据；本地测试使用确定性的模拟接收端，生产成功必须具备接收端、通知服务和业务邮箱证据。

**技术栈：** Product Design 原型模板、Astro、React 19、TypeScript、Zod、Vitest、Testing Library、Playwright、axe-core、Sharp、Node.js 20+、npm 锁文件、兼容 Hostinger 的静态构建产物。

**设计规格：** `docs/superpowers/specs/2026-10-13-meldora-b2b-site-design.md`

## 全局约束

- 必须先使用 Product Design 的 `prototype` 模板初始化 `templates/b2b-catalog-astro`，再转换为 Astro；不得跳过模板手工搭壳。
- 首页、集合页、产品页、询盘页、404、sitemap 和 robots 均输出完整静态 HTML；JavaScript 失效时，正文和导航仍然可读、可用。
- 只使用本地产品资料和获准发布的衍生素材；不得盗链或重新发布 Givingli 素材。
- 不得虚构评价、库存、发货日期、认证、产能、交期、商标权或产品规格。
- 金额使用整数最小货币单位。USD 为固定编辑价格，必须包含 `pricingReviewedAt`、`exchangeRate` 和来源说明；浏览器不得调用实时汇率接口。
- 个人单副价格遵循约 43% 上浮；人工覆盖价格必须记录原因；不存在的价格档不得补造。
- 不得加入购物车、支付、结账、登录、运行时 CMS 或任何客户端密钥。
- `local-only/**` 是私有源资料，严禁提交；可公开衍生图放在 `brands/meldora/assets/web/**`，并记录来源。
- Alabama 主题产品在英文名称、权利和 11 mm 图片批次核实前不得发布；紫色、粉色产品的 15/18 mm 冲突未解决前不得公开厚度。
- 只有接收端返回约定的 2xx 且 `accepted: true` 时，前端才显示成功；只有业务邮箱实际收件后，才能宣称生产邮件链路完成。
- 必须支持键盘、可见焦点、足够对比度、语义化标题、响应式布局和 `prefers-reduced-motion`。
- 保留工作区中不相关的修改和未跟踪文本文件；每个任务只暂存自己的文件。

## 重点审查项

1. 询盘 endpoint 缺失或格式错误时，必须提供直接邮件回退，且绝不能显示虚假成功；任务 7 用传输层与组件测试固定该行为。
2. 产品 slug 重复、素材引用缺失、素材未获发布权、价格审核元数据不完整时，必须在构建前失败；任务 2 覆盖这四类失败。
3. 没有 100 副价格档的产品不得显示该选项；配件必须使用 `item` 单位；任务 5 覆盖两种情况。
4. 禁用 JavaScript、开启 reduced motion、只用键盘时，内容与主导航仍须可用；任务 4、6、8 分别覆盖。
5. 重复提交、超时、429、5xx 和旧请求延迟返回时，必须显示不同的可恢复状态，且不得产生重复成功询盘；任务 7 覆盖完整失败矩阵。

---

## 文件分工与执行顺序

- `brands/meldora/**`：公开品牌文案、产品、已审核价格、衍生素材和素材清单。
- `templates/b2b-catalog-astro/**`：可运行的首站，以及单元、组件、构建、E2E 和视觉测试。
- `components/b2b-site-kit/**`：首站验证后提炼出的品牌无关 React 组件、数据契约和说明。
- `projects/meldora-launch/**`：上线交接、环境契约、询盘证据清单和未完成的生产门槛。
- `catalog/assets.json`、`docs/STATUS.md`、`docs/STORAGE.md`、`knowledge/CHANGELOG.md`：可复用资产目录和项目状态。
- `design-qa.md`：带日期的视觉/无障碍验证记录；交付时不得遗留 P0/P1/P2 问题。

执行关系：

1. 任务 1 先建立脚手架和测试环境。
2. 任务 2、3、7 可并行，文件所有权分别限定为产品数据、图片素材、询盘代码。
3. 任务 4～6 依赖任务 2～3，且共同修改页面组合，因此按顺序合并。
4. 任务 8 做集成验收，任务 9 提炼可复用资产，任务 10 完成外部同步并记录生产门槛。

### 任务 1：初始化并转换静态站脚手架

**文件：**

- 通过模板创建后修改：`templates/b2b-catalog-astro/package.json`、`package-lock.json`、`.npmrc`、`AGENTS.md`
- 替换：`vite.config.mjs`、`src/main.jsx`、`src/App.jsx`、`src/styles.css`
- 新建：`astro.config.mjs`、`tsconfig.json`、`src/pages/index.astro`、`src/layouts/SiteLayout.astro`、`src/styles/global.css`
- 新建测试：`tests/build/static-shell.test.mjs`
- 保留并适配：`.openai/hosting.json`、`scripts/prepare-sites-build.mjs`、`tests/sites-worker.test.mjs`、`worker/index.js`
- 未标前缀的路径均位于 `templates/b2b-catalog-astro/`。

**接口：**

- 输出命令：`dev`、`build:preview`、`build:release`、`preview`、`test`、`test:e2e`。
- 静态产物目录：`dist/`。
- 布局参数：`{ title: string; description: string; canonicalPath: string }`。
- `build:preview` 允许带醒目标记的草稿价格；`build:release` 拒绝草稿价格。

- [ ] **步骤 1：执行 Product Design 规定的初始化**

在 `D:\all-web` 运行：

```powershell
node "C:\Users\Administrator\.codex\plugins\cache\openai-curated-remote\product-design\0.1.56\scripts\bootstrap-prototype.mjs" --dest "D:\all-web\templates\b2b-catalog-astro"
```

预期：JSON 返回 `status: "created"`，目标目录含锁定版本的 React/Vite 模板和托管测试。

- [ ] **步骤 2：先写失败的静态壳测试**

断言 `npm run build:preview` 生成 `dist/index.html`，其中包含 `<h1>`、canonical 和可读占位内容，同时不存在 `Add to cart`、`Checkout` 或支付路由引用。

- [ ] **步骤 3：运行测试并确认失败**

运行：`npm test -- --run tests/build/static-shell.test.mjs`

预期：失败，原因是 Astro 构建和路由尚未创建。

- [ ] **步骤 4：转换为 Astro + React**

安装 Astro、`@astrojs/react`、TypeScript、Vitest、Testing Library、Playwright、axe-core、Zod 和 Sharp，并写入锁文件；配置 `output: "static"`。仅保留用于服务 `dist` 的托管 worker 契约。

- [ ] **步骤 5：运行基础检查**

运行：`npm test && npm run build:preview && npm run test:sites`

预期：全部通过，`dist/index.html` 含真实静态内容。

- [ ] **步骤 6：提交**

```powershell
git add templates/b2b-catalog-astro
git commit -m "feat: bootstrap meldora astro storefront"
```

### 任务 2：建立并校验品牌、产品和价格数据

**文件：**

- 新建：`brands/meldora/brand.json`、`content/site.json`、`content/faqs.json`、`content/pricing-review.json`
- 新建：`brands/meldora/content/products/{golden-west-coast,purple-bulldog,pink-gothic-dessert,checkerboard,white-racetrack,leopard-bag}.json`
- 仅以隔离草稿新建：`brands/meldora/content/drafts/white-alabama.json`
- 新建：`templates/b2b-catalog-astro/src/domain/{types,schemas,pricing,load-content}.ts`
- 新建测试：`templates/b2b-catalog-astro/tests/domain/{schemas,pricing,load-content}.test.ts`

**接口：**

- `loadBrandCatalog(root: URL): Promise<BrandCatalog>`
- `deriveRetailPrice(baseMinor: number, upliftBps: number, endingRule: PriceEndingRule): number`
- `validateCatalog(input: unknown): BrandCatalog`
- `BrandCatalog` 提供 `site`、`products`、`faqs` 和 `pricingReview`。
- 数量价格档为 `{ quantity: number; unit: "set" | "item"; unitPriceMinor: number }`。

- [ ] **步骤 1：先写失败的数据与价格测试**

覆盖合法样例，以及 slug 重复、素材 ID 缺失/未知、`publishable: false`、缺少 `pricingReviewedAt`、缺少 `exchangeRate`、固定覆盖价无原因、43% 派生、尾数规则、非整数金额、收纳包 `item` 单位和缺少 100 副档。

- [ ] **步骤 2：运行测试并确认失败**

运行：`npm test -- --run tests/domain`

预期：失败，原因是数据契约和内容尚不存在。

- [ ] **步骤 3：实现 Schema、定价和标准化读取器**

从 `local-only/brands/麻将/SWN货盘明细(1).xlsx` 整理当前可发布的六条记录（五套麻将和一个豹纹包）。保留原始 CNY 价格档和来源日期；增加固定 USD 候选表、计划换算说明和明确审核状态。`build:release` 必须拒绝 `reviewStatus !== "approved"`；`build:preview` 设置 `PUBLIC_ALLOW_DRAFT_PRICING=true` 并明显标出草稿价格。只有人工确认后才能改为 `approved`。

- [ ] **步骤 4：加入安全排除规则**

White Alabama 不进入公开读取器；紫色/粉色款不输出有争议的厚度；历史发货日期统一替换为 `Lead time on request`。

- [ ] **步骤 5：运行数据测试**

运行：`npm test -- --run tests/domain`

预期：全部通过，包含重点审查项中的四类数据失败。

- [ ] **步骤 6：提交**

```powershell
git add brands/meldora templates/b2b-catalog-astro/src/domain templates/b2b-catalog-astro/tests/domain
git commit -m "feat: add validated meldora product catalog"
```

### 任务 3：生成可公开的图片衍生图与素材清单

**文件：**

- 新建：`brands/meldora/assets/manifest.json`
- 新建：`brands/meldora/assets/web/{golden-west-coast,purple-bulldog,pink-gothic-dessert,checkerboard,white-racetrack,leopard-bag}/**.{avif,webp,jpg}`
- 新建：`templates/b2b-catalog-astro/scripts/{build-image-derivatives,verify-asset-manifest}.mjs`
- 新建测试：`templates/b2b-catalog-astro/tests/assets/manifest.test.ts`

**接口：**

- 清单条目：`{ id, productId, role, src, width, height, focalPoint, alt, rights, publishable, kind, sourceRef, generationNote, checksum }`。
- 素材解析：`resolveAsset(id: string): AssetManifestEntry`。

- [ ] **步骤 1：先写失败的素材清单测试**

断言 ID 稳定、路径唯一、文件存在、尺寸非零、checksum 正确、alt 合规、权利状态明确、源文件可追踪，并区分 `evidence` 与 `marketing` 图片。

- [ ] **步骤 2：运行测试并确认失败**

运行：`npm test -- --run tests/assets/manifest.test.ts`

预期：失败，原因是清单和公开衍生图尚不存在。

- [ ] **步骤 3：检查并筛选本地源图**

每批编辑前必须用 `view_image` 查看原图。排除 White Alabama，以及产品身份、厚度批次或权利不明确的文件。

- [ ] **步骤 4：生成 AI 美化营销图**

使用 `imagegen` 技能/工具调整背景、光线、构图和裁切。必须保留真实牌面、颜色、层数、厚度、包袋装饰和随附配件；生成的氛围图不得作为实物证据图。

- [ ] **步骤 5：生成响应式格式**

使用 Sharp 输出可复现的 AVIF/WebP/JPEG，不覆盖原始文件；将尺寸和 SHA-256 checksum 写入清单。

- [ ] **步骤 6：验证素材并人工查看联系表**

运行：`npm test -- --run tests/assets/manifest.test.ts && node scripts/verify-asset-manifest.mjs`

预期：不存在缺失、私有、未获批准或 checksum 不匹配的素材。

- [ ] **步骤 7：提交**

```powershell
git add brands/meldora/assets templates/b2b-catalog-astro/scripts templates/b2b-catalog-astro/tests/assets
git commit -m "feat: add reviewed meldora web imagery"
```

### 任务 4：实现编辑式页面外壳、导航、Hero 与产品叙事

**文件：**

- 新建 React：`src/components/react/{Navigation,HeroProductSwitcher}.tsx`
- 新建 Astro：`src/components/astro/{PromoBar,ProductStorySection,EditorialFooter}.astro`
- 新建/修改：`src/pages/index.astro`、`src/styles/{tokens,layout,motion}.css`
- 新建测试：`tests/components/{Navigation,HeroProductSwitcher}.test.tsx`、`tests/build/home-static.test.mjs`
- 以上路径均位于 `templates/b2b-catalog-astro/`。

**接口：**

- 输入：任务 1～3 的 `BrandCatalog`、素材 ID 与 `SiteLayout`。
- `NavigationProps { items, inquiryHref }`
- `HeroProductSwitcherProps { products: HeroProduct[]; reducedMotion?: boolean }`
- 产品叙事区必须服务端静态渲染。

- [ ] **步骤 1：先写失败的页面与交互测试**

断言已批准的 Hero 标题、副标题和 CTA、编号叙事标题、菜单焦点返回和 Escape、Hero 前后切换与标签、静态语义链接，以及 reduced motion 下不存在持续位移。

- [ ] **步骤 2：运行测试并确认失败**

运行：`npm test -- --run tests/components/Navigation.test.tsx tests/components/HeroProductSwitcher.test.tsx tests/build/home-static.test.mjs`

预期：失败，原因是对应区块尚不存在。

- [ ] **步骤 3：实现设计令牌与静态页面组合**

使用既定色彩 `#24120B`、`#F2EDE4`、`#CF3E32`、`#A8C94A`、`#CBDDEA`、`#FFFFFF`，实现大字号编辑感排版、硬朗主体区域、交替产品叙事，并重点适配 1440×1000 和 390×844。

- [ ] **步骤 4：实现 React 导航和 Hero Islands**

只水合这两个交互组件；首个 Hero 和全部叙事文案保留在服务端输出。移动端使用单卡轮播，不缩小桌面场景。

- [ ] **步骤 5：运行测试并保存基线截图**

运行：`npm test -- --run tests/components tests/build/home-static.test.mjs && npm run build:preview`

预期：全部通过；页面具有 Givingli 启发的节奏，但不复制其品牌素材和文案。

- [ ] **步骤 6：提交**

```powershell
git add templates/b2b-catalog-astro/src templates/b2b-catalog-astro/tests
git commit -m "feat: build meldora editorial landing shell"
```

### 任务 5：实现批发流程、使用场景、阶梯价演示和产品切换

**文件：**

- 新建 React：`src/components/react/{WholesaleSteps,TierPriceDemo,CollectionSwitch}.tsx`
- 新建 Astro：`src/components/astro/{UseCaseGrid,ProductCard}.astro`
- 修改：`src/pages/index.astro`、`src/styles/layout.css`
- 新建测试：`tests/components/{WholesaleSteps,TierPriceDemo,CollectionSwitch}.test.tsx`
- 以上路径均位于 `templates/b2b-catalog-astro/`。

**接口：**

- 输入：标准化的产品价格档和素材解析器。
- `TierPriceDemoProps { products: PricedProduct[]; defaultProductId: string }`
- `CollectionSwitchProps { sets: ProductSummary[]; accessories: ProductSummary[] }`

- [ ] **步骤 1：先写失败的交互测试**

断言三个有序批发步骤、鼠标/键盘切换、静态和移动端均可阅读全部步骤、六种使用场景、麻将/配件切换、移动端下一卡露边、缺失的 100 副档不显示、包袋使用 `item`、税费/运费说明和纯询盘 CTA。

- [ ] **步骤 2：运行测试并确认失败**

运行：`npm test -- --run tests/components/WholesaleSteps.test.tsx tests/components/TierPriceDemo.test.tsx tests/components/CollectionSwitch.test.tsx`

预期：失败，原因是交互区块尚不存在。

- [ ] **步骤 3：实现上述区块**

桌面批发流程采用 sticky 媒体和明确控制；移动端完整纵向展示。价格状态只能从产品数据派生，不维护购物车或订单状态。

- [ ] **步骤 4：运行局部和完整测试**

运行：`npm test -- --run tests/components && npm run build:preview`

预期：通过；单位正确，不存在的价格档被省略。

- [ ] **步骤 5：提交**

```powershell
git add templates/b2b-catalog-astro/src templates/b2b-catalog-astro/tests/components
git commit -m "feat: add b2b catalog interactions"
```

### 任务 6：实现集合页、产品页、画廊、FAQ 与 SEO

**文件：**

- 新建页面：`src/pages/collections/index.astro`、`src/pages/products/[slug].astro`、`src/pages/contact.astro`、`src/pages/404.astro`、`src/pages/robots.txt.ts`、`src/pages/sitemap.xml.ts`
- 新建 React：`src/components/react/{ProductGallery,FAQList}.tsx`
- 新建：`src/lib/{seo,jsonld}.ts`
- 新建测试：`tests/components/{ProductGallery,FAQList}.test.tsx`、`tests/build/routes-seo.test.mjs`
- 以上路径均位于 `templates/b2b-catalog-astro/`。

**接口：**

- 输入：`BrandCatalog`、公开素材清单和共享产品卡。
- `getProductJsonLd(product, site): ProductJsonLd`
- `getFaqJsonLd(faqs): FAQPageJsonLd`
- 输出支持键盘的画廊和 FAQ accordion。

- [ ] **步骤 1：先写失败的路由、SEO 与组件测试**

断言每个公开产品都有静态路由、canonical/OG、Product 和 FAQPage JSON-LD、内部链接、404、sitemap/robots、唯一 H1、画廊箭头/缩略图/键盘操作、FAQ ARIA 状态，并保证主要产品内容在水合前已存在。

- [ ] **步骤 2：运行测试并确认失败**

运行：`npm test -- --run tests/components/ProductGallery.test.tsx tests/components/FAQList.test.tsx tests/build/routes-seo.test.mjs`

预期：失败，原因是路由和元数据尚不存在。

- [ ] **步骤 3：实现路由和渐进增强**

静态 HTML 必须输出首张画廊图、缩略图链接和 FAQ 答案；React 只增强交互，不让内容依赖 JavaScript。

- [ ] **步骤 4：运行测试并检查构建目录**

运行：`npm test && npm run build:preview`

预期：通过；`dist/products/*/index.html`、集合、联系、404、sitemap、robots 均存在；不存在购物车或结账路由。

- [ ] **步骤 5：提交**

```powershell
git add templates/b2b-catalog-astro/src templates/b2b-catalog-astro/tests
git commit -m "feat: add static product and seo routes"
```

### 任务 7：实现询盘契约、表单和测试接收端

**文件：**

- 新建：`templates/b2b-catalog-astro/src/inquiry/{types,schema,transport}.ts`
- 新建：`templates/b2b-catalog-astro/src/components/react/InquiryForm.tsx`
- 新建：`templates/b2b-catalog-astro/worker/inquiry-test-receiver.js`
- 新建测试：`templates/b2b-catalog-astro/tests/inquiry/{schema,transport,InquiryForm}.test.tsx`
- 新建：`projects/meldora-launch/inquiry-endpoint-contract.md`、`inquiry-evidence-template.md`
- 修改：联系页和产品询盘 CTA。

**接口：**

- `InquiryPayload`
- `InquiryResult = { status: "accepted"; inquiryId: string } | { status: "invalid" | "rate_limited" | "timeout" | "server_error" | "unavailable"; fieldErrors?: Record<string,string> }`
- `submitInquiry(payload, config, signal): Promise<InquiryResult>`
- 公开配置：`PUBLIC_INQUIRY_ENDPOINT`、`PUBLIC_CONTACT_EMAIL`、`PUBLIC_INQUIRY_TIMEOUT_MS`；不得包含私密值。

- [ ] **步骤 1：先写失败的 Schema、传输层和表单测试**

覆盖批发/单副必填差异、蜜罐、endpoint 缺失/格式错误、2xx accepted、2xx 但未 accepted、400 字段错误、429、5xx、超时、重复点击、新尝试后的旧响应、网络失败、直接邮件回退，以及错误/成功后的焦点位置。

- [ ] **步骤 2：运行测试并确认失败**

运行：`npm test -- --run tests/inquiry`

预期：失败，原因是询盘模块尚不存在。

- [ ] **步骤 3：实现与接收服务解耦的契约和传输层**

客户端校验只用于体验；按配置超时取消请求；附加页面/产品上下文；客户端价格不得作为接收端权威价格；所有响应必须映射为明确的联合类型结果。

- [ ] **步骤 4：实现表单状态机**

请求中阻止重复提交；只有 `accepted` 才显示成功；可恢复错误提供重试；endpoint 不可用时始终展示配置的直接邮箱。

- [ ] **步骤 5：建立本地确定性接收端和生产证据模板**

本地接收端记录测试 payload ID，并能返回完整响应矩阵。证据模板必须记录浏览器时间、接收端记录/ID、通知服务接受结果、业务邮箱实际消息 ID 或截图。

- [ ] **步骤 6：运行询盘测试**

运行：`npm test -- --run tests/inquiry`

预期：重点审查项中的所有失败情况均通过；测试和客户端 bundle 中没有凭据。

- [ ] **步骤 7：提交**

```powershell
git add templates/b2b-catalog-astro/src/inquiry templates/b2b-catalog-astro/src/components/react/InquiryForm.tsx templates/b2b-catalog-astro/worker templates/b2b-catalog-astro/tests/inquiry projects/meldora-launch
git commit -m "feat: add verifiable inquiry workflow"
```

### 任务 8：执行集成 E2E、无障碍和视觉设计验收

**文件：**

- 新建：`templates/b2b-catalog-astro/playwright.config.ts`
- 新建：`tests/e2e/{desktop,mobile,no-js,inquiry,a11y}.spec.ts`
- 新建：`tests/visual/{desktop,mobile}.spec.ts`
- 新建：`design-qa.md`
- 临时 trace 不提交；批准的对比截图保留在 `tests/visual/baselines/**`。
- 未标前缀的路径均位于 `templates/b2b-catalog-astro/`。

**接口：**

- 输入：完整本地站点和确定性询盘接收端。
- 输出：可重复的 Playwright 测试、批准的桌面/移动基线，以及含 P0/P1/P2 处理结果的 `design-qa.md`。

- [ ] **步骤 1：先写 E2E 与视觉断言**

覆盖 1440×1000、390×844、导航、所有 Islands、产品页、询盘成功/失败矩阵、禁用 JavaScript、reduced motion、纯键盘流程，以及每类路由的 axe 扫描。

- [ ] **步骤 2：运行测试并记录首轮失败**

运行：`npm run build:preview && npm run test:e2e`

预期：新基线比较和发现的集成问题失败；全部记录到 `design-qa.md`。

- [ ] **步骤 3：与 Givingli 参考证据做结构对比**

参考截图只用于布局节奏和交互状态。检查导航、字体、间距、色彩、区块节奏、图片、文案、焦点状态和响应式构图，不追求像素级仿制。

- [ ] **步骤 4：逐项修复全部 P0/P1/P2**

每个问题先添加或加强对应自动化断言，再实施最小修复并复测；在 `design-qa.md` 记录日期和证据路径。

- [ ] **步骤 5：运行完整验证矩阵**

运行：`npm test && npm run build:preview && npm run test:e2e && npm run test:sites`

预期：全部通过；`design-qa.md` 无未解决 P0/P1/P2，并含桌面/移动截图和人工键盘检查结果。

- [ ] **步骤 6：提交**

```powershell
git add templates/b2b-catalog-astro
git commit -m "test: verify meldora responsive experience"
```

### 任务 9：提炼可复用组件并登记项目资产

**文件：**

- 新建：`components/b2b-site-kit/README.md`、`package.json`、`package-lock.json`、`src/index.ts`、`src/types/index.ts`、`src/schema/index.ts`、`src/pricing/index.ts`、`src/components/index.ts`
- 从模板的 `src/{domain,components/react}` 提炼稳定的品牌无关代码。
- 新建测试：`components/b2b-site-kit/tests/public-api.test.ts`
- 修改模板的 `package.json`、`package-lock.json` 和 imports，使用 `file:../../components/b2b-site-kit`。
- 新建/修改：`projects/meldora-launch/README.md`、`catalog/assets.json`、`docs/STATUS.md`、`docs/STORAGE.md`、`knowledge/CHANGELOG.md`

**接口：**

- 包根目录导出 `Navigation`、`HeroProductSwitcher`、`WholesaleSteps`、`TierPriceDemo`、`ProductGallery`、`CollectionSwitch`、`FAQList`、`InquiryForm`、Schemas 和定价工具。

- [ ] **步骤 1：先写失败的公共 API 测试**

从包根目录导入全部承诺导出项，使用第二个虚构品牌 fixture 渲染代表组件，并断言可复用包中没有写死 Meldora 名称、文案、路径或色彩。

- [ ] **步骤 2：运行测试并确认失败**

在 `components/b2b-site-kit` 运行：`npm test -- --run tests/public-api.test.ts`

预期：失败，原因是组件包尚不存在。

- [ ] **步骤 3：只提炼经过验证的边界**

将公共类型、Schema、定价和交互组件改为显式 props；Meldora 页面组合与内容仍保留在模板/品牌目录。

- [ ] **步骤 4：登记资产并更新交接文档**

为品牌、参考分析、模板、组件包、图片组和上线项目增加目录条目；新条目默认为 `draft`，只有任务 8 有证据的项目才能改为 `verified`。合并已有文档修改，不覆盖。

- [ ] **步骤 5：运行组件包和站点回归测试**

在 `components/b2b-site-kit` 运行 `npm test`；再在模板目录运行 `npm test && npm run build:preview && npm run test:e2e`。

预期：站点通过包导出项运行；目录 JSON 合法，且没有 `local-only` 路径或秘密信息。

- [ ] **步骤 6：提交**

```powershell
git add components/b2b-site-kit templates/b2b-catalog-astro projects/meldora-launch catalog/assets.json docs/STATUS.md docs/STORAGE.md knowledge/CHANGELOG.md
git commit -m "feat: publish reusable b2b site kit"
```

### 任务 10：同步 GitHub 与 Notion，并记录部署门槛

**文件与外部对象：**

- 修改：`projects/meldora-launch/README.md`、`inquiry-evidence-template.md`
- 视证据修改：`catalog/assets.json`、`docs/STATUS.md`、`knowledge/CHANGELOG.md`
- GitHub：`slliabc6/all-web`
- Notion：首页与 `建站资产目录` 数据库。

**接口：**

- 输入：任务 8 的绿色验证、任务 9 的可复用条目、GitHub/Notion 连接，以及可用时的 Hostinger 和询盘 endpoint 信息。
- 输出：已推送提交、已链接 Notion 记录，以及明确区分已验证/未验证的生产状态。

- [ ] **步骤 1：运行同步前检查**

在仓库根目录运行 `git status --short; git diff --check`；在组件包运行 `npm test`；在模板运行 `npm test; npm run build:preview; npm run test:e2e`。只有 USD 状态明确批准后才运行 `npm run build:release`。

预期：只剩有意变更；所有检查通过；没有私有源文件或凭据被跟踪。

- [ ] **步骤 2：推送到 GitHub**

先确认远端为 `https://github.com/slliabc6/all-web`，再推送已审核分支；将 commit SHA 和仓库路径写入项目交接。

- [ ] **步骤 3：将 Notion 更新为导航层**

创建或更新 Givingli 参考分析、Meldora 品牌、Astro 模板、组件包、图片衍生组和项目交接记录。链接 GitHub 路径和本地位置，不在 Notion 维护第二套产品/价格数据库。

- [ ] **步骤 4：核实实际 Hostinger 部署方式**

记录账户究竟支持静态文件上传、Git 部署、SSH 还是 VPS；写明最终上传目录和回滚方式。没有访问权时标为 `unverified`，不得猜测。

- [ ] **步骤 5：在具备 endpoint 权限后验证真实询盘链路**

提交一条明确标记的测试询盘，收集四层证据：浏览器 accepted、接收端记录、通知服务接受、业务邮箱实际收件。缺少任一层都不得宣称生产询盘完成。

- [ ] **步骤 6：提交最终证据/状态并推送**

```powershell
git add projects/meldora-launch catalog/assets.json docs/STATUS.md knowledge/CHANGELOG.md
git commit -m "docs: record meldora launch verification"
git push origin main
```

预期：GitHub 与 Notion 指向同一审核提交；交接文件明确区分“本地可运行”“已同步 GitHub”“已部署 Hostinger”“业务邮箱已验证”四种状态。

## 完成门槛

满足以下全部条件后才能标记计划完成：

- 项目测试、静态构建、E2E、托管 worker 和素材校验全部通过。
- `design-qa.md` 不存在未解决 P0/P1/P2，并包含最终桌面/移动证据。
- 公共站点包含六条可发布的麻将/配件记录、经过审核的价格状态，不包含被禁止的交易流程或 Alabama 内容。
- 所有询盘状态均真实；只有取得四层证据后才称生产邮件完成。
- 可复用组件/素材已登记，GitHub 提交已链接，Notion 已建立导航/状态记录。
- Hostinger 或邮件凭据不可用时，必须作为明确外部阻塞项记录，不得静默替代或虚构。
