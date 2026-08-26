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
  label: string
  role: string
  avatar?: string
  persona?: string
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
  schemaVersion: number
}

/** The schema of one template; defaults enforce the permissive reading. */
export const SubagentTemplateSchema: z<SubagentTemplate> = z.object({
  id: z.string().required(),
  name: z.string().required(),
  label: z.string().required(),
  role: z.string().required(),
  avatar: z.string().default(''),
  persona: z.string().default(''),
  provider: z.string().default('spawn'),
  model: z.string().default(''),
  reasoningEffort: z.string().default(''),
  permissionMode: PermissionModeSchema.default('readonly'),
  agentPreset: AgentPresetSchema.default('standard'),
  memberProvider: MemberProviderSchema.default('spawn'),
  maxDepth: z.natural().default(1),
  enabled: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  description: z.string().default(''),
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
 * Safety policy (hard requirement). Default is readonly; a `full` permission
 * template may not be enabled (the dangerous combo the plan rejects). Throws
 * with a human-readable reason on violation.
 */
export function assertSafeTemplate(template: SubagentTemplate): void {
  assertValidId(template.id)
  if (template.permissionMode === 'full' && template.enabled) {
    throw new Error(
      `template "${template.id}": "full" permission may not be enabled (readonly is the safe default; disable before enabling)`,
    )
  }
  if (template.label.trim() === '' || template.role.trim() === '') {
    throw new Error(`template "${template.id}": label and role must not be empty`)
  }
}
