# M0 调研结论 — 原生重叠与环境核实

> 项目：`dsh-subagent-manager`（DSH 子 Agent 管理插件）
> 日期：2026-08-26
> 结论基于：DHS CLI 源码内嵌框架包（`.../npm/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/*`）只读取证，版本均 `0.1.1-rc.2`；以及官方 `dsh-agent-teams@0.1.13` 参考实现。

---

## 一、环境核实（M0 问题 2）

| 项 | 结论 |
|---|---|
| DSH CLI | `0.1.1-rc.2`（npm shim `dsh.ps1` → `@deepseek-ai/dsh/lib/bin.js`） |
| web profile | `$DSH_HOME/profiles/web/`（即 `~/.dsh/profiles/web/`），`@nanmicoder/dsh-agent-teams@0.1.13` 已装入 bundle 列表 |
| 框架包版本 | 所有 `@deepseek-ai/dsh-*` 内嵌在 CLI 包 `node_modules/@deepseek-ai/`，均 `0.1.1-rc.2`；`cordis@4.0.1`、`schemastery@3.18.1` |
| **无独立 DSH checkout** | 用户目录无 `deepseek-harness` 源码 checkout。开发期「链到 DSH checkout」的等价物 = **链接到 CLI 包内嵌的框架 node_modules**（`.../@deepseek-ai/dsh/node_modules/@deepseek-ai/*`）。本机已用 junction 全部链接：`196` 个 `@deepseek-ai/*` + `186` 个裸依赖。 |
| settings slot 契约 | 权威文件 = `dsh-client-ui-settings/lib/types/client/contract/slots.d.ts`（源码内嵌包）。**核实通过**：`settings.section` / `settings.plugins.tab` / `settings.general.item` / `settings.trigger` / `settings.header` / `settings.action` / `settings.close` / `settings.onboarding`。 |
| `dsh-client-ui-slots` 包 | npm `latest=0.0.1-rc.1`、`next=0.1.1-rc.2`。**未内嵌在 CLI 包**，浏览器运行时作为平台 seed 模块由 web shell 提供（见 tsdown `PLATFORM_MODULES`）。开发期 client 需按 `0.1.1-rc.2` 单独安装/链接。 |
| 子 Agent 服务 | `ctx.subagents` 提供 `SubagentRuntime`；**`startContinuable(spec: ContinuableStartSpec)` 已确认**。`SubagentStartRequest` 含 `label/prompt/parent/signal/agentOptions/outputSchema/maxDepth/toolFilter/persona`。 |

### 关键取舍：`settingsScope` / storage
`dsh-settings` + `dsh-settings-file` 内嵌可用，但「插件侧设置命名空间写入」是否支持是本计划的能力风险点。按计划 M2.2，先 feature-detect `settingsScope`：支持则写入 settings.yaml 命名空间（对齐 `dsh-soul-md`）；不支持则降级为 profile 目录下独立 `subagent-templates.yaml`。**M0 据此保留「独立存储」为兜底，不阻塞。**
> 注：`dsh-client-ui-slots` 的 SlotMap `settings.section` 类型在 `dsh-client-ui-settings` 的 `slots.d.ts` 中以 `declare module '@deepseek-ai/dsh-client-ui-slots'` 声明。client 侧注册 `settings.section` 应拉入该包类型。

---

## 二、原生重叠定夺（M0 问题 1）

### 2.1 原生已有能力（证据）

- **`@deepseek-ai/dsh-agent-presets`（0.1.1-rc.2）**：per-session agent composition。一个 preset = 一个含 `agent.cordis.yml` 的目录，进程内只挂载一次、按 `dsh-scope` 的 parent chain 让每个命名它的 session 加入。服务 `ctx.agentPresets`：`list/resolve/mount/composeFrom/composedPreset/recompose/standingKeyFor/read/copy/remove/roots/authorable`。**它是「某会话由哪套工具/prompt 投影组成」的组合机制，且 preset 在会话创建时即固定**。
- **`@deepseek-ai/dsh-client-ui-agent-preset`（0.1.1-rc.2）**：preset 的 Web 表面 — General 行选默认、新建会话 chip、会话头只读标签、以及一个管理 roster（copy/delete/default/进入文件）的 settings section。

### 2.2 定夺结论：**维持独立方案**，不复用原生 preset 承载本插件核心

理由（证据支撑）：

1. **轴线不同**。原生 `dsh-agent-presets` 描述「某会话的工具/系统提示组合」；本插件要管理的是**子 Agent 成员模板**（provider / model / reasoningEffort / persona / permissionMode / memberProvider(spawn|fork) / maxDepth / enabled / tags）。两者字段集与语义不重叠（本插件字段：`persona`、`permissionMode`、`memberProvider`、`maxDepth`、`enabled`；原生 preset 字段：`id/trust/path/broken`），原生 preset 不表达这些子 agent 成员参数。
2. **原生只解决 per-session 组合，不做跨会话「静态模板库 + 实例拉起 + 团队联动」**。本插件核心价值恰是「模板 → 成员/实例」这一层，原生 preset 无此映射。
3. **强行复用会引入 scope parent chain 语义耦合**，且 preset 会话创建即固定，与「模板可编辑、可启停、可一键加团队」的交互冲突。

**边界结论（写入 README）**：`dsh-agent-presets`/`dsh-client-ui-agent-preset` 负责「某会话按哪套 preset cordis.yml 组装」（per-session composition）；`dsh-subagent-manager` 负责「按模板拉起 / 复用子 agent，并让模板以成员身份进入 agent-teams」。两者正交：前者不改，后者外挂。

### 2.3 子 Agent 原生基础设施（复用，不重造）

原生已提供并直接复用的底层：
- `ctx.subagents.startContinuable()`/`followup`/`interrupt`（durable continuable child）
- `dsh-subagent-spawn-in-process` / `dsh-subagent-fork-in-process`（memberProvider）
- `dsh-tool-subagent*`（原生 subagent 工具，本插件工具独立命名 `subagent_template_*` 避免冲突）
- `dsh-system-prompt`（注册 roster section）
- `dsh-host-webserver` 的 `webServer`/`httpServer` 双键 feature-detect

> **复用策略**：本插件是「模板管理」层，站在原生 subagent 基础设施上；不复用原生 preset 组合机制，但复用其 service-key feature detection 模式。

---

## 三、M0 给后续里程碑的既有约束

1. **依赖来源**：开发期链接 CLI 内嵌框架包（非独立 checkout）。需在 `node_modules/@deepseek-ai` 链接 `cordis`/`dsh-subagent`/`dsh-tools`/`dsh-system-prompt`/`dsh-session`/`dsh-llm`/`dsh-commands`/`dsh-client-runtime`/`dsh-client-ui-settings`，另加 `@deepseek-ai/dsh-client-ui-slots@0.1.1-rc.2`。
2. **版本通道**：统一 `0.1.1-rc.2`（CLI/bundle/peer/framework 一致）；不混装 `latest(rc.1)`。peer 写 `^0.1.1-rc.2`。
3. **slot 入口**：用 `settings.section` 注册独立「子 Agent 管理」设置页；可选 `settings.plugins.tab` 作快捷入口。feature-detect 双 slot，缺显式报错。
4. **双 tsconfig 拆分**：`tsconfig.json`（host，排除 `src/client`）+ `tsconfig.client.json`（client，含 `src/client`/`event-types`/`css-modules.d.ts`），与官方模板一致。
