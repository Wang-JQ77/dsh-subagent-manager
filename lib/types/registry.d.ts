/**
 * dsh-subagent-manager — pure template registry (CVS + lifecycle).
 *
 * Cordis-independent so unit tests can drive it against a mock storage. The
 * `SubagentManager` service wraps this; launching (which needs `ctx.subagents`)
 * lives in the service.
 */
import { type SubagentTemplate, type StoredTemplates } from './schema.ts';
/** Persistence seam (structural slice of the storage adapter). */
export interface TemplateRegistryStorage {
    load(): Promise<StoredTemplates>;
    save(value: StoredTemplates): Promise<void>;
}
/** A running instance record surfaced by the M5 instance view. */
export interface RunningInstance {
    childId: string;
    templateId: string;
    templateLabel: string;
    provider: string;
    status: 'running' | 'idle';
    launchedAt: number;
}
export declare class TemplateRegistry {
    private readonly storage;
    private templates;
    private revision;
    private readonly seedDefaults;
    constructor(storage: TemplateRegistryStorage, options?: {
        seedDefaults?: boolean;
    });
    init(): Promise<void>;
    private persist;
    /** Monotonic write revision used for optimistic-concurrency conflict detection. */
    getRevision(): number;
    private require;
    list(): SubagentTemplate[];
    get(id: string): SubagentTemplate | undefined;
    create(input: SubagentTemplate): Promise<SubagentTemplate>;
    update(id: string, patch: Partial<SubagentTemplate>): Promise<SubagentTemplate>;
    setEnabled(id: string, enabled: boolean): Promise<SubagentTemplate>;
    /** Archive a template (never a physical delete); disables it and drops it from the roster. */
    archive(id: string): Promise<{
        archived: true;
    }>;
    duplicate(id: string, newId?: string): Promise<SubagentTemplate>;
    /** Launch-time snapshot + gating. Returns the template snapshot or throws. */
    snapshotForLaunch(id: string): SubagentTemplate;
}
