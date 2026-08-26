/**
 * dsh-subagent-manager — `subagent_template_*` model-facing tools.
 *
 * Let the model manage and launch sub-agent templates directly: list, create,
 * toggle enable, and launch a template as a durable continuable child. Render
 * `value` params are annotated with concrete output types so compile-time
 * inference of the schema DSL stays dependable under `noUncheckedIndexedAccess`.
 */
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { ContentBlock } from '@deepseek-ai/dsh-llm'
import { defineTool, type ToolRunContext } from '@deepseek-ai/dsh-tools'
import type { SubagentManager } from './service.ts'
import type { PermissionMode } from './schema.ts'

export interface ListOutput {
  templates: { id: string; name: string; role: string; provider: string; model: string; permission_mode: string; enabled: boolean }[]
}
export interface CreateOutput {
  id: string
  name: string
  role: string
  permission_mode: string
  enabled: boolean
}
export interface EnableOutput {
  id: string
  enabled: boolean
  permission_mode: string
}
export interface LaunchOutput {
  child_id: string
  message_id: string
  template_id: string
}

/** Caller agent for launch tooling; throws when none is present. */
function callerAgent(exec: ToolRunContext): Agent {
  const agent = exec.agent
  if (!agent) throw new Error('no calling agent available to launch a sub-agent')
  return agent
}

function text(value: string): ContentBlock[] {
  return [{ type: 'text', text: value }]
}

/** Register all `subagent_template_*` tools against a running `ctx.subagentManager`. */
export function registerSubagentTemplateTools(ctx: Context, manager: SubagentManager): () => void {
  const dispose: Array<() => void> = []

  const listTool = defineTool({
    name: 'subagent_template_list',
    description: 'List sub-agent templates. Returns id, name, role, provider, model, permission mode and enabled state for every template. Use before creating or launching.',
    parameters: { id: { type: 'string', description: 'Optional template id filter; omit to list all.' } },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        templates: { type: 'array', required: true, items: { type: 'object', additionalProperties: false, properties: {
          id: { type: 'string', required: true }, name: { type: 'string', required: true }, role: { type: 'string', required: true }, provider: { type: 'string', required: true }, model: { type: 'string', required: true }, permission_mode: { type: 'string', required: true }, enabled: { type: 'boolean', required: true } } } },
      } },
      render: (_args: unknown, value: ListOutput) => text(`Sub-agent templates: ${value.templates.length ? value.templates.map((t) => t.id).join(', ') : 'none'}`),
    },
    execute: async (args) => {
      const templates = await manager.list()
      const filtered = args.id ? templates.filter((t) => t.id === args.id) : templates
      return { templates: filtered.map((t) => ({ id: t.id, name: t.name, role: t.role, provider: t.provider, model: t.model ?? '', permission_mode: t.permissionMode, enabled: t.enabled })) }
    },
  })
  dispose.push(ctx.tools.register(listTool))

  const createTool = defineTool({
    name: 'subagent_template_create',
    description: 'Create a sub-agent template from a named recipe. Provide a kebab-case id, a role, and optionally a name (defaults to the id), persona, model, provider, permission mode (readonly|workspace|full: defaults readonly), max depth, and tags. Permission "full" may only be created with enabled=false.',
    parameters: {
      id: { type: 'string', required: true, description: 'Kebab-case stable template id.' },
      name: { type: 'string', description: 'Member name; defaults to the template id.' },
      role: { type: 'string', required: true, description: 'One-line role this sub-agent plays.' },
      persona: { type: 'string', description: 'Model-facing persona text.' },
      provider: { type: 'string', description: "Subagent provider ('spawn' | 'fork'); defaults to spawn." },
      model: { type: 'string', description: 'Optional model override.' },
      permission_mode: { type: 'string', enum: ['readonly', 'workspace', 'full'], description: 'Defaults to readonly.' },
      max_depth: { type: 'integer', description: 'Delegation depth cap (default 1).' },
      enabled: { type: 'boolean', description: 'Whether new launches are allowed (default false).' },
      tags: { type: 'array', items: { type: 'string' }, description: 'Free-form tags for natural-language roster matching.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        id: { type: 'string', required: true }, name: { type: 'string', required: true }, role: { type: 'string', required: true }, permission_mode: { type: 'string', required: true }, enabled: { type: 'boolean', required: true },
      } },
      render: (_args: unknown, value: CreateOutput) => text(`Template "${value.id}" created (${value.name}, ${value.permission_mode}, enabled=${value.enabled}).`),
    },
    execute: async (args) => {
      const created = await manager.create({
        id: args.id.trim(),
        name: (args.name ?? args.id).trim(),
        role: args.role.trim(),
        persona: args.persona,
        provider: args.provider ?? 'spawn',
        model: args.model,
        permissionMode: (args.permission_mode ?? 'readonly') as PermissionMode,
        memberProvider: 'spawn',
        maxDepth: args.max_depth ?? 1,
        enabled: args.enabled ?? false,
        tags: args.tags ?? [],
        schemaVersion: 1,
      })
      return { id: created.id, name: created.name, role: created.role, permission_mode: created.permissionMode, enabled: created.enabled }
    },
  })
  dispose.push(ctx.tools.register(createTool))

  const enableTool = defineTool({
    name: 'subagent_template_set_enabled',
    description: 'Enable or disable a template. Disabling blocks NEW launches only; already-running instances are unaffected. Disabling is required before enabling a "full" permission template.',
    parameters: {
      id: { type: 'string', required: true, description: 'Template id.' },
      enabled: { type: 'boolean', required: true, description: 'New launch state.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        id: { type: 'string', required: true }, enabled: { type: 'boolean', required: true }, permission_mode: { type: 'string', required: true },
      } },
      render: (_args: unknown, value: EnableOutput) => text(`Template "${value.id}" is now enabled=${value.enabled} (${value.permission_mode}).`),
    },
    execute: async (args) => {
      const updated = await manager.setEnabled(args.id.trim(), args.enabled)
      return { id: updated.id, enabled: updated.enabled, permission_mode: updated.permissionMode }
    },
  })
  dispose.push(ctx.tools.register(enableTool))

  const launchTool = defineTool({
    name: 'subagent_template_launch',
    description: 'Launch a template as a durable, continuable sub-agent. Provide the template id and the task prompt. The child keeps the template snapshot and can be resumed later.',
    parameters: {
      id: { type: 'string', required: true, description: 'Template id to launch.' },
      task: { type: 'string', required: true, description: 'The task prompt delivered as the child\'s first message.' },
      label: { type: 'string', description: 'Optional short creation label.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        child_id: { type: 'string', required: true }, message_id: { type: 'string', required: true }, template_id: { type: 'string', required: true },
      } },
      render: (_args: unknown, value: LaunchOutput) => text(`Launched template "${value.template_id}" as child sub-agent "${value.child_id}".`),
    },
    execute: async (args, exec) => {
      const started = await manager.launch(args.id.trim(), {
        prompt: text(args.task),
        parent: callerAgent(exec),
        label: args.label,
        signal: exec.signal,
      })
      return { child_id: started.childId, message_id: started.messageId, template_id: started.templateId }
    },
  })
  dispose.push(ctx.tools.register(launchTool))

  return () => { for (const d of dispose) d() }
}
