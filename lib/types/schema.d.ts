/**
 * dsh-subagent-manager — template schema + safety policy.
 *
 * The template schema is the durable cross-session recipe a member or an
 * independent continuable sub-agent is built from. Schema defaults and the
 * safety policy live here; the service enforces policy on write.
 */
import z from '@deepseek-ai/schemastery';
/** Roles that control how much a spawned sub-agent may do. */
export type PermissionMode = 'readonly' | 'workspace' | 'full';
/** Built-in agent composition presets a template may select. */
export type AgentPreset = 'standard' | 'code' | 'minimal' | 'creator';
/** Member-provider strategy used when launching a template. */
export type MemberProvider = 'spawn' | 'fork';
export declare const PermissionModeSchema: z<"readonly" | "workspace" | "full", "readonly" | "workspace" | "full">;
export declare const AgentPresetSchema: z<"standard" | "code" | "minimal" | "creator", "standard" | "code" | "minimal" | "creator">;
export declare const MemberProviderSchema: z<"spawn" | "fork", "spawn" | "fork">;
/**
 * A sub-agent template. `id` (kebab-case) is the stable instance/audit key;
 * `name` is the short member name used by agent-teams; `label` is the display
 * and natural-language roster name.
 */
export interface SubagentTemplate {
    id: string;
    name: string;
    /** Display / roster name (shown in UI lists and the system-prompt roster). */
    label: string;
    /** Role description + persona (used as the sub-agent's persona on launch). */
    role: string;
    avatar?: string;
    provider: string;
    model?: string;
    reasoningEffort?: string;
    permissionMode: PermissionMode;
    agentPreset?: AgentPreset;
    memberProvider: MemberProvider;
    maxDepth?: number;
    enabled: boolean;
    tags: string[];
    description?: string;
    /** 'global' (any project) or 'project:<id>' (only sessions whose cwd contains that path segment). */
    scope?: string;
    schemaVersion: number;
}
/** The schema of one template; defaults enforce the permissive reading. */
export declare const SubagentTemplateSchema: z<SubagentTemplate>;
/** The persisted store value (one settings namespace / one file). */
export interface StoredTemplates {
    schemaVersion: number;
    templates: SubagentTemplate[];
}
export declare const StoredTemplatesSchema: z<StoredTemplates>;
/** Validate the kebab-case id used as the instance/audit key. */
export declare function assertValidId(id: string): void;
/**
 * Resolve whether a template with the given scope is usable from a parent whose
 * cwd is `parentCwd`. `global` always passes; `project:<id>` requires the id to
 * appear as one of the cwd's path segments.
 */
export declare function scopeAllows(scope: string | undefined, parentCwd: string | undefined): boolean;
export declare function assertSafeTemplate(template: SubagentTemplate): void;
