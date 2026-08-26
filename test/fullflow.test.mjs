/**
 * dsh-subagent-manager — full-flow end-to-end test against the real service.
 *
 * Drives the actual `SubagentManager` (built lib) with a mock cordis ctx and a
 * mock `ctx.subagents.startContinuable`, so the whole host flow runs without a
 * live LLM: seed defaults → CRUD → enable → launch → running → stop → archive
 * → duplicate → member params → roster text.
 *
 * Run: `node --test test/fullflow.test.mjs`
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Service } from '@deepseek-ai/cordis'
import { SubagentManager } from '../lib/service.js'
import { buildRosterText } from '../lib/roster.js'

function memoryStorage() {
  let value = { schemaVersion: 1, templates: [] }
  return {
    async init() {},
    async load() { return structuredClone(value) },
    async save(next) { value = structuredClone(next) },
    dump: () => structuredClone(value),
  }
}

function mockCtx() {
  const started = []
  const subagents = {
    startContinuable: async (spec) => {
      started.push(spec)
      return { childId: 'child-' + (started.length), messageId: 'msg-' + (started.length) }
    },
  }
  const ctx = {
    reflect: { provide: () => () => {} },
    logger: { warn: () => {} },
    get: (key) => (key === 'subagents' ? subagents : undefined),
    __started: started,
  }
  return ctx
}

const cfg = { storage: 'auto', memberProvider: 'spawn', memberMaxDepth: 1, promptSectionOrder: 118 }

test('full flow: seed → CRUD → enable → launch → running → stop → archive → duplicate → roster', async () => {
  const ctx = mockCtx()
  const svc = new SubagentManager(ctx, cfg, memoryStorage())
  await svc[Service.init]()

  // 1. Seed: 3 built-in templates, all disabled + readonly.
  const seeded = await svc.list()
  assert.equal(seeded.length, 3)
  for (const t of seeded) assert.equal(t.enabled, false)
  assert.ok(seeded.some((t) => t.id === 'code-reviewer'))
  assert.ok(seeded.some((t) => t.id === 'security-auditor'))
  assert.ok(seeded.some((t) => t.id === 'doc-writer'))

  // 2. Create a custom template.
  const created = await svc.create({
    id: 'test-runner', name: 'runner', label: 'Test Runner', role: 'runs tests',
    persona: 'You run tests and report failures.', provider: 'spawn',
    permissionMode: 'workspace', memberProvider: 'spawn', maxDepth: 1,
    enabled: false, tags: ['test'], schemaVersion: 1,
  })
  assert.equal(created.id, 'test-runner')
  assert.equal((await svc.list()).length, 4)

  // 3. Update label.
  const updated = await svc.update('test-runner', { label: 'Test Runner v2' })
  assert.equal(updated.label, 'Test Runner v2')

  // 4. Enable a template (readonly is safe).
  const enabled = await svc.setEnabled('code-reviewer', true)
  assert.equal(enabled.enabled, true)

  // 5. Launch → durable continuable child via (mocked) startContinuable.
  const started = await svc.launch('code-reviewer', {
    prompt: [{ type: 'text', text: 'review this' }],
    parent: {},
    signal: new AbortController().signal,
  })
  assert.equal(started.childId, 'child-1')
  assert.equal(ctx.__started.length, 1)
  assert.equal(ctx.__started[0].request.persona, 'You are a rigorous code reviewer. Focus on correctness, security, and clarity. Be concise and specific.')

  // 6. Running view.
  const running = await svc.listRunning()
  assert.equal(running.length, 1)
  assert.equal(running[0].templateId, 'code-reviewer')

  // 7. Launch a disabled template rejects; full+enabled rejects.
  await assert.rejects(() => svc.launch('security-auditor', { prompt: [{ type: 'text', text: 'x' }], parent: {}, signal: new AbortController().signal }), /disabled/)
  await assert.rejects(() => svc.setEnabled('test-runner', true).then(() => svc.create({ id: 'danger', name: 'd', label: 'D', role: 'r', permissionMode: 'full', enabled: true, memberProvider: 'spawn', provider: 'spawn', tags: [], schemaVersion: 1 })), /full.*enabled/)

  // 8. Archive removes; running instance unaffected by archive of a different template.
  await svc.archive('security-auditor')
  assert.equal((await svc.list()).some((t) => t.id === 'security-auditor'), false)

  // 9. Duplicate is always disabled.
  const copy = await svc.duplicate('code-reviewer', 'code-reviewer-2')
  assert.equal(copy.id, 'code-reviewer-2')
  assert.equal(copy.enabled, false)

  // 10. member params for agent-teams (template = member).
  const member = svc.memberParams('code-reviewer')
  assert.equal(member.provider, 'spawn')
  assert.equal(member.persona.includes('rigorous'), true)

  // 11. Stop clears the running registry.
  await svc.stop('child-1')
  assert.equal((await svc.listRunning()).length, 0)

  // 12. Roster text lists enabled templates.
  const roster = buildRosterText(await svc.list())
  assert.match(roster, /Code Reviewer/)
  assert.match(roster, /agent_teams_add_member/)
})
