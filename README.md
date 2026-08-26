# dsh-subagent-manager

Sub-agent template manager for DeepSeek Harness (DSH): create / edit / enable
sub-agent templates, launch them as durable continuable children, and join
templates into [dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams)
as members (**template = member**).

> 项目代号：`dsh-subagent-manager` · 状态：**M1 骨架完成**（host/client 双 program 编译通过）
> 来源计划：《dsh-agent-manager-合并计划》（2026-08-26）

---

## 与原生 `dsh-agent-presets` 的边界

- **`@deepseek-ai/dsh-agent-presets` + `dsh-client-ui-agent-preset`**：负责「某会话按哪套 preset `agent.cordis.yml` 组装」（per-session composition，会话创建时即固定）。
- **本插件 `dsh-subagent-manager`**：负责「按模板拉起 / 复用子 agent，并让模板以成员身份进入 agent-teams」。管理的是子 Agent **成员模板**字段（provider / model / reasoningEffort / persona / permissionMode / memberProvider(spawn|fork) / maxDepth / enabled / tags），与原生 preset 正交。
- **复用策略**：站在原生 `ctx.subagents` / `ctx.systemPrompt` / `ctx.webServer` 之上；不复用原生 preset 组合机制，但沿用其 service-key feature detection 模式。
- 详细证据见 [`docs/M0-research.md`](docs/M0-research.md)。

---

## 里程碑状态

| 里程碑 | 状态 | 说明 |
|---|---|---|
| M0 调研 | ✅ 完成 | 原生重叠定夺（独立方案）、slot 名核实、CLI/框架版本（均 `0.1.1-rc.2`）。结论见 `docs/M0-research.md`。 |
| M1 骨架 | ✅ 完成 | `tsc -p tsconfig.json` 与 `tsc -p tsconfig.client.json` 均编译通过；`lib/` 产物生成。 |
| M2 服务层 | ✅ 完成 | 模板 schema + 安全策略、持久化（settings 命名空间 / 内存兑底）、CRUD + enable + 生命周期、`subagent_template_*` 工具、10 项单测全绿。 |
| M3 设置页 | ⏳ 待做 | 模板列表 + 表单 + 导入导出 + i18n + host 状态路由轮询。 |
| M4 agent-teams 打通 | ⏳ 待做 | 模板即成员 + 独立子 agent + systemPrompt 名册注入。 |
| M5 实例视图 + 健壮性 | ⏳ 待做 | 运行实例视图 + 无障碍/竞态/清理 checklist。 |
| M6 验证 + 发布 | ⏳ 待做 | 验证金字塔 + npm 发布后干净 profile dogfood（失败不得发布）。 |

---

## 结构

```
package.json          # dsh.bundle.patch + dsh.client(web) + exports["./client"] + peer 0.1.1-rc.2
cordis.patch.yml      # 顶层 insert: id=subagent-manager, name=dsh-subagent-manager, config
tsconfig.json         # host program（排除 src/client）
tsconfig.client.json  # client program（含 src/client / event-types / css-modules.d.ts）
tsdown.config.ts      # client bundle（CJS closure-factory + CSS module inline + purity gate）
src/
  index.ts            # host 入口：ctx.subagentManager 服务 + /plugins/subagent-manager/state 路由（feature-detect）
  service.ts          # SubagentManager extends Service；SubagentTemplate / SubagentManagerConfig schema
  context.d.ts        # declare module @deepseek-ai/cordis -> ctx.subagentManager
  event-types.ts      # 共享 type-only 事件类型（零运行时 import）
  client/
    index.tsx         # 注册 settings.section「子 Agent 管理」+ locale
    SettingsPage.tsx  # 设置页（M1 占位）
    locales.ts        # en/zh 字典
  css-modules.d.ts    # *.module.css 声明
scripts/verify.mjs    # 构建产物校验（M6 扩展验证金字塔）
docs/M0-research.md   # M0 调研结论
```

---

## 开发（本机）

依赖来源：开发期把 DSH 框架链接进 `node_modules`（等价于「链到 DSH checkout」——本机框架包内嵌于 `@deepseek-ai/dsh` CLI 的 `node_modules/@deepseek-ai/*`，均 `0.1.1-rc.2`）。已建立 junction：`196` 个 `@deepseek-ai/*` + `186` 个裸依赖 + `@deepseek-ai/dsh-client-ui-slots@0.1.1-rc.2` + `@types/react` / `@types/react-dom`。

```sh
pnpm typecheck   # 双 program 类型检查
pnpm build       # tsc emit + tsdown client bundle
pnpm verify      # 构建产物校验（M6 扩展）
```

> `pnpm build` 的 `tsdown` 段需要 `pnpm i -D tsdown lightningcss`；当前环境仅验证到 `tsc` 双 program emit。

### 安装（发布后）到 profile

```sh
dsh plugin --profile <name> add dsh-subagent-manager
```

安装后重启该 profile。详见未来 README 的排查章节（npmmirror vs npmjs 混装、「下载成功但未安装」、最低 DSH 版本、卸载故事）。

---

## 开发向导

参考官方 `dsh-plugin-development` Skill（[SKILL.md](https://github.com/NanmiCoder/dsh-agent-teams/blob/master/skills/dsh-plugin-development/SKILL.md)）与
[dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams) 参考实现。
