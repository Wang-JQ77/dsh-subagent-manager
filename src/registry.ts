/**
 * dsh-subagent-manager — pure template registry (CVS + lifecycle).
 *
 * Cordis-independent so unit tests can drive it against a mock storage. The
 * `SubagentManager` service wraps this; launching (which needs `ctx.subagents`)
 * lives in the service.
 */
import {
  assertSafeTemplate,
  assertValidId,
  type SubagentTemplate,
  type StoredTemplates,
} from './schema.ts'

/** Persistence seam (structural slice of the storage adapter). */
export interface TemplateRegistryStorage {
  load(): Promise<StoredTemplates>
  save(value: StoredTemplates): Promise<void>
}

/** A running instance record surfaced by the M5 instance view. */
export interface RunningInstance {
  childId: string
  templateId: string
  templateLabel: string
  provider: string
  status: 'running' | 'idle'
  launchedAt: number
}

export class TemplateRegistry {
  private templates: SubagentTemplate[] = []

  constructor(private readonly storage: TemplateRegistryStorage) {}

  async init(): Promise<void> {
    this.templates = (await this.storage.load()).templates
  }

  private async persist(): Promise<void> {
    await this.storage.save({ schemaVersion: 1, templates: this.templates })
  }

  private require(id: string): SubagentTemplate {
    const found = this.templates.find((t) => t.id === id)
    if (!found) throw new Error(`template "${id}" does not exist`)
    return found
  }

  list(): SubagentTemplate[] {
    return this.templates.map((t) => ({ ...t }))
  }

  get(id: string): SubagentTemplate | undefined {
    const found = this.templates.find((t) => t.id === id)
    return found ? { ...found } : undefined
  }

  async create(input: SubagentTemplate): Promise<SubagentTemplate> {
    assertSafeTemplate(input)
    if (this.templates.some((t) => t.id === input.id)) {
      throw new Error(`template id "${input.id}" is already taken`)
    }
    const normalized: SubagentTemplate = { ...input, schemaVersion: 1 }
    this.templates.push(normalized)
    await this.persist()
    return { ...normalized }
  }

  async update(id: string, patch: Partial<SubagentTemplate>): Promise<SubagentTemplate> {
    const current = this.require(id)
    const merged: SubagentTemplate = { ...current, ...patch, id: current.id, schemaVersion: 1 }
    assertSafeTemplate(merged)
    this.templates = this.templates.map((t) => (t.id === id ? merged : t))
    await this.persist()
    return { ...merged }
  }

  async setEnabled(id: string, enabled: boolean): Promise<SubagentTemplate> {
    const current = this.require(id)
    const merged: SubagentTemplate = { ...current, enabled, schemaVersion: 1 }
    assertSafeTemplate(merged)
    this.templates = this.templates.map((t) => (t.id === id ? merged : t))
    await this.persist()
    return { ...merged }
  }

  /** Archive a template (never a physical delete); disables it and drops it from the roster. */
  async archive(id: string): Promise<{ archived: true }> {
    const current = this.require(id)
    const disabled: SubagentTemplate = { ...current, enabled: false }
    assertSafeTemplate(disabled)
    this.templates = this.templates.filter((t) => t.id !== id)
    await this.persist()
    return { archived: true }
  }

  async duplicate(id: string, newId?: string): Promise<SubagentTemplate> {
    const current = this.require(id)
    const outId = newId ?? `${current.id}-copy`
    assertValidId(outId)
    if (this.templates.some((t) => t.id === outId)) {
      throw new Error(`template id "${outId}" is already taken`)
    }
    const copy: SubagentTemplate = { ...current, id: outId, name: `${current.name}-copy`, enabled: false }
    await this.create(copy)
    return { ...copy }
  }

  /** Launch-time snapshot + gating. Returns the template snapshot or throws. */
  snapshotForLaunch(id: string): SubagentTemplate {
    const t = this.require(id)
    if (!t.enabled) throw new Error(`template "${id}" is disabled; enable it before launching`)
    if (t.permissionMode === 'full') throw new Error(`template "${id}" uses full permission and may not be launched`)
    return { ...t }
  }
}
