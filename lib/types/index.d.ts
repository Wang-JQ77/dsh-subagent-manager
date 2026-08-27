/**
 * dsh-subagent-manager — host entry.
 *
 * A host-plane plugin that provides the `ctx.subagentManager` template registry
 * service (M2), the `subagent_template_*` management tools (M2.3), and the
 * `/plugins/subagent-manager/state` route the settings page reads (GET) and
 * writes through (POST, M3). The client half registers the "Sub-agent Manager"
 * settings section.
 *
 * Installation (bundle): `dsh plugin --profile <name> add dsh-subagent-manager`
 * (npm or a local path). The bundle patch mounts this plugin row into the host
 * composition.
 *
 * @module dsh-subagent-manager
 */
import type { Context } from '@deepseek-ai/cordis';
import { type SubagentManagerConfig } from './service.ts';
export declare const name = "subagent-manager";
export declare const inject: string[];
/** Plugin configuration (delegates to the service config schema). */
export type Config = SubagentManagerConfig;
export declare const Config: import("@deepseek-ai/schemastery").default<SubagentManagerConfig>;
export declare function apply(ctx: Context, config: Config): Promise<void>;
