/**
 * dsh-subagent-manager — template persistence.
 *
 * Primary path: register a `subagent-manager` settings namespace through the
 * `dsh-settings` service (`ctx.settings`), so template state rides the profile
 * (settings.yaml, versioned, conflict-checked). If the service is unavailable
 * (feature-detect / compatibility defense), fall back to an in-memory store and
 * warn loudly — never scatter files into `process.cwd()`.
 */
import type { Context } from '@deepseek-ai/cordis'
import type SettingsProvider from '@deepseek-ai/dsh-settings'
import type {} from '@deepseek-ai/dsh-settings'
import { settingsNamespace, type SettingsScope } from '@deepseek-ai/dsh-settings'
import { StoredTemplatesSchema, type StoredTemplates } from './schema.ts'

/** Persistence seam; mocked in unit tests. */
export interface TemplateStorage {
  init(): Promise<void>
  load(): Promise<StoredTemplates>
  save(value: StoredTemplates): Promise<void>
}

/** Convenience: empty default store for a fresh load. */
export function emptyStore(): StoredTemplates {
  return { schemaVersion: 1, templates: [] }
}

/** Settings-namespace-backed storage. */
export class SettingsTemplateStorage implements TemplateStorage {
  private scope: SettingsScope<StoredTemplates> | undefined

  constructor(
    private readonly settings: SettingsProvider,
    private readonly ns = 'subagent-manager',
  ) {}

  async init(): Promise<void> {
    this.scope = this.settings.register<StoredTemplates>(settingsNamespace(this.ns), StoredTemplatesSchema)
  }

  async load(): Promise<StoredTemplates> {
    return this.scope?.get() ?? emptyStore()
  }

  async save(value: StoredTemplates): Promise<void> {
    if (!this.scope) throw new Error('settings storage is not initialized')
    await this.scope.replace(value)
  }
}

/** In-memory fallback (feature-detect path); explicitly non-durable. */
export class MemoryTemplateStorage implements TemplateStorage {
  private value: StoredTemplates = emptyStore()

  async init(): Promise<void> {}
  async load(): Promise<StoredTemplates> {
    return structuredClone(this.value)
  }
  async save(value: StoredTemplates): Promise<void> {
    this.value = structuredClone(value)
  }
}

/**
 * Build the storage adapter, feature-detecting the `settings` service. When it
 * is absent, logs a loud warning and returns the in-memory adapter.
 */
export function createTemplateStorage(ctx: Context, logger?: { warn?: (msg: string) => void }): TemplateStorage {
  // Feature-detect via ctx.get (NOT direct property access, which throws unless
  // the service is in `inject`).
  const settings = ctx.get('settings' as any) as SettingsProvider | undefined
  if (settings?.register) {
    return new SettingsTemplateStorage(settings)
  }
  logger?.warn?.(
    '[subagent-manager] dsh-settings service (ctx.settings) not resolved; template persistence is in-memory only. Install dsh-settings in this profile for durable template state.',
  )
  return new MemoryTemplateStorage()
}
