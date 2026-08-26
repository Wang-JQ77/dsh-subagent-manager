/**
 * dsh-subagent-manager — unit tests for the pure template registry + safety
 * policy (M2.5). Runs against the compiled `lib/` with Node's built-in test
 * runner, so no extra test framework is needed.
 *
 * Run: `node --test test/registry.test.mjs`
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { TemplateRegistry } from '../lib/registry.js'
import { assertSafeTemplate, assertValidId } from '../lib/schema.js'

function storage(initial = []) {
  let value = { schemaVersion: 1, templates: initial }
  return {
    async load() { return structuredClone(value) },
    async save(next) { value = structuredClone(next) },
    dump: () => structuredClone(value),
  }
}

function template(overrides = {}) {
  return {
    id: 'code-reviewer',
    name: 'reviewer',
    label: 'Code Reviewer',
    role: 'reviews code for correctness and security',
    persona: 'You are a rigorous reviewer.',
    provider: 'spawn',
    permissionMode: 'readonly',
    memberProvider: 'spawn',
    maxDepth: 1,
    enabled: false,
    tags: ['review', 'code'],
    schemaVersion: 1,
    ...overrides,
  }
}

test('create + list roundtrip', async () => {
  const reg = new TemplateRegistry(storage())
  await reg.init()
  await reg.create(template())
  assert.equal(reg.list().length, 1)
  assert.equal(reg.get('code-reviewer').label, 'Code Reviewer')
  assert.equal(reg.get('missing'), undefined)
})

test('duplicate id is rejected', async () => {
  const reg = new TemplateRegistry(storage())
  await reg.init()
  await reg.create(template())
  await assert.rejects(() => reg.create(template()), /already taken/)
})

test('full-permission + enabled is rejected by policy', () => {
  assert.throws(() => assertSafeTemplate(template({ permissionMode: 'full', enabled: true })), /full.*enabled/)
  // safe: full permission but disabled is allowed
  assert.doesNotThrow(() => assertSafeTemplate(template({ permissionMode: 'full', enabled: false })))
})

test('create rejects dangerous combo end-to-end', async () => {
  const reg = new TemplateRegistry(storage())
  await reg.init()
  await assert.rejects(
    () => reg.create(template({ permissionMode: 'full', enabled: true })),
    /full.*enabled/,
  )
})

test('blank label/role is rejected', () => {
  assert.throws(() => assertSafeTemplate(template({ label: '' })), /label and role/)
  assert.throws(() => assertSafeTemplate(template({ role: '  ' })), /label and role/)
})

test('invalid id rejected', () => {
  assert.throws(() => assertValidId('Bad_Id'), /kebab-case/)
  assert.doesNotThrow(() => assertValidId('code-reviewer'))
})

test('disable blocks launch; running unaffected by edit', async () => {
  const reg = new TemplateRegistry(storage())
  await reg.init()
  await reg.create(template()) // disabled by default
  assert.throws(() => reg.snapshotForLaunch('code-reviewer'), /disabled/)
  await reg.setEnabled('code-reviewer', true)
  const snap = reg.snapshotForLaunch('code-reviewer')
  assert.equal(snap.label, 'Code Reviewer')
})

test('edit snapshot: update does not mutate the launch snapshot', async () => {
  const reg = new TemplateRegistry(storage())
  await reg.init()
  await reg.create(template({ enabled: true }))
  const before = reg.snapshotForLaunch('code-reviewer')
  await reg.update('code-reviewer', { label: 'Changed Label' })
  // Running instance keeps its launch snapshot (the launch-time copy), not the edit.
  assert.equal(before.label, 'Code Reviewer')
  assert.equal(reg.get('code-reviewer').label, 'Changed Label')
})

test('archive disables and removes; duplicate creates disabled copy', async () => {
  const reg = new TemplateRegistry(storage())
  await reg.init()
  await reg.create(template())
  await reg.setEnabled('code-reviewer', true)
  await reg.archive('code-reviewer')
  assert.equal(reg.get('code-reviewer'), undefined)
  await reg.create(template())
  const copy = await reg.duplicate('code-reviewer', 'code-reviewer-2')
  assert.equal(copy.id, 'code-reviewer-2')
  assert.equal(copy.enabled, false) // duplicate is always disabled
})

test('persistence writes through the storage adapter', async () => {
  const store = storage()
  const reg = new TemplateRegistry(store)
  await reg.init()
  await reg.create(template())
  assert.equal(store.dump().templates.length, 1)
})

import { buildRosterText } from '../lib/roster.js'
test('roster text: disabled templates are excluded and fields are listed', () => {
  const text = buildRosterText([
    template({ id: 'code-reviewer', label: 'Code Reviewer', enabled: true, provider: 'spawn' }),
    template({ id: 'auditor', label: 'Security Auditor', enabled: false }),
  ])
  assert.match(text, /Code Reviewer/)
  assert.doesNotMatch(text, /Security Auditor/)
  assert.match(text, /provider=spawn/)
})
