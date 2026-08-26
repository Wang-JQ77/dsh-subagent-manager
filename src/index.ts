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
import type { Context } from '@deepseek-ai/cordis'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { SubagentManager, type SubagentManagerConfig } from './service.ts'
import { SubagentManagerConfig as ConfigSchema } from './service.ts'
import { registerSubagentTemplateTools } from './tools.ts'
import { buildRosterText } from './roster.ts'
import type { SubagentTemplate } from './schema.ts'

/**
 * Structural slice of the web server service, compatible with both the
 * published `dsh-host-webserver@0.0.1-rc.1` (`ctx.httpServer`) and the renamed
 * `webServer` in later builds. Missing keys are feature-detected and reported.
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

/** Settings-page data route, following the `/plugins/<package>/state` convention. */
const STATE_ROUTE_PATH = '/plugins/dsh-subagent-manager/state'

export const name = 'subagent-manager'
export const inject = ['tools', 'systemPrompt']

/** Plugin configuration (delegates to the service config schema). */
export type Config = SubagentManagerConfig
export const Config = ConfigSchema

export async function apply(ctx: Context, config: Config): Promise<void> {
  // Provide the template registry service (self-registers on ctx).
  const manager = new SubagentManager(ctx, config)
  // Function-plugin services don't get the Service.init lifecycle hook —
  // initialize storage + registry (seed defaults) explicitly here.
  await manager.ready()

  // Register the model-facing subagent_template_* tools, owned by this fiber.
  ctx.effect(() => registerSubagentTemplateTools(ctx, manager))

  // M4.3: systemPrompt roster injection — surface the enabled templates so the
  // captain can build an agent-teams team from them by natural language.
  ctx.systemPrompt.section({
    name: 'subagent-manager:roster',
    order: config.promptSectionOrder ?? 118,
    text: () => buildRosterText(manager.listSync()),
  })

  // Host route: settings page reads (GET) and writes (POST) through the same
  // DSH process. Conflicts are detected via the monotonic write revision.
  // `webServer` may bind AFTER this plugin during concurrent activation, so the
  // route is registered lazily: try now, then re-try on each service-bind
  // event (mirrors the agent-teams pattern). In a webless profile the plugin
  // stays tool/roster-only and never blocks boot.
  let stateRouteRegistered = false
  const registerStateRoute = (): void => {
    if (stateRouteRegistered) return
    const ws = detectWebServer(ctx)
    if (!ws) return
    stateRouteRegistered = true

    const handler = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
      const mgr = ctx.subagentManager
      if (req.method === 'GET') {
        return sendJson(res, 200, {
          templates: await mgr.list(),
          running: await mgr.listRunning(),
          revision: mgr.getRevision(),
        })
      }
      if (req.method === 'POST') {
        const body = JSON.parse((await readBody(req)) || '{}') as {
          action?: string
          payload?: unknown
          expectedRevision?: number
        }
        if (typeof body.expectedRevision === 'number' && body.expectedRevision !== mgr.getRevision()) {
          return sendJson(res, 409, {
            error: 'SETTINGS_CONFLICT',
            message: 'Templates were changed by another session. Reload before writing.',
          })
        }
        try {
          const result = await dispatchAction(mgr, body.action, body.payload)
          return sendJson(res, 200, { ok: true, result, revision: mgr.getRevision() })
        } catch (error) {
          return sendJson(res, 400, {
            error: 'BAD_REQUEST',
            message: error instanceof Error ? error.message : String(error),
          })
        }
      }
      return sendJson(res, 405, { error: 'METHOD_NOT_ALLOWED', message: 'Use GET to read or POST to write.' })
    }

    ctx.effect(() => ws.register({ kind: 'exact', path: STATE_ROUTE_PATH, handler }))
  }

  registerStateRoute()
  ctx.on('internal/service', (name: string) => {
    if (name === 'webServer' || name === 'httpServer') registerStateRoute()
  })

  // M4: agent-teams member join is driven in-session via the roster + tools.
}

/** Dispatch a settings write action to the template registry service. */
async function dispatchAction(mgr: SubagentManager, action: string | undefined, payload: unknown): Promise<unknown> {
  const p = (payload ?? {}) as Record<string, unknown>
  switch (action) {
    case 'create':
      return { template: await mgr.create(p as unknown as SubagentTemplate) }
    case 'update': {
      const id = String(p.id)
      const patch = (p.patch ?? {}) as Partial<SubagentTemplate>
      return { template: await mgr.update(id, patch) }
    }
    case 'set_enabled':
      return { template: await mgr.setEnabled(String(p.id), Boolean(p.enabled)) }
    case 'archive':
      return { result: await mgr.archive(String(p.id)) }
    case 'duplicate':
      return { template: await mgr.duplicate(String(p.id), p.newId ? String(p.newId) : undefined) }
    case 'join_team':
      return { member: mgr.memberParams(String(p.id)) }
    case 'stop':
      await mgr.stop(String(p.id))
      return { ok: true }
    default:
      throw new Error(`unknown action "${String(action)}"`)
  }
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk: Buffer) => { raw += chunk.toString('utf8') })
    req.on('end', () => resolve(raw))
    req.on('error', reject)
  })
}

/** Resolve a web server service by key candidates, newest first. */
function detectWebServer(ctx: Context): WebRouteHost | undefined {
  for (const key of WEB_SERVER_KEYS) {
    const candidate = ctx.get(key as any) as WebRouteHost | undefined
    if (candidate && typeof candidate.register === 'function') return candidate
  }
  return undefined
}
