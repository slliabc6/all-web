# 模块化静态购物站模板

这是首批可复用的 Astro 静态购物站模板。品牌、商品、主题和页面配方分离；搜索、规格选择、购物车、复制询盘清单和邮件草稿均在浏览器前端运行，不包含支付、订单、登录或后台。

## 已有页面与组合

共享页面包含：首页、商品列表/分类、商品详情、搜索、购物车、关于我们、批发/零售、联系/询盘和 404。

三个示例站共用 `data/catalogs/demo/` 的商品数据：

- `sites/现代极简零售/`：现代极简主题、零售展示模式。
- `sites/自然生活批发/`：自然生活主题、批发询盘模式。
- `sites/深色精品混合/`：深色精品主题、批发与零售混合模式。

主题位于 `src/styles/themes/`，站点配方位于 `recipes/`，导航、商品、购物车和页面模块位于 `src/components/`。

## 使用命令

在本目录运行：

```powershell
npm install
npm run dev
npm test -- --run
npm run test:e2e
npm run build:examples
npm run verify:static
```

开发服务器默认读取 `sites/现代极简零售/`。可用环境变量选择其他站点，例如：

```powershell
$env:SITE_ID = "自然生活批发"
npm run dev
```

`npm run build:examples` 为每个站点生成唯一的一份成品：

```text
exports/<中文站点名>/网站成品/
└─ index.html
```

整个 `网站成品` 文件夹是交付单位。可以从 `index.html` 打开，也可以原样上传到普通静态托管目录；图片、样式和脚本都在文件夹内，不使用 CDN、在线字体或远程 API。`exports/` 中的构建结果被 Git 忽略，需要时重新生成。

## 新增站点

1. 复制 `sites/现代极简零售/` 为新的中文站点目录。
2. 修改 `site.json`：内部 `id` 使用稳定的小写英文标识，选择 `themeId`、`recipeId`、`salesMode`、导航、邮箱和功能开关。
3. 修改 `brand.json` 中英文品牌名称、介绍和首页文案。
4. 若使用现有商品库，保留对应 `catalogId`；否则在 `data/catalogs/<英文-id>/` 新建 `products.json`、`categories.json` 和 `assets/`，再更新站点的 `catalogId`。
5. 用 `SITE_ID=<中文目录名> npm run build` 验证单站，或将目录名加入 `scripts/build-examples.mjs` 参与批量输出。

数据在构建时由 Zod 校验。商品支持多图、规格、颜色/款式、SKU、原价与售价、MOQ、阶梯价、库存状态、标签、分类和推荐商品；默认语言为英文，字段结构支持中文，货币默认 USD，不做汇率转换。

## 新增主题和配方

- 主题：在 `src/styles/themes/` 新建 CSS，并在 `src/layouts/SiteLayout.astro` 登记主题 ID。主题只负责颜色、字体、间距和视觉表现。
- 配方：在 `recipes/` 新建 JSON，选择首页模块及其顺序；模块 ID 在 `src/recipes/section-registry.ts` 中登记。
- 可复用模块不要写入具体品牌或商品内容；内容只来自站点、品牌和商品数据。

## 能力边界

- 购物车仅保存在当前浏览器；“打开邮件草稿”仍需用户在邮件软件中发送。
- 库存是展示字段，不是真实库存。
- 没有支付、订单提交、邮件后台、数据库、账户系统或实时汇率。
- 当前演示素材为仓库内自制 SVG；参考网站采集与 Google Drive 上传尚未开始。
