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
import { Service } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { createTemplateStorage } from "./storage.js";
import { TemplateRegistry } from "./registry.js";
import { scopeAllows } from "./schema.js";
export const SubagentManagerConfig = z.object({
    storage: z.union([z.const('auto'), z.const('settings'), z.const('file')]).default('auto'),
    memberProvider: z.string().default('spawn'),
    memberMaxDepth: z.natural().default(1),
    promptSectionOrder: z.natural().default(118),
});
/**
 * Template registry service. Registers as `ctx.subagentManager`; the service
 * self-provides on construction and is removed with its owning fiber.
 */
export class SubagentManager extends Service {
    config;
    static Config = SubagentManagerConfig;
    storage;
    registry;
    running = new Map();
    constructor(ctx, config, storage) {
        super(ctx, 'subagentManager');
        this.config = config;
        this.storage = storage ?? createTemplateStorage(ctx, { warn: (msg) => ctx.logger.warn?.(msg) });
        this.registry = new TemplateRegistry(this.storage);
    }
    async [Service.init]() {
        // NOTE: this lifecycle hook is only invoked for class-style plugins. This
        // plugin is a function plugin that constructs the service in apply(), so
        // apply() must call ready() explicitly.
        await this.ready();
    }
    readyPromise;
    /**
     * Idempotently initialize storage (register the settings namespace) then the
     * registry (load + seed defaults). Called from apply() — see Service.init note.
     */
    ready() {
        this.readyPromise ??= (async () => {
            await this.storage.init();
            await this.registry.init();
        })();
        return this.readyPromise;
    }
    async list() {
        return this.registry.list();
    }
    /** Sync in-memory snapshot for the systemPrompt roster text. */
    listSync() {
        return this.registry.list();
    }
    async get(id) {
        return this.registry.get(id);
    }
    async create(input) {
        return this.registry.create(input);
    }
    async update(id, patch) {
        return this.registry.update(id, patch);
    }
    async setEnabled(id, enabled) {
        return this.registry.setEnabled(id, enabled);
    }
    async archive(id) {
        const archived = await this.registry.archive(id);
        return { ...archived, running: this.listRunningFor(id) };
    }
    async duplicate(id, newId) {
        return this.registry.duplicate(id, newId);
    }
    /**
     * Launch a template as a durable continuable child. Provider validation is
     * deferred to `ctx.subagents.startContinuable` (first use). Snapshot the
     * template at launch so later edits don't perturb this instance.
     */
    async launch(templateId, options) {
        const snapshot = this.registry.snapshotForLaunch(templateId);
        // Project-scoped templates may only launch from a matching workspace.
        const parentCwd = options.parent?.session?.header?.cwd;
        if (!scopeAllows(snapshot.scope, parentCwd)) {
            throw new Error(`template "${templateId}" is scoped to project "${(snapshot.scope ?? '').replace(/^project:/, '')}" and cannot launch from this workspace`);
        }
        // Feature-detect via ctx.get (subagents is optional, deferred to first use).
        const subagents = this.ctx.get('subagents');
        if (!subagents?.startContinuable)
            throw new Error('ctx.subagents is not available; install dsh-subagent in this profile');
        const spec = {
            provider: snapshot.provider,
            label: options.label ?? snapshot.label,
            request: {
                prompt: options.prompt,
                parent: options.parent,
                persona: snapshot.role,
                maxDepth: snapshot.maxDepth,
                agentOptions: snapshot.model ? { model: snapshot.model } : undefined,
            },
            signal: options.signal,
        };
        const started = await subagents.startContinuable(spec);
        this.running.set(started.childId, {
            childId: started.childId,
            templateId: templateId,
            templateLabel: snapshot.label,
            provider: snapshot.provider,
            status: 'running',
            launchedAt: Date.now(),
        });
        return { childId: started.childId, messageId: started.messageId, templateId: templateId };
    }
    async listRunning() {
        return [...this.running.values()];
    }
    /** Monotonic write revision for optimistic-concurrency conflict detection. */
    getRevision() {
        return this.registry.getRevision();
    }
    /**
     * Format the agent-teams member params for a template (M4 template=member).
     * Does not mutate state; team creation itself must be driven in a session via
     * the agent-teams tools (the roster injection tells the captain how).
     */
    memberParams(templateId) {
        const t = this.registry.get(templateId);
        if (!t)
            throw new Error(`template "${templateId}" does not exist`);
        return {
            templateId: t.id,
            provider: t.provider,
            model: t.model || undefined,
            persona: t.role || undefined,
            reasoningEffort: t.reasoningEffort || undefined,
            agentTeams: true,
        };
    }
    listRunningFor(templateId) {
        return [...this.running.values()].filter((r) => r.templateId === templateId);
    }
    async stop(childId) {
        this.running.delete(childId);
    }
}
