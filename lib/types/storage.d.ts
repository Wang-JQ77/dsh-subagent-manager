/**
 * dsh-subagent-manager — template persistence.
 *
 * Primary path: register a `subagent-manager` settings namespace through the
 * `dsh-settings` service (`ctx.settings`), so template state rides the profile
 * (settings.yaml, versioned, conflict-checked). If the service is unavailable
 * (feature-detect / compatibility defense), fall back to an in-memory store and
 * warn loudly — never scatter files into `process.cwd()`.
 */
import type { Context } from '@deepseek-ai/cordis';
import type SettingsProvider from '@deepseek-ai/dsh-settings';
import { type StoredTemplates } from './schema.ts';
/** Persistence seam; mocked in unit tests. */
export interface TemplateStorage {
    init(): Promise<void>;
    load(): Promise<StoredTemplates>;
    save(value: StoredTemplates): Promise<void>;
}
/** Convenience: empty default store for a fresh load. */
export declare function emptyStore(): StoredTemplates;
/** Settings-namespace-backed storage. */
export declare class SettingsTemplateStorage implements TemplateStorage {
    private readonly settings;
    private readonly ns;
    private scope;
    constructor(settings: SettingsProvider, ns?: string);
    init(): Promise<void>;
    load(): Promise<StoredTemplates>;
    save(value: StoredTemplates): Promise<void>;
}
/** In-memory fallback (feature-detect path); explicitly non-durable. */
export declare class MemoryTemplateStorage implements TemplateStorage {
    private value;
    init(): Promise<void>;
    load(): Promise<StoredTemplates>;
    save(value: StoredTemplates): Promise<void>;
}
/**
 * Build the storage adapter, feature-detecting the `settings` service. When it
 * is absent, logs a loud warning and returns the in-memory adapter.
 */
export declare function createTemplateStorage(ctx: Context, logger?: {
    warn?: (msg: string) => void;
}): TemplateStorage;
