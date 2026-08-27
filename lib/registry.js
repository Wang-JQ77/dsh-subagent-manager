/**
 * dsh-subagent-manager — pure template registry (CVS + lifecycle).
 *
 * Cordis-independent so unit tests can drive it against a mock storage. The
 * `SubagentManager` service wraps this; launching (which needs `ctx.subagents`)
 * lives in the service.
 */
import { assertSafeTemplate, assertValidId, } from "./schema.js";
import { defaultTemplates } from "./default-templates.js";
export class TemplateRegistry {
    storage;
    templates = [];
    revision = 0;
    seedDefaults;
    constructor(storage, options) {
        this.storage = storage;
        this.seedDefaults = options?.seedDefaults ?? true;
    }
    async init() {
        const stored = await this.storage.load();
        // Seed a safe starter set on first run (empty store), like the native
        // presets ship standard/code/minimal. All defaults are disabled + readonly.
        if (this.seedDefaults && stored.templates.length === 0) {
            this.templates = defaultTemplates();
            await this.storage.save({ schemaVersion: 1, templates: this.templates });
            this.revision += 1;
        }
        else {
            this.templates = stored.templates;
        }
    }
    async persist() {
        await this.storage.save({ schemaVersion: 1, templates: this.templates });
        this.revision += 1;
    }
    /** Monotonic write revision used for optimistic-concurrency conflict detection. */
    getRevision() {
        return this.revision;
    }
    require(id) {
        const found = this.templates.find((t) => t.id === id);
        if (!found)
            throw new Error(`template "${id}" does not exist`);
        return found;
    }
    list() {
        return this.templates.map((t) => ({ ...t }));
    }
    get(id) {
        const found = this.templates.find((t) => t.id === id);
        return found ? { ...found } : undefined;
    }
    async create(input) {
        assertSafeTemplate(input);
        if (this.templates.some((t) => t.id === input.id)) {
            throw new Error(`template id "${input.id}" is already taken`);
        }
        const normalized = { ...input, schemaVersion: 1 };
        this.templates.push(normalized);
        await this.persist();
        return { ...normalized };
    }
    async update(id, patch) {
        const current = this.require(id);
        const merged = { ...current, ...patch, id: current.id, schemaVersion: 1 };
        assertSafeTemplate(merged);
        this.templates = this.templates.map((t) => (t.id === id ? merged : t));
        await this.persist();
        return { ...merged };
    }
    async setEnabled(id, enabled) {
        const current = this.require(id);
        const merged = { ...current, enabled, schemaVersion: 1 };
        assertSafeTemplate(merged);
        this.templates = this.templates.map((t) => (t.id === id ? merged : t));
        await this.persist();
        return { ...merged };
    }
    /** Archive a template (never a physical delete); disables it and drops it from the roster. */
    async archive(id) {
        const current = this.require(id);
        const disabled = { ...current, enabled: false };
        assertSafeTemplate(disabled);
        this.templates = this.templates.filter((t) => t.id !== id);
        await this.persist();
        return { archived: true };
    }
    async duplicate(id, newId) {
        const current = this.require(id);
        const outId = newId ?? `${current.id}-copy`;
        assertValidId(outId);
        if (this.templates.some((t) => t.id === outId)) {
            throw new Error(`template id "${outId}" is already taken`);
        }
        const copy = { ...current, id: outId, name: `${current.name}-copy`, enabled: false };
        await this.create(copy);
        return { ...copy };
    }
    /** Launch-time snapshot + gating. Returns the template snapshot or throws. */
    snapshotForLaunch(id) {
        const t = this.require(id);
        if (!t.enabled)
            throw new Error(`template "${id}" is disabled; enable it before launching`);
        if (t.permissionMode === 'full')
            throw new Error(`template "${id}" uses full permission and may not be launched`);
        return { ...t };
    }
}
