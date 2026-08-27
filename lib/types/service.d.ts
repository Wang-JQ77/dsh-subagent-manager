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
import { Service, type Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { SubagentStartRequest } from '@deepseek-ai/dsh-subagent';
import { type TemplateStorage } from './storage.ts';
import { type RunningInstance } from './registry.ts';
import type { SubagentTemplate } from './schema.ts';
/** Configuration for the subagent-manager plugin. */
export interface SubagentManagerConfig {
    storage?: 'auto' | 'settings' | 'file';
    memberProvider?: string;
    memberMaxDepth?: number;
    promptSectionOrder?: number;
}
export declare const SubagentManagerConfig: z<SubagentManagerConfig>;
export type { RunningInstance };
/** Launch inputs (caller supplies the delegation request). */
export interface LaunchOptions {
    prompt: SubagentStartRequest['prompt'];
    parent: SubagentStartRequest['parent'];
    label?: string;
    signal: AbortSignal;
}
/** Result of a successful launch. */
export interface LaunchResult {
    childId: string;
    messageId: string;
    templateId: string;
}
/**
 * Template registry service. Registers as `ctx.subagentManager`; the service
 * self-provides on construction and is removed with its owning fiber.
 */
export declare class SubagentManager extends Service {
    private readonly config;
    static Config: z<SubagentManagerConfig>;
    private readonly storage;
    private registry;
    private running;
    constructor(ctx: Context, config: SubagentManagerConfig, storage?: TemplateStorage);
    [Service.init](): Promise<void>;
    private readyPromise;
    /**
     * Idempotently initialize storage (register the settings namespace) then the
     * registry (load + seed defaults). Called from apply() — see Service.init note.
     */
    ready(): Promise<void>;
    list(): Promise<SubagentTemplate[]>;
    /** Sync in-memory snapshot for the systemPrompt roster text. */
    listSync(): SubagentTemplate[];
    get(id: string): Promise<SubagentTemplate | undefined>;
    create(input: SubagentTemplate): Promise<SubagentTemplate>;
    update(id: string, patch: Partial<SubagentTemplate>): Promise<SubagentTemplate>;
    setEnabled(id: string, enabled: boolean): Promise<SubagentTemplate>;
    archive(id: string): Promise<{
        archived: true;
        running: RunningInstance[];
    }>;
    duplicate(id: string, newId?: string): Promise<SubagentTemplate>;
    /**
     * Launch a template as a durable continuable child. Provider validation is
     * deferred to `ctx.subagents.startContinuable` (first use). Snapshot the
     * template at launch so later edits don't perturb this instance.
     */
    launch(templateId: string, options: LaunchOptions): Promise<LaunchResult>;
    listRunning(): Promise<RunningInstance[]>;
    /** Monotonic write revision for optimistic-concurrency conflict detection. */
    getRevision(): number;
    /**
     * Format the agent-teams member params for a template (M4 template=member).
     * Does not mutate state; team creation itself must be driven in a session via
     * the agent-teams tools (the roster injection tells the captain how).
     */
    memberParams(templateId: string): {
        templateId: string;
        provider: string;
        model?: string;
        persona?: string;
        reasoningEffort?: string;
        agentTeams: boolean;
    };
    private listRunningFor;
    stop(childId: string): Promise<void>;
}
