/**
 * dsh-subagent-manager — host entry.
 *
 * A host-plane plugin that provides the `ctx.subagentManager` template registry
 * service (M2), the `subagent_template_*` management tools (M2.3), the system
 * prompt roster section (M4), and the `/plugins/subagent-manager/state` host
 * route the settings page polls (M3).
 *
 * Installation (bundle): `dsh plugin --profile <name> add dsh-subagent-manager`
 * (npm or a local path). The bundle patch mounts this plugin row into the host
 * composition; the client half registers the "Sub-agent Manager" settings
 * section.
 *
 * @module dsh-subagent-manager
 */
import type { Context } from '@deepseek-ai/cordis'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { SubagentManager, type SubagentManagerConfig } from './service.ts'
import { SubagentManagerConfig as ConfigSchema } from './service.ts'

/**
 * Structural slice of the web server service, compatible with both the
 * published `dsh-host-webserver@0.0.1-rc.1` (`ctx.httpServer`) and the renamed
 * `webServer` in later builds: the transition renames the service without
 * changing the route-registration shape. Missing keys are feature-detected and
 * reported rather than silently swallowed (compat-defense policy).
 */
interface WebRouteHost {
  register(route: {
    kind: 'exact' | 'prefix'
    path: string
    handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
  }): () => void
}

/** Web-server service key candidates, newest first. */
const WEB_SERVER_KEYS = ['webServer', 'httpServer'] as const

export const name = 'subagent-manager'
export const inject = ['tools']

/** Plugin configuration (delegates to the service config schema). */
export type Config = SubagentManagerConfig
export const Config = ConfigSchema

export function apply(ctx: Context, config: Config): void {
  // Provide the template registry service (self-registers on ctx).
  new SubagentManager(ctx, config)

  // Host route: settings page polls for template/instance state (M3). Returns
  // an empty snapshot until M2 fills the registry.
  const ws = detectWebServer(ctx)
  if (ws) {
    const handler = async (_req: IncomingMessage, res: ServerResponse): Promise<void> => {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', 'no-store')
      const body = JSON.stringify({
        templates: await ctx.subagentManager.list(),
        running: [],
      })
      res.end(body)
    }
    ctx.effect(() => ws.register({ kind: 'exact', path: '/plugins/subagent-manager/state', handler }))
  } else {
    // Feature-detect failure is an explicit report, never a silent hang.
    ctx.logger.warn?.(
      '[subagent-manager] no web server service (webServer/httpServer) resolved; the settings page state route is disabled. Install dsh-host-webserver in this profile.',
    )
  }

  // M2.3: ctx.tools.register(defineTool(...)) for subagent_template_{create,update,enable,remove,list}.
  // M2.2: persistence (settingsScope feature-detect or standalone file).
  // M4: systemPrompt roster section + agent-teams member join.
}

/** Resolve a web server service by key candidates, newest first. */
function detectWebServer(ctx: Context): WebRouteHost | undefined {
  for (const key of WEB_SERVER_KEYS) {
    const candidate = ctx.get(key as any) as WebRouteHost | undefined
    if (candidate && typeof candidate.register === 'function') return candidate
  }
  return undefined
}
