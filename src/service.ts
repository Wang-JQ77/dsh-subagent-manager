/**
 * dsh-subagent-manager — host service definition.
 *
 * Provides `ctx.subagentManager`: the template registry service (M2). In M1
 * this is a compiling skeleton: the service registers itself on `ctx`, and the
 * template schema / storage / lifecycle rules land in M2.
 *
 * @module dsh-subagent-manager/service
 */
import { Service } from '@deepseek-ai/cordis'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
// Declaration merge only: expose ctx.llm / ctx.subagents for late resolution.
import type {} from '@deepseek-ai/dsh-llm'
import type {} from '@deepseek-ai/dsh-subagent'

/** Roles that control how much a template's spawned sub-agent may do. */
export type PermissionMode = 'readonly' | 'workspace' | 'full'

/** Built-in agent composition presets a template may select. */
export type AgentPreset = 'standard' | 'code' | 'minimal' | 'creator'

/** Member-provider strategy used when launching a template. */
export type MemberProvider = 'spawn' | 'fork'

/**
 * A sub-agent template: the durable, cross-session recipe a member or an
 * independent continuable sub-agent is built from. `schemaVersion` guards
 * forward migration; `enabled` gates new launches only (running instances are
 * unaffected).
 */
export interface SubagentTemplate {
  /** Stable id (kebab-case), also the audit/instance namespace key. */
  id: string
  /** Human label shown in the roster / settings UI. */
  label: string
  /** One-line role the sub-agent plays (e.g. "code-reviewer"). */
  role: string
  /** Optional avatar url. */
  avatar?: string
  /** Model-facing persona text. Shadowing the deployment persona when set. */
  persona?: string
  /** `ctx.subagents` provider name ('spawn' | 'fork'). */
  provider: string
  /** Optional model override applied to the launched sub-agent. */
  model?: string
  /** Optional reasoning effort override. */
  reasoningEffort?: string
  /** Permission mode; the host enforces the dangerous-combo guard. */
  permissionMode: PermissionMode
  /** Optional built-in agent composition preset. */
  agentPreset?: AgentPreset
  /** Member-provider strategy used by agent-teams integration. */
  memberProvider: MemberProvider
  /** Delegation depth cap (0 forbids delegation). */
  maxDepth?: number
  /** Whether new launches are allowed. */
  enabled: boolean
  /** Free-form tags for natural-language roster matching. */
  tags: string[]
  /** Optional longer description. */
  description?: string
  /** Template schema version, for forward-compatible persistence. */
  schemaVersion: number
}

/** Configuration for the subagent-manager plugin. */
export interface SubagentManagerConfig {
  /**
   * Storage strategy. `auto` feature-detects `settingsScope`; falls back to a
   * standalone profile-dir file when the scope is unavailable.
   */
  storage?: 'auto' | 'settings' | 'file'
  /** Default member-provider for new templates. */
  memberProvider?: string
  /** Default delegation depth cap applied to a spawned template. */
  memberMaxDepth?: number
  /** Prompt-section order for the template roster section. */
  promptSectionOrder?: number
}

export const SubagentManagerConfig: z<SubagentManagerConfig> = z.object({
  storage: z.union([z.const('auto'), z.const('settings'), z.const('file')]).default('auto'),
  memberProvider: z.string().default('spawn'),
  memberMaxDepth: z.natural().default(1),
  promptSectionOrder: z.natural().default(118),
})

/**
 * Template registry service. Registered as `ctx.subagentManager`; the service
 * self-provides on construction and is removed with its owning fiber.
 *
 * M1 skeleton: M2 adds CRUD + enable + lifecycle rules + persistence.
 */
export class SubagentManager extends Service {
  static Config = SubagentManagerConfig

  constructor(ctx: Context, config: SubagentManagerConfig) {
    super(ctx, 'subagentManager')
    this.config = config
  }

  private readonly config: SubagentManagerConfig

  async [Service.init](): Promise<void> {
    // M2: load persisted templates, feature-detect settingsScope, set up state.
  }

  /** M2: list templates. */
  async list(): Promise<SubagentTemplate[]> {
    return []
  }
}
