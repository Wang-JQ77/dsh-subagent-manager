/**
 * dsh-subagent-manager — host service (`ctx.subagentManager`).
 *
 * Registers a `subagentManager` service exposing the pure template registry
 * (`TemplateRegistry`, storage-injected) plus the launch bridge to
 * `ctx.subagents.startContinuable` and the running-instance registry. Runs on
 * the `dsh-settings` namespace (feature-detected; in-memory fallback).
 *
 * Lifecycle contract (M2.4):
 * - editing a template only affects instances launched afterwards; running
 *   instances keep the snapshot they were launched from (snapshot at launch).
 * - deleting a template archives (never physically removes).
 * - disabling a template blocks new launches only; running instances are
 *   unaffected.
 * - fork members copy session state; blueprint templates default to spawn.
 */
import { Service, type Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-agent'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-subagent'
import type { ContinuableStartSpec, SubagentStartRequest } from '@deepseek-ai/dsh-subagent'
import { createTemplateStorage, type TemplateStorage } from './storage.ts'
import { TemplateRegistry, type RunningInstance } from './registry.ts'
import type { SubagentTemplate } from './schema.ts'

/** Configuration for the subagent-manager plugin. */
export interface SubagentManagerConfig {
  storage?: 'auto' | 'settings' | 'file'
  memberProvider?: string
  memberMaxDepth?: number
  promptSectionOrder?: number
}

export const SubagentManagerConfig: z<SubagentManagerConfig> = z.object({
  storage: z.union([z.const('auto'), z.const('settings'), z.const('file')]).default('auto'),
  memberProvider: z.string().default('spawn'),
  memberMaxDepth: z.natural().default(1),
  promptSectionOrder: z.natural().default(118),
})

export type { RunningInstance }

/** Launch inputs (caller supplies the delegation request). */
export interface LaunchOptions {
  prompt: SubagentStartRequest['prompt']
  parent: SubagentStartRequest['parent']
  label?: string
  signal: AbortSignal
}

/** Result of a successful launch. */
export interface LaunchResult {
  childId: string
  messageId: string
  templateId: string
}

/**
 * Template registry service. Registers as `ctx.subagentManager`; the service
 * self-provides on construction and is removed with its owning fiber.
 */
export class SubagentManager extends Service {
  static Config = SubagentManagerConfig

  private readonly storage: TemplateStorage
  private registry: TemplateRegistry
  private running = new Map<string, RunningInstance>()

  constructor(
    ctx: Context,
    private readonly config: SubagentManagerConfig,
    storage?: TemplateStorage,
  ) {
    super(ctx, 'subagentManager')
    this.storage = storage ?? createTemplateStorage(ctx, { warn: (msg) => ctx.logger.warn?.(msg) })
    this.registry = new TemplateRegistry(this.storage)
  }

  async [Service.init](): Promise<void> {
    // NOTE: this lifecycle hook is only invoked for class-style plugins. This
    // plugin is a function plugin that constructs the service in apply(), so
    // apply() must call ready() explicitly.
    await this.ready()
  }

  private readyPromise: Promise<void> | undefined

  /**
   * Idempotently initialize storage (register the settings namespace) then the
   * registry (load + seed defaults). Called from apply() — see Service.init note.
   */
  ready(): Promise<void> {
    this.readyPromise ??= (async () => {
      await this.storage.init()
      await this.registry.init()
    })()
    return this.readyPromise
  }

  async list(): Promise<SubagentTemplate[]> {
    return this.registry.list()
  }

  /** Sync in-memory snapshot for the systemPrompt roster text. */
  listSync(): SubagentTemplate[] {
    return this.registry.list()
  }

  async get(id: string): Promise<SubagentTemplate | undefined> {
    return this.registry.get(id)
  }

  async create(input: SubagentTemplate): Promise<SubagentTemplate> {
    return this.registry.create(input)
  }

  async update(id: string, patch: Partial<SubagentTemplate>): Promise<SubagentTemplate> {
    return this.registry.update(id, patch)
  }

  async setEnabled(id: string, enabled: boolean): Promise<SubagentTemplate> {
    return this.registry.setEnabled(id, enabled)
  }

  async archive(id: string): Promise<{ archived: true; running: RunningInstance[] }> {
    const archived = await this.registry.archive(id)
    return { ...archived, running: this.listRunningFor(id) }
  }

  async duplicate(id: string, newId?: string): Promise<SubagentTemplate> {
    return this.registry.duplicate(id, newId)
  }

  /**
   * Launch a template as a durable continuable child. Provider validation is
   * deferred to `ctx.subagents.startContinuable` (first use). Snapshot the
   * template at launch so later edits don't perturb this instance.
   */
  async launch(templateId: string, options: LaunchOptions): Promise<LaunchResult> {
    const snapshot = this.registry.snapshotForLaunch(templateId)
    // Feature-detect via ctx.get (subagents is optional, deferred to first use).
    const subagents = this.ctx.get('subagents' as any) as { startContinuable: (spec: ContinuableStartSpec) => Promise<{ childId: string; messageId: string }> } | undefined
    if (!subagents?.startContinuable) throw new Error('ctx.subagents is not available; install dsh-subagent in this profile')

    const spec: ContinuableStartSpec = {
      provider: snapshot.provider,
      label: options.label ?? snapshot.name,
      request: {
        prompt: options.prompt,
        parent: options.parent,
        persona: snapshot.role,
        maxDepth: snapshot.maxDepth,
        agentOptions: snapshot.model ? { model: snapshot.model } : undefined,
      },
      signal: options.signal,
    }
    const started = await subagents.startContinuable(spec)
    this.running.set(started.childId, {
      childId: started.childId,
      templateId: templateId,
      templateLabel: snapshot.name,
      provider: snapshot.provider,
      status: 'running',
      launchedAt: Date.now(),
    })
    return { childId: started.childId, messageId: started.messageId, templateId: templateId }
  }

  async listRunning(): Promise<RunningInstance[]> {
    return [...this.running.values()]
  }

  /** Monotonic write revision for optimistic-concurrency conflict detection. */
  getRevision(): number {
    return this.registry.getRevision()
  }

  /**
   * Format the agent-teams member params for a template (M4 template=member).
   * Does not mutate state; team creation itself must be driven in a session via
   * the agent-teams tools (the roster injection tells the captain how).
   */
  memberParams(templateId: string): { templateId: string; provider: string; model?: string; persona?: string; reasoningEffort?: string; agentTeams: boolean } {
    const t = this.registry.get(templateId)
    if (!t) throw new Error(`template "${templateId}" does not exist`)
    return {
      templateId: t.id,
      provider: t.provider,
      model: t.model || undefined,
      persona: t.role || undefined,
      reasoningEffort: t.reasoningEffort || undefined,
      agentTeams: true,
    }
  }

  private listRunningFor(templateId: string): RunningInstance[] {
    return [...this.running.values()].filter((r) => r.templateId === templateId)
  }

  async stop(childId: string): Promise<void> {
    this.running.delete(childId)
  }
}
