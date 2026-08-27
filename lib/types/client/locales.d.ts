/**
 * dsh-subagent-manager — client locale dictionaries.
 *
 * Registered through `ctx.locale.register(NAMESPACE, { zh, en })`. The key type
 * is derived from the English dictionary; the Chinese dictionary is checked
 * against it at build time.
 */
export declare const SUBAGENT_MANAGER_LOCALE_NAMESPACE = "subagentManager";
export declare const en: {
    readonly 'settings.title': "Sub-agent Manager";
    readonly 'settings.subtitle': "Create, edit, enable, and launch sub-agent templates.";
    readonly 'template.empty': "No templates yet. Create one to get started.";
    readonly 'template.create': "Create template";
    readonly 'template.id': "Id";
    readonly 'template.name': "Name";
    readonly 'template.label': "Label";
    readonly 'template.role': "Role";
    readonly 'template.provider': "Provider";
    readonly 'template.model': "Model";
    readonly 'template.reasoningEffort': "Reasoning effort";
    readonly 'template.permissionMode': "Permission mode";
    readonly 'template.memberProvider': "Member provider";
    readonly 'template.agentPreset': "Agent preset";
    readonly 'template.maxDepth': "Max depth";
    readonly 'template.tags': "Tags (comma separated)";
    readonly 'template.scope': "Scope";
    readonly 'template.scopeProject': "Project id";
    readonly 'template.description': "Description";
    readonly 'template.enabled': "Enabled";
    readonly 'template.onlyCurrentProject': "Only show templates for the current project";
    readonly 'template.hiddenCount': "({n} template(s) hidden — scoped to other projects)";
    readonly 'template.currentProject': "Current project: {p}. Project-scoped templates only work in sessions under this path.";
    readonly 'template.delete': "Delete";
    readonly 'template.duplicate': "Duplicate";
    readonly 'template.edit': "Edit";
    readonly 'template.export': "Export";
    readonly 'template.import': "Import";
    readonly 'template.save': "Save";
    readonly 'template.cancel': "Cancel";
    readonly 'template.joinTeam': "Join a team";
    readonly 'template.running': "Running instances";
    readonly 'template.stop': "Stop";
    readonly 'template.hint.id': "Stable kebab-case id (instance/audit key).";
    readonly 'template.hint.name': "Member name used by agent-teams; defaults to the id.";
    readonly 'template.hint.label': "Display / roster name shown in lists and the roster.";
    readonly 'template.hint.role': "Role description + persona; the sub-agent uses this as its persona.";
    readonly 'template.hint.provider': "fork = copy the calling session context; spawn = clean new session.";
    readonly 'template.hint.model': "Optional model override; empty uses the default.";
    readonly 'template.hint.reasoningEffort': "Reasoning level: low / medium / high (default medium).";
    readonly 'template.hint.permissionMode': "readonly / workspace / full. Full must stay disabled (safety).";
    readonly 'template.hint.memberProvider': "How this template becomes an agent-teams member (fork/spawn).";
    readonly 'template.hint.agentPreset': "Built-in capability combo: standard / code / minimal / creator.";
    readonly 'template.hint.maxDepth': "Delegation depth cap; 0 forbids delegation.";
    readonly 'template.hint.tags': "Comma-separated tags for natural-language matching.";
    readonly 'template.hint.scope': "global = any project; project = only sessions whose path contains the project id.";
    readonly 'template.hint.scopeProject': "Directory name of the project (must match a cwd path segment).";
    readonly 'template.hint.description': "Longer description (optional).";
};
export type SubAgentManagerLocaleKey = keyof typeof en;
export declare const zh: Record<SubAgentManagerLocaleKey, string>;
