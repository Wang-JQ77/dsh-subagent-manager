# dsh-subagent-manager

![Node.js](https://img.shields.io/badge/node-%3E%3D22-blue) ![License: MIT](https://img.shields.io/badge/license-MIT-green) ![status](https://img.shields.io/badge/status-M0%E2%80%93M6%20(offline%20parts)-informational)

Sub-agent template manager for DeepSeek Harness (DSH): create / edit / enable
sub-agent templates, launch them as durable continuable children, and join
templates into [dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams)
as members (**template = member**).

> 项目代号：`dsh-subagent-manager` · 状态：**M0–M6 可离线部分完成**（构建、单测、干净 profile 安装 dogfood、headless 启动 `apply()` 验证与修复均通过；仅剩 npm 发布）。
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
| M3 设置页 | ✅ 编译通过 | host GET/POST `/plugins/subagent-manager/state` 路由 + 冲突版本；client `settings.section` 设置页（列表/表单/启停/归档/导入导出）+ 轮询/焦点刷新 + i18n。GUI 渲染待 M6。 |
| M4 agent-teams 打通 | 🔶 部分 | **systemPrompt 名册注入已实现**（`subagent-manager:roster` section，纯外挂式，单测+编译通过）。「模板即成员一键加团队」与 agent-teams 运行时联动待做（需 live agent-teams + 会话验证）。 |
| M5 实例视图 + 健壮性 | ✅ 完成 | 运行实例视图 + stop 按钮 + 轮询/焦点刷新/防重叠 + 版本冲突 409 + 归档确认 + 无障碍说明。 |
| M6 验证 + 发布 | 🔶 已完成可离线部分 | typecheck（双 program）+ build（host+client bundle）+ 单测全绿 + **干净 profile 完整安装 dogfood 通过**（`npm pack` → 新建 `dsh-sam-dogfood` profile → `dsh plugin add <tarball>` → `--dump-config` 组合树含插件行 → exports(main/client/patch) 全部解析）+ **headless 启动验证了插件 `apply()` 真实执行**（暴露并修复了「可选服务直取 `ctx.settings` → without inject 崩溃」，改用 `ctx.get()`）。剩余：npm 发布（需授权）。 |

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
    SettingsPage.tsx  # 设置页（M3：列表/表单/启停/归档/导入导出 + 实例视图）
    locales.ts        # en/zh 字典
  css-modules.d.ts    # *.module.css 声明
scripts/verify.mjs    # 构建产物校验（M6 扩展验证金字塔）
test/                 # 单元测试（node --test，纯 registry/schema/roster 逻辑）
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

> `pnpm build` 的 `tsdown` 段需 `pnpm i -D tsdown lightningcss`；本机已装（全局 + 链入 node_modules）并成功产出 `lib/client.js`。

### 安装到 profile（发布后 / GitHub）

> 需要 DSH CLI `0.1.1-rc.2`（或同通道 `^0.1.1-rc.2`）。安装后重启目标 profile。

```sh
# npm registry
npx -p @deepseek-ai/dsh dsh plugin --profile <name> add dsh-subagent-manager

# GitHub (official recommended: 仓库提供自包含 prepare 构建，或提交完整最新 lib/)
npx -p @deepseek-ai/dsh dsh plugin --profile <name> add gh:<your-org>/dsh-subagent-manager
```

**安装故障排查**：npm registry 双源（npmmirror vs npmjs）混装可能导致「下载成功但未安装」；先清该 profile 的元数据缓存再重装，或改用本地路径 `add .`。GitHub 分发若包声明 `prepare`、且 pnpm ≥10 拦截 Git 依赖构建脚本，需在该 profile 的 `pnpm-workspace.yaml` 显式 `allowBuilds` 后重跑 `add`。

**卸载**：先停运行中实例、导出模板 JSON；settings.yaml 命名空间数据保留，重装可恢复。

---

## 开发向导

参考官方 `dsh-plugin-development` Skill（[SKILL.md](https://github.com/NanmiCoder/dsh-agent-teams/blob/master/skills/dsh-plugin-development/SKILL.md)）与
[dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams) 参考实现。
