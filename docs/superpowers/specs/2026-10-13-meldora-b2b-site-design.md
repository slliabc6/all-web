# Meldora Mahjong B2B 询盘站设计规格

日期：2026-10-13

状态：已通过对话设计确认，等待书面规格复核

参考页面：https://givingli.com/

目标仓库：D:\all-web

## 1. 目标与成功标准

建立第一套可复用的多品牌静态网站母版。首站使用暂定品牌 **Meldora Mahjong**，主要服务海外批发商、零售商、俱乐部、赛事及礼赠采购，也允许个人按公开零售价询问单副购买。

首版成功必须同时满足：

1. 首页和产品详情输出可索引的完整静态 HTML。
2. 桌面与移动端保留 Givingli 的长页 editorial 节奏、强色块、超大标题、sticky 分步演示、轮播、切换器、画廊、FAQ 和移动菜单，但不复制其商标、文案或礼品业务内容。
3. 所有产品展示使用本地产品资料及获准发布的衍生图。
4. 批发阶梯价和个人单副价公开展示；个人价遵循约 43% 上浮的商业规则。
5. 询盘表单只有在接收服务明确返回已接受时才显示成功；上线验收必须记录业务邮箱实际收件。
6. 导航、产品卡、产品/配件切换、画廊、交互展示、FAQ、询盘表单和设计令牌形成可复用资产。
7. GitHub 保存可公开的代码、结构化内容和衍生素材；Notion 保存导航、审核状态和链接；本地 local-only 保存原件与私人资料。

## 2. 范围

首版包含：

- 一个英文优先、响应式的品牌官网。
- 首页、产品集合页、产品详情页和联系/询盘页。
- 六套麻将与一个麻将收纳包。
- 可配置的公开批发阶梯价和个人单副价。
- 邮箱询盘前端、传输适配器及可验证状态。
- 可复用 React 交互组件和 Astro 页面母版。
- 产品图片的 AI 美化衍生版本及资产清单。
- 单元、组件、静态输出、端到端与视觉对比验证。
- GitHub 资产索引、项目交接和 Notion 资产目录更新。

首版不包含购物车、在线支付、订单、登录、客户后台、实时库存、ERP 同步、运行时 CMS、双向 Notion 同步，以及未核实的现货、交期、认证、销量、评价或产能数字。

## 3. 技术架构

采用 **Astro 静态生成 + React Islands**：

- Astro 负责路由、内容装载、SEO、静态 HTML 和构建产物。
- React 只负责需要浏览器状态的导航菜单、Hero 轮播、价格演示、画廊、产品/配件切换、案例轮播和询盘表单。
- 普通正文、产品摘要和 FAQ 首次渲染均存在于静态 HTML；JavaScript 失败时仍能阅读和导航。
- 构建产物部署到 Hostinger 静态目录。具体上传、Git 集成、SSH 与回滚方式根据实际套餐核实。
- 询盘接收与静态站分层。前端只持有公开 endpoint 配置，不包含 SMTP、邮件 API 密钥或私密 token。

数据流：

    品牌/产品 JSON + FAQ + 资产清单
                  ↓
        Schema 校验与价格派生
                  ↓
       Astro 生成静态页面与 SEO
                  ↓
     React Islands 提供局部交互
                  ↓
      Hostinger 托管静态构建产物
                  ↓
    外部接收端校验并记录 → 通知服务 → 业务邮箱

## 4. 页面信息架构

### 顶部提示与导航

- 批发提示栏展示批量采购、定制与询价入口。
- Sticky 导航：Collections、Craft、Wholesale、FAQ、Contact。
- 主 CTA：Request Wholesale Pricing。
- 移动端显示品牌、主 CTA 和汉堡菜单。

### Hero

- 暂定品牌：**Meldora Mahjong**。
- 主标题：**Mahjong sets your customers won’t forget.**
- 副标题：**Original acrylic mahjong collections crafted for retailers, gifting programs and memorable game nights.**
- 主 CTA：Request Wholesale Pricing。
- 次 CTA：Explore the Collection。
- 黄金西海岸为首屏默认产品；可切换万圣紫色斗牛犬、粉色哥特式甜点和加厚款白色赛马场。
- 桌面使用散落牌面与中央超大标题；移动端改成单卡轮播。

### 编号式产品叙事

沿用参考页面的编号、标题、正文、CTA 与大幅图文交替节奏，内容分为：

1. Signature Collections
2. Statement Collections
3. Bags & Accessories

每一块都有可达的询盘入口，不出现 Add to cart 或 Checkout。

### 批发流程

三步为 Choose a collection、Tell us quantity and market、Receive quote and sample plan。桌面采用 sticky 演示和前后控制；移动端按顺序展示全部步骤。

### 使用场景

桌面三列、移动两列：Retail、Club、Tournament、Corporate Gift、Hotel、Private Event。卡片支持轻微图片放大和箭头位移，并遵守 reduced-motion 设置。

