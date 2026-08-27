/**
 * dsh-subagent-manager — template schema + safety policy.
 *
 * The template schema is the durable cross-session recipe a member or an
 * independent continuable sub-agent is built from. Schema defaults and the
 * safety policy live here; the service enforces policy on write.
 */
import z from '@deepseek-ai/schemastery';
export const PermissionModeSchema = z.union([z.const('readonly'), z.const('workspace'), z.const('full')]);
export const AgentPresetSchema = z.union([z.const('standard'), z.const('code'), z.const('minimal'), z.const('creator')]);
export const MemberProviderSchema = z.union([z.const('spawn'), z.const('fork')]);
/** The schema of one template; defaults enforce the permissive reading. */
export const SubagentTemplateSchema = z.object({
    id: z.string().required(),
    name: z.string().required(),
    label: z.string().required(),
    role: z.string().required(),
    avatar: z.string().default(''),
    provider: z.string().default('fork'),
    model: z.string().default(''),
    reasoningEffort: z.string().default('medium'),
    permissionMode: PermissionModeSchema.default('readonly'),
    agentPreset: AgentPresetSchema.default('standard'),
    memberProvider: MemberProviderSchema.default('fork'),
    maxDepth: z.natural().default(1),
    enabled: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
    description: z.string().default(''),
    scope: z.string().default('global'),
    schemaVersion: z.natural().default(1),
});
export const StoredTemplatesSchema = z.object({
    schemaVersion: z.natural().default(1),
    templates: z.array(SubagentTemplateSchema).default([]),
});
const SAFE_ID = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
/** Validate the kebab-case id used as the instance/audit key. */
export function assertValidId(id) {
    if (!SAFE_ID.test(id)) {
        throw new Error(`template id "${id}" must be kebab-case ([a-z0-9][a-z0-9-]*)`);
    }
}
/**
 * Resolve whether a template with the given scope is usable from a parent whose
 * cwd is `parentCwd`. `global` always passes; `project:<id>` requires the id to
 * appear as one of the cwd's path segments.
 */
export function scopeAllows(scope, parentCwd) {
    if (!scope || scope === 'global')
        return true;
    const prefix = 'project:';
    if (!scope.startsWith(prefix))
        return true; // unknown scope: do not block
    const projectId = scope.slice(prefix.length).trim();
    if (projectId === '')
        return true;
    if (!parentCwd)
        return false;
    const segments = parentCwd.split(/[\\/]+/).filter(Boolean);
    return segments.includes(projectId);
}
export function assertSafeTemplate(template) {
    assertValidId(template.id);
    if (template.permissionMode === 'full' && template.enabled) {
        throw new Error(`template "${template.id}": "full" permission may not be enabled (readonly is the safe default; disable before enabling)`);
    }
    if (template.name.trim() === '' || template.label.trim() === '' || template.role.trim() === '') {
        throw new Error(`template "${template.id}": name, label and role must not be empty`);
    }
}
