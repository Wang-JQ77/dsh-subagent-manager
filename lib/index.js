import { SubagentManager } from "./service.js";
import { SubagentManagerConfig as ConfigSchema } from "./service.js";
import { registerSubagentTemplateTools } from "./tools.js";
import { buildRosterText } from "./roster.js";
/** Web-server service key candidates, newest first. */
const WEB_SERVER_KEYS = ['webServer', 'httpServer'];
/** Settings-page data route, following the `/plugins/<package>/state` convention. */
const STATE_ROUTE_PATH = '/plugins/dsh-subagent-manager/state';
export const name = 'subagent-manager';
// settings is injected so the template store registers its namespace against a
// bound dsh-settings service (otherwise apply() runs before it binds and the
// store silently falls back to in-memory, losing templates on restart).
export const inject = ['tools', 'systemPrompt', 'settings'];
export const Config = ConfigSchema;
export async function apply(ctx, config) {
    // Provide the template registry service (self-registers on ctx).
    const manager = new SubagentManager(ctx, config);
    // Function-plugin services don't get the Service.init lifecycle hook —
    // initialize storage + registry (seed defaults) explicitly here.
    await manager.ready();
    // Register the model-facing subagent_template_* tools, owned by this fiber.
    ctx.effect(() => registerSubagentTemplateTools(ctx, manager));
    // M4.3: systemPrompt roster injection — surface the enabled templates so the
    // captain can build an agent-teams team from them by natural language.
    ctx.systemPrompt.section({
        name: 'subagent-manager:roster',
        order: config.promptSectionOrder ?? 118,
        text: () => buildRosterText(manager.listSync()),
    });
    // Host route: settings page reads (GET) and writes (POST) through the same
    // DSH process. Conflicts are detected via the monotonic write revision.
    // `webServer` may bind AFTER this plugin during concurrent activation, so the
    // route is registered lazily: try now, then re-try on each service-bind
    // event (mirrors the agent-teams pattern). In a webless profile the plugin
    // stays tool/roster-only and never blocks boot.
    let stateRouteRegistered = false;
    const registerStateRoute = () => {
        if (stateRouteRegistered)
            return;
        const ws = detectWebServer(ctx);
        if (!ws)
            return;
        stateRouteRegistered = true;
        const handler = async (req, res) => {
            const mgr = ctx.subagentManager;
            if (req.method === 'GET') {
                return sendJson(res, 200, {
                    templates: await mgr.list(),
                    running: await mgr.listRunning(),
                    revision: mgr.getRevision(),
                });
            }
            if (req.method === 'POST') {
                const body = JSON.parse((await readBody(req)) || '{}');
                if (typeof body.expectedRevision === 'number' && body.expectedRevision !== mgr.getRevision()) {
                    return sendJson(res, 409, {
                        error: 'SETTINGS_CONFLICT',
                        message: 'Templates were changed by another session. Reload before writing.',
                    });
                }
                try {
                    const result = await dispatchAction(mgr, body.action, body.payload);
                    return sendJson(res, 200, { ok: true, result, revision: mgr.getRevision() });
                }
                catch (error) {
                    return sendJson(res, 400, {
                        error: 'BAD_REQUEST',
                        message: error instanceof Error ? error.message : String(error),
                    });
                }
            }
            return sendJson(res, 405, { error: 'METHOD_NOT_ALLOWED', message: 'Use GET to read or POST to write.' });
        };
        ctx.effect(() => ws.register({ kind: 'exact', path: STATE_ROUTE_PATH, handler }));
    };
    registerStateRoute();
    ctx.on('internal/service', (name) => {
        if (name === 'webServer' || name === 'httpServer')
            registerStateRoute();
    });
    // M4: agent-teams member join is driven in-session via the roster + tools.
}
/** Dispatch a settings write action to the template registry service. */
async function dispatchAction(mgr, action, payload) {
    const p = (payload ?? {});
    switch (action) {
        case 'create':
            return { template: await mgr.create(p) };
        case 'update': {
            const id = String(p.id);
            const patch = (p.patch ?? {});
            return { template: await mgr.update(id, patch) };
        }
        case 'set_enabled':
            return { template: await mgr.setEnabled(String(p.id), Boolean(p.enabled)) };
        case 'archive':
            return { result: await mgr.archive(String(p.id)) };
        case 'duplicate':
            return { template: await mgr.duplicate(String(p.id), p.newId ? String(p.newId) : undefined) };
        case 'join_team':
            return { member: mgr.memberParams(String(p.id)) };
        case 'stop':
            await mgr.stop(String(p.id));
            return { ok: true };
        default:
            throw new Error(`unknown action "${String(action)}"`);
    }
}
function sendJson(res, status, body) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(body));
}
function readBody(req) {
    return new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', (chunk) => { raw += chunk.toString('utf8'); });
        req.on('end', () => resolve(raw));
        req.on('error', reject);
    });
}
/** Resolve a web server service by key candidates, newest first. */
function detectWebServer(ctx) {
    for (const key of WEB_SERVER_KEYS) {
        const candidate = ctx.get(key);
        if (candidate && typeof candidate.register === 'function')
            return candidate;
    }
    return undefined;
}
