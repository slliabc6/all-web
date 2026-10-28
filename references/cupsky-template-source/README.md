# Cupsky 模板提炼记录

## 来源

- 本机参考目录：`C:\Users\Administrator\Desktop\Cupsky\Cupsky\`
- 提炼日期：2026-10-28
- 用途：仅用于研究页面结构、视觉语言和可复用模块，不作为可直接发布的素材包。

参考目录包含首页、商品列表、商品详情、购物车、结账、关于、联系、常见问题、政策及批发等页面，以及配套 CSS、脚本和商品图片。未执行其中的第三方脚本，也未将原始 HTML、CSS、图片或品牌内容提交到公开仓库。

## 提取结果

Cupsky 的有效设计语言被整理为 `packaging` 主题和 `packaging-catalog` 首页配方：

| 参考特征 | 可复用实现 |
| --- | --- |
| 深青色、纸张白、暖橙色和浅雾蓝配色 | `src/styles/themes/packaging.css` |
| 编辑式拼贴首屏 | `hero / packaging-collage` |
| 按使用场景组织分类 | `categories / use-case-cards` |
| 密集而清楚的商品货架 | `featured / counter-grid` |
| 品牌服务说明与图文故事 | `brand-story / service-story` |
| 醒目的批发规划区 | `wholesale-callout / planning-banner` |

完整配方位于 `templates/static-commerce/recipes/packaging-catalog.json`。公开示范站使用虚构品牌 `Common Table Supply`、自制 SVG 商品图和虚构商品参数，因此没有把参考站的品牌、文案和商品原件混入模板。

## 使用范围

- 参考资料状态：`reference-only`
- Cupsky 原始素材许可：未核实
- 可公开复用：本仓库新增的主题代码、模块变体、虚构数据和自制 SVG
- 不可据此声称：Cupsky 原图、商品信息或品牌内容已获得再发布授权
