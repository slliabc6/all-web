# 快速使用指南

## 这是什么

`all-web` 用于长期保存可复用的网站模板、组件、主题、商品数据和交付记录。模板是基础资产，网站是模板与品牌资料组合出的实例。

## 三个存储位置

| 位置 | 用途 |
| --- | --- |
| GitHub `slliabc6/all-web` | 保存代码、结构化数据、索引和说明 |
| 本机 `D:\all-web` | 开发、生成网站，以及保存不提交 Git 的原件和大文件 |
| Google Drive `网页模板资产库` | 保存模板归档、商品素材和网站成品备份 |

## GitHub 与本机路径

| 路径 | 放什么 | 怎么用 |
| --- | --- | --- |
| `templates/static-commerce/` | 购物站模板源代码 | 安装依赖、开发和构建 |
| `templates/static-commerce/src/components/` | 导航、商品、购物车和页面模块 | 新网站优先复用 |
| `templates/static-commerce/src/styles/themes/` | 现代极简、自然生活、深色精品主题 | 通过站点配置选择 |
| `templates/static-commerce/sites/` | 每个网站的品牌与配置 | 新网站复制一个示例后修改 |
| `templates/static-commerce/data/` | 商品、分类和网站图片 | 页面构建时读取 |
| `templates/static-commerce/exports/` | 生成的网站成品 | 打开 `index.html` 或上传托管平台 |
| `catalog/assets.json` | 资产索引 | 查找已验证模板和组件 |
| `references/` | 参考网站记录 | 只用于分析，除非许可明确，否则不能直接发布 |
| `projects/` | 独立项目资料 | 查看项目自己的 README |
| `local-only/` | 原件、大文件和私人资料 | 仅本机保存，不提交 Git |

## Google Drive 路径

```text
网页模板资产库/
├─ 模板源代码/
├─ 导航与页脚/
├─ 商品模块/
├─ 页面模板/
├─ 主题风格/
├─ 品牌与商品数据/
├─ 商品素材库/
├─ 参考网站/
├─ 可复用素材/
├─ 网站成品/
└─ 备份记录/
```

[打开网页模板资产库](https://drive.google.com/drive/folders/1VhmrIjZiYwkzt3pojJVYWIqOQJFZN7YC)

## 放入商品资料

1. 打开 [商品素材库](https://drive.google.com/drive/folders/1nnXydJvTv4h2T6c9e0UWNwX_5jkWfMUo)。
2. 选择家具家居、麻将用品、服饰配件、美妆个护、食品饮料、电子产品或礼品批发等品类。
3. 在品类下创建“品牌名-商品名”文件夹，把原图、表格、PDF 和文字说明直接放入。
4. 单商品网站放入“单品专用”；无法判断时放入“待分类”。

制作网站时优先从该目录读取商品资料。原图不覆盖；压缩图、修图和网页衍生图另行生成。

## 生成网站

```powershell
cd D:\all-web\templates\static-commerce
npm install
npm run build:examples
npm run verify:static
```

三个示例站输出到：

```text
exports/现代极简零售/网站成品/index.html
exports/自然生活批发/网站成品/index.html
exports/深色精品混合/网站成品/index.html
```

复制 `sites/` 中的示例可以建立新网站。内部 ID 使用小写英文，文件夹名称可以使用中文。详细字段和命令见 [`templates/static-commerce/README.md`](../templates/static-commerce/README.md)。

## 能力边界

- 购物车、搜索和询盘均为纯前端。
- 邮件按钮只打开邮件草稿，仍需用户手动发送。
- 不包含支付、真实订单、登录、数据库或后台。
- Google Drive 是素材和备份位置，不作为网站图片 CDN。
