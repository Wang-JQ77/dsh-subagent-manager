import { settingsNamespace } from '@deepseek-ai/dsh-settings';
import { StoredTemplatesSchema } from "./schema.js";
/** Convenience: empty default store for a fresh load. */
export function emptyStore() {
    return { schemaVersion: 1, templates: [] };
}
/** Settings-namespace-backed storage. */
export class SettingsTemplateStorage {
    settings;
    ns;
    scope;
    constructor(settings, ns = 'subagent-manager') {
        this.settings = settings;
        this.ns = ns;
    }
    async init() {
        this.scope = this.settings.register(settingsNamespace(this.ns), StoredTemplatesSchema);
    }
    async load() {
        return this.scope?.get() ?? emptyStore();
    }
    async save(value) {
        if (!this.scope)
            throw new Error('settings storage is not initialized');
        await this.scope.replace(value);
    }
}
/** In-memory fallback (feature-detect path); explicitly non-durable. */
export class MemoryTemplateStorage {
    value = emptyStore();
    async init() { }
    async load() {
        return structuredClone(this.value);
    }
    async save(value) {
        this.value = structuredClone(value);
    }
}
/**
 * Build the storage adapter, feature-detecting the `settings` service. When it
 * is absent, logs a loud warning and returns the in-memory adapter.
 */
export function createTemplateStorage(ctx, logger) {
    // Feature-detect via ctx.get (NOT direct property access, which throws unless
    // the service is in `inject`).
    const settings = ctx.get('settings');
    if (settings?.register) {
        return new SettingsTemplateStorage(settings);
    }
    logger?.warn?.('[subagent-manager] dsh-settings service (ctx.settings) not resolved; template persistence is in-memory only. Install dsh-settings in this profile for durable template state.');
    return new MemoryTemplateStorage();
}
