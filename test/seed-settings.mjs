// Isolate: does seeding work through SettingsTemplateStorage?
import { TemplateRegistry } from '../lib/registry.js'
import { SettingsTemplateStorage } from '../lib/storage.js'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'

// Mock settings provider with a scope that behaves like dsh-settings.
function mockSettingsProvider() {
  let user = undefined
  const scope = {
    get: () => user ?? { schemaVersion: 1, templates: [] },
    replace: async (value) => { user = value },
    update: async (patch) => { user = { ...(user ?? {}), ...patch } },
  }
  return {
    register: (ns, schema, opts) => {
      console.log('register called, ns =', String(ns), '| schema is object =', typeof schema === 'object')
      return scope
    },
  }
}

const provider = mockSettingsProvider()
const storage = new SettingsTemplateStorage(provider, 'subagent-manager')
const reg = new TemplateRegistry(storage)
// Must mirror the fixed service flow: storage.init() BEFORE registry.init().
await storage.init()
await reg.init()
const list = reg.list()
console.log('after init, templates =', list.length)
for (const t of list) console.log(' -', t.id, t.label, 'enabled=', t.enabled)
if (list.length !== 3) {
  console.log('FAIL: expected 3 seeded defaults')
  process.exit(1)
}
console.log('OK: seeding works through SettingsTemplateStorage')
