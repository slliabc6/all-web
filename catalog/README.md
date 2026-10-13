# 资产索引

assets.json 是智能体查找入口，目前 assets 为空，表示尚未收录实际资产。
登记一项时，参照 ../_templates/asset-entry.example.json。

字段：
- id：唯一、稳定的小写英文 ID。
- kind：reference / brand / product / image / component / template / project / knowledge。
- title、description：用途与内容。
- path：仓库相对路径，通常指向条目 README；必须实际存在。
- tags：检索关键词。
- status：draft / reference-only / verified / deprecated。
- source：来源说明或 URL。
- rights：权利人/许可/使用范围，未知写 unknown，不能默认允许公开复用。
- verifiedAt：验证日期；未验证为 null。
- externalLocation：可选外部原件位置；不能包含密钥或私密分享令牌。

verified 仅表示条目说明中的检查已完成，不自动代表法律授权或线上服务可用。
修改路径时同步更新索引。示例文件不属于实际资产，不登记为 verified。
