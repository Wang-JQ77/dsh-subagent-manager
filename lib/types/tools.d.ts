/**
 * dsh-subagent-manager — `subagent_template_*` model-facing tools.
 *
 * Let the model manage and launch sub-agent templates directly: list, create,
 * toggle enable, and launch a template as a durable continuable child. Render
 * `value` params are annotated with concrete output types so compile-time
 * inference of the schema DSL stays dependable under `noUncheckedIndexedAccess`.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { SubagentManager } from './service.ts';
export interface ListOutput {
    templates: {
        id: string;
        name: string;
        role: string;
        provider: string;
        model: string;
        permission_mode: string;
        enabled: boolean;
    }[];
}
export interface CreateOutput {
    id: string;
    name: string;
    label: string;
    role: string;
    permission_mode: string;
    enabled: boolean;
}
export interface EnableOutput {
    id: string;
    enabled: boolean;
    permission_mode: string;
}
export interface LaunchOutput {
    child_id: string;
    message_id: string;
    template_id: string;
}
/** Register all `subagent_template_*` tools against a running `ctx.subagentManager`. */
export declare function registerSubagentTemplateTools(ctx: Context, manager: SubagentManager): () => void;
