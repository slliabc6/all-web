# 餐饮包装用品示范商品库

这是 `轻快包装用品` 示例站使用的公开安全演示数据，配合 `packaging` 主题和 `packaging-catalog` 首页配方，用来验证餐饮包装、电商展示与批发询盘的组合。

## 内容

- `categories.json`：按餐盒、饮品杯、餐具与外带用品分类。
- `products.json`：8 件虚构商品，包含零售价、MOQ、批发阶梯价、规格、库存和推荐关系。
- `assets/`：8 张仓库内自制 SVG 商品插图，不来自 Cupsky 原站。

品牌、价格、SKU、库存和所有商品参数均为演示数据，不代表真实商品或报价。上线前应整体替换。

## 替换方法

1. 保留现有 JSON 字段结构，替换分类、商品和参数。
2. 将商品图片放入 `assets/`，并在 `products.json` 中使用相对路径引用。
3. 在 `sites/<站点>/site.json` 中将 `catalogId` 指向新的商品库目录名。
4. 运行 `npm run build:examples` 和 `npm run verify:static`，再从生成目录的 `index.html` 检查成品。

模板不依赖 CDN、在线字体或远程 API；购物车与询盘清单只在浏览器前端运行，邮件按钮只打开邮件草稿。