### 数量与价格演示

- 切换 1 / 3 / 100 sets。
- 同步更新产品图、适用价格、批发说明和 CTA。
- 只展示配置中存在的阶梯；没有 100 副档的产品不虚构价格。
- 配件单位使用 item，麻将单位使用 set。
- 交互不维护购物车状态，不创建订单。

### 工艺画廊、产品切换与 FAQ

- 画廊包含首图、缩略图、前后切换、键盘操作和可选灯箱；无 JavaScript 时仍可浏览。
- Mahjong Sets / Accessories 分段切换，移动端保留下一卡露边。
- 产品卡显示批发起价、MOQ 或阶梯提示、个人单副价和询盘 CTA。
- 没有真实评价时不制造用户姓名、引语或评分。
- FAQ 使用可访问的 accordion，并输出 FAQPage JSON-LD。
- 联系区包含完整询盘表单、直接邮箱和经业务确认的响应预期。

## 5. 视觉系统

- 现代 editorial sans、大尺度留白、超大标题、整块纯色分区。
- 核心调色：ink #24120B、paper #F2EDE4、coral #CF3E32、coast #A8C94A、sky #CBDDEA、white #FFFFFF。
- 主内容矩形保持硬朗；按钮、产品卡、FAQ 与标签使用适度圆角。
- 动效包含轻微悬浮、缓慢视差、柔和光泽、轮播和 150–700ms 状态过渡。
- prefers-reduced-motion 下取消持续动画和非必要位移。
- 令牌集中定义，不散落为页面内硬编码。

## 6. 产品与价格

初始产品：

- 黄金西海岸：首屏主推，四层内印雕刻。
- 万圣紫色斗牛犬：季节/主题系列。
- 粉色哥特式甜点：主题系列。
- 白色拉巴马：发布前核实英文名称、商标/授权和 11mm 批次图片。
- 棋盘格：常规系列。
- 加厚款白色赛马场：经典/加厚系列。
- 豹纹麻将收纳包：配件。

数据约束：

- 历史出货日期已经过去，首版显示 Lead time on request。
- 紫色斗牛犬和粉色甜点的 15mm/18mm 冲突在核实前不公开厚度。
- 白色拉巴马只使用确认属于 11mm 批次的图片；授权未核实前不得上线相关品牌元素。
- “可混批”不扩写为可跨全部款式凑 MOQ，除非业务确认。

金额规则：

- 金额以整数最小货币单位存储，禁止浮点金额。
- 源数据保留 CNY 货盘价和来源日期。
- 英文站的 USD 公开价是人工确认的发布值，不使用浏览器实时汇率。
- 内容必须记录 pricingReviewedAt、用于换算的 exchangeRate 和来源说明；缺少任一项则构建失败。
- 个人单副价由基础价上浮约 43%，再按配置尾数规则形成公开值。
- 固定覆盖价必须保留原因，并校验其与 43% 目标的偏差。
- 运费、关税和税费不包含在公开价中，并在价格附近说明。

## 7. 数据模型与组件边界

核心实体：

- SiteConfig：品牌、语言、货币、导航、联系、SEO、主题、询盘配置。
- Product：ID、slug、SKU、名称、描述、分类、图片、卖点、规格、价格、FAQ 与 SEO。
- Pricing：批发阶梯、个人价派生规则、尾数规则和运输税费说明。
- AssetManifestEntry：稳定资产 ID、角色、路径、尺寸、焦点、alt、权属、发布状态和 checksum。
- FAQ：稳定 ID、问题、答案、分类和排序。
- InquiryPayload：产品、数量、市场、公司、联系人、邮箱、电话、消息、同意状态和页面来源。

可复用组件：

- Navigation
- HeroProductSwitcher
- ProductStorySection
- WholesaleSteps
- UseCaseGrid
- TierPriceDemo
- ProductCard
- ProductGallery
- CollectionSwitch
- FAQList
- InquiryForm
- EditorialFooter

组件接受结构化数据，不直接读取具体产品文件夹或写死品牌文案。

## 8. 图片生成与资产管理

三层资产：

1. local-only/brands/麻将：原始图片、视频和内部资料，不提交 Git。
2. brands/meldora/assets/web：获准公开的 Web 衍生图。
3. brands/meldora/assets/manifest.json：页面使用的稳定资产索引。

美化原则：

- 使用图像生成/编辑工具统一背景、光线、构图、裁切与商业摄影质感。
- 保留真实牌面、颜色、层数、厚度和装饰细节，不生成与实物不符的工艺或配件。
- 营销氛围图与产品证据图分开标注。
- 原图不覆盖；衍生图记录源文件、用途、生成说明、审核状态、尺寸和 checksum。
- 输出响应式 AVIF/WebP/JPEG 并记录宽高。

首批方向：

