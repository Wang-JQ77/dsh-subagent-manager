/**
 * dsh-subagent-manager — template schema + safety policy.
 *
 * The template schema is the durable cross-session recipe a member or an
 * independent continuable sub-agent is built from. Schema defaults and the
 * safety policy live here; the service enforces policy on write.
 */
import z from '@deepseek-ai/schemastery'

/** Roles that control how much a spawned sub-agent may do. */
export type PermissionMode = 'readonly' | 'workspace' | 'full'
/** Built-in agent composition presets a template may select. */
export type AgentPreset = 'standard' | 'code' | 'minimal' | 'creator'
/** Member-provider strategy used when launching a template. */
export type MemberProvider = 'spawn' | 'fork'

export const PermissionModeSchema = z.union([z.const('readonly'), z.const('workspace'), z.const('full')])
export const AgentPresetSchema = z.union([z.const('standard'), z.const('code'), z.const('minimal'), z.const('creator')])
export const MemberProviderSchema = z.union([z.const('spawn'), z.const('fork')])

/**
 * A sub-agent template. `id` (kebab-case) is the stable instance/audit key;
 * `name` is the short member name used by agent-teams; `label` is the display
 * and natural-language roster name.
 */
export interface SubagentTemplate {
  id: string
  name: string
  /** Display / roster name (shown in UI lists and the system-prompt roster). */
  label: string
  /** Role description + persona (used as the sub-agent's persona on launch). */
  role: string
  avatar?: string
  provider: string
  model?: string
  reasoningEffort?: string
  permissionMode: PermissionMode
  agentPreset?: AgentPreset
  memberProvider: MemberProvider
  maxDepth?: number
  enabled: boolean
  tags: string[]
  description?: string
  /** 'global' (any project) or 'project:<id>' (only sessions whose cwd contains that path segment). */
  scope?: string
  schemaVersion: number
}

/** The schema of one template; defaults enforce the permissive reading. */
export const SubagentTemplateSchema: z<SubagentTemplate> = z.object({
  id: z.string().required(),
  name: z.string().required(),
  label: z.string().required(),
  role: z.string().required(),
  avatar: z.string().default(''),
  provider: z.string().default('fork'),
  model: z.string().default(''),
  reasoningEffort: z.string().default('medium'),
  permissionMode: PermissionModeSchema.default('readonly'),
  agentPreset: AgentPresetSchema.default('standard'),
  memberProvider: MemberProviderSchema.default('fork'),
  maxDepth: z.natural().default(1),
  enabled: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  description: z.string().default(''),
  scope: z.string().default('global'),
  schemaVersion: z.natural().default(1),
})

/** The persisted store value (one settings namespace / one file). */
export interface StoredTemplates {
  schemaVersion: number
  templates: SubagentTemplate[]
}

export const StoredTemplatesSchema: z<StoredTemplates> = z.object({
  schemaVersion: z.natural().default(1),
  templates: z.array(SubagentTemplateSchema).default([]),
})

const SAFE_ID = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/

/** Validate the kebab-case id used as the instance/audit key. */
export function assertValidId(id: string): void {
  if (!SAFE_ID.test(id)) {
    throw new Error(`template id "${id}" must be kebab-case ([a-z0-9][a-z0-9-]*)`)
  }
}

/**
 * Resolve whether a template with the given scope is usable from a parent whose
 * cwd is `parentCwd`. `global` always passes; `project:<id>` requires the id to
 * appear as one of the cwd's path segments.
 */
export function scopeAllows(scope: string | undefined, parentCwd: string | undefined): boolean {
  if (!scope || scope === 'global') return true
  const prefix = 'project:'
  if (!scope.startsWith(prefix)) return true // unknown scope: do not block
  const projectId = scope.slice(prefix.length).trim()
  if (projectId === '') return true
  if (!parentCwd) return false
  const segments = parentCwd.split(/[\\/]+/).filter(Boolean)
  return segments.includes(projectId)
}
export function assertSafeTemplate(template: SubagentTemplate): void {
  assertValidId(template.id)
  if (template.permissionMode === 'full' && template.enabled) {
    throw new Error(
      `template "${template.id}": "full" permission may not be enabled (readonly is the safe default; disable before enabling)`,
    )
  }
  if (template.name.trim() === '' || template.label.trim() === '' || template.role.trim() === '') {
    throw new Error(`template "${template.id}": name, label and role must not be empty`)
  }
}
