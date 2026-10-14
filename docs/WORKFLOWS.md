# 使用流程

## 模板优先（2026-10-14 覆盖旧优先级）

以 [模板复用核心原则](TEMPLATE-FOUNDATION.md) 为准。先查找模板与组件，缺失时把最小可复用基础与首个实例一起实现；品牌数据、主题和绘图素材独立。绘图生成的场景与提示词同步登记，不等待全部实拍到齐才做模板。按交付方式做一次必要验收，避免重复审核。

## 新会话恢复

按 AGENTS.md → README.md → docs/STATUS.md → catalog/assets.json 的顺序读取，再读取相关条目。
本地可执行：
```sh
git status --short
rg --files
rg -n "mahjong|gallery|询盘" catalog references brands components templates knowledge
```
只有 GitHub 访问权限时，使用文件读取工具逐个获取以上路径；不要依赖新仓库尚未建立的代码搜索索引。
仓库根目录是资产入口；运行或导出命令以选中的模板实际文件为准，不假设所有分支和本地工作区具备相同能力。

## 收录参考网站

1. 在 references/<slug>/ 建立 README.md，参照 _templates/asset-record.md。
2. 记录来源 URL、观察日期、值得借鉴的布局、截图路径及使用范围。
3. 如需保存截图，先检查是否包含个人账号等信息；标记 reference-only。
4. 第三方整站下载包留在 local-only，记录位置，不直接纳入公共模板。
5. 增加索引条目；参考条目保持 reference-only，不能自动晋升为生产资产。

## 收录品牌与产品

1. 在 brands/<brand-id>/ 建立说明和品牌数据；参考 _templates/brand.example.json。
2. 给产品分配稳定 SKU/ID；原图与 web 衍生图分开。
3. 大型或内部原件保存在 local-only/brands/<brand-id>/；只提交可公开资料。
4. 待核实参数保持 null 或待确认，不让 AI 编造材质、认证、专利或交期。
5. 为入库资料登记索引，说明使用范围与审核状态。

## 积累组件与模板

1. 先查索引，确认是否已有对应资产。
2. 通用组件放 components/<id>/；完整页面/网站模板放 templates/<id>/。
3. 每项 README 写清用途、截图、输入字段、依赖、运行方法、来源、限制和验证日期。
4. 新条目默认 draft；实际检查后才标记 verified。
5. 目标项目引用时记录资产 ID 和 Git 提交 SHA。修改复用件时保留品牌数据边界。
6. 尚未选择工具前，不创建虚构的 npm 命令或把空目录称为组件库实现。

## 新网站调用资产库

明确品牌需求 → 搜索索引 → 检查说明和来源 → 选择组件/模板 → 填入真实资料 → 生成页面 → 验证 → 经用户任务授权部署。
使用 _templates/project-handoff.md 记录所用资产版本、输出位置和缺失配置。
询盘验证至少区分：浏览器提交、服务端接收/记录、通知发送、业务邮箱实际收件。未经核实不得显示“已发送邮件”。

## 收尾

更新索引、STATUS 和 CHANGELOG。检查路径和 JSON；若有代码则运行其说明中真实存在的检查。
只提交本次任务相关文件。具体发布或推送遵循当前用户任务授权，不把本文作为自动上线指令。