- 黄金西海岸：暖阳海岸桌面、散牌特写、背纹与四层侧面。
- 加厚款白色赛马场：俱乐部/赛事桌面、奖章牌面和侧层。
- 粉色哥特式甜点：深色甜点桌景与黑粉牌面。
- 万圣紫色斗牛犬：季节主题场景与高对比牌面。
- 棋盘格：明亮日常桌面与花色平铺。
- 豹纹麻将收纳包：白底工艺证据图与搭配场景。

## 9. 询盘行为

表单提供 Wholesale inquiry 和 One-set inquiry 两种意向：

- 批发必填：产品、预计数量、目标国家、公司名、联系人、邮箱。
- 单副必填：产品、数量、目标国家、联系人、邮箱。
- 可选：电话/WhatsApp、定制需求、补充消息。
- 包含同意条款、蜜罐字段、重复提交保护和请求超时。
- 客户端做体验性校验，接收端重新校验所有字段。
- 只有接收端返回约定的 2xx 和 accepted 状态才显示“询盘已接收”。
- 网络错误、超时、429、5xx 与字段错误分别显示可恢复状态。
- 接收端不可用时显示直接邮箱，不伪造成功。
- 客户端提交的价格只作展示上下文；接收端按 product ID 和发布数据解释价格。

## 10. SEO、可访问性与响应式

- 每个产品有独立静态 URL、canonical、Open Graph、Product JSON-LD 和可核实规格。
- 生成 sitemap、robots 和有效 404。
- 标题层级唯一且连续。
- 所有图像有用途对应的 alt；装饰图为空 alt。
- 菜单、切换器、画廊、轮播、FAQ 和表单支持键盘、焦点、ARIA 状态和足够对比度。
- 桌面基准 1440×1000；移动基准 390×844。
- 移动端不简单缩小桌面：sticky 步骤改纵排，多卡网格改 1–2 列，横向轮播保留下一卡露边。

## 11. 测试与验收

自动化：

- Schema：重复 ID/slug、缺图、未知引用、未获发布权、缺失价格审核信息和冲突单位导致构建失败。
- 单元：阶梯价、43% 派生、尾数规则、货币最小单位、内容标准化和资产解析。
- 组件：移动菜单、轮播、价格切换、画廊、FAQ 和表单状态。
- 静态输出：每个路由含真实 HTML、SEO、内部链接；不存在购物车、支付或结账路由。
- E2E：桌面/移动关键路径、无 JavaScript 降级、慢网、重复提交、超时、429 和 5xx。
- 可访问性：自动扫描加键盘人工检查。

视觉验收：

- 保存 Givingli 桌面和移动参考截图作为结构证据，不作为可发布素材。
- 对同一视口、同一状态进行参考结构与实现截图对比。
- 检查字体、间距、颜色、图片质量、文案、导航、主要交互与响应式。
- 项目根目录必须生成 design-qa.md，P0/P1/P2 清零后才能交付。

真实询盘四层证据：

1. 浏览器提交成功。
2. 接收端接受并记录。
3. 通知服务接受。
4. 业务邮箱实际收件。

只有第 4 层通过，才能声明真实邮件链路完成。

## 12. GitHub 与 Notion

GitHub 是公开代码、结构化内容、已审核衍生图和技术状态的真源。新增模板、组件、品牌、产品、图片、参考分析和项目交接时更新 catalog/assets.json；新条目为 draft，实际验证后才改为 verified。更新 docs/STATUS.md 和 knowledge/CHANGELOG.md。不提交原图、客户询盘、密钥、未公开资料或未获授权的第三方内容。

Notion 只保存导航、审核状态、来源、使用权、本地位置和 GitHub 链接，不维护第二份独立产品与价格真源。本次完成后增加参考案例、品牌、母版、组件组、图像衍生组和项目交接记录。自动同步不属于首版。

## 13. 建议文件结构

    brands/meldora/
      brand.json
      content/site.json
      content/faqs.json
      content/products/*.json
      assets/manifest.json
      assets/web/

    components/b2b-site-kit/
      README.md
      src/types/
      src/schema/
      src/pricing/
      src/components/

    templates/b2b-catalog-astro/
      src/pages/
      src/layouts/
      src/sections/
      src/styles/
      src/lib/
      public/
      tests/

    projects/meldora-launch/
      README.md

首站先在模板内实现并验证。组件边界稳定后，再晋升到 components/b2b-site-kit，避免在尚未验证时过早抽象。

## 14. 交付定义

交付时必须存在：

- 可运行并通过构建的 Astro + React 项目。
- 桌面与移动端可检查的本地预览。
- 六套麻将与一个配件的结构化数据和公开价格。
- 经审核的首批 Web 图片衍生图与资产清单。
- 工作的询盘交互及接收端配置说明。
- 自动化测试、E2E 结果和通过的 design-qa.md。
- 更新后的资产索引、状态、变更记录、项目交接和 Notion 条目。
- 明确列出的未验证生产配置，尤其是 Hostinger 套餐与业务收件端点。
