# all-web

可复用的静态购物网站资产库。网站由共享模板、组件、主题和商品数据组合生成，不重复制作孤立页面。

## 主要路径

| 路径 | 存放内容 |
| --- | --- |
| `templates/static-commerce/` | Astro 购物站模板、组件、主题、示例数据和构建脚本 |
| `templates/static-commerce/sites/` | 各网站的品牌与站点配置 |
| `templates/static-commerce/data/` | 商品、分类和演示图片 |
| `templates/static-commerce/exports/` | 本机生成的网站成品；不提交 Git |
| `catalog/assets.json` | 可复用资产索引 |
| `references/` | 参考网站与结构分析，不等于可发布素材 |
| `projects/` | 独立项目、交付和验证记录 |
| `local-only/` | 大文件、原件和私人资料；不提交 Git |
| `docs/` | 使用、状态和存储说明 |

## 使用方法

1. 商品图片和资料上传到 [Google Drive 商品素材库](https://drive.google.com/drive/folders/1nnXydJvTv4h2T6c9e0UWNwX_5jkWfMUo)，按品类和商品分文件夹。
2. 在 `templates/static-commerce/sites/` 配置品牌、主题和销售模式。
3. 构建网站：

```powershell
cd templates/static-commerce
npm install
npm run build:examples
npm run verify:static
```

成品位于：

```text
templates/static-commerce/exports/<网站名称>/网站成品/index.html
```

每个网站只保留一份常规静态资源目录，可直接查看，也可上传到静态托管平台。

## 当前模板

- 现代极简 × 零售展示
- 自然生活 × 批发询盘
- 深色精品 × 批发/零售混合

均为纯前端：支持商品展示、搜索、购物车、复制询盘清单和邮件草稿；不包含支付、订单、登录或后台。

详细说明见 [快速使用指南](docs/QUICK-START.md)。智能体开始工作前读取 [AGENTS.md](AGENTS.md) 和 [当前状态](docs/STATUS.md)。
