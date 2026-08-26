#!/usr/bin/env node
/**
 * Build-verify gate (M1 skeleton).
 *
 * M6 replaces this with the full verification pyramid (typecheck, build, unit
 * tests, verify script, dump-config, headless e2e, GUI, and a clean-profile
 * install dogfood). For now it asserts the emitted host/user-facing artifacts
 * exist so `pnpm build && pnpm verify` cannot silently succeed on an empty
 * build.
 */
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const required = [
  'lib/index.js',
  'lib/types/index.d.ts',
  'lib/service.js',
  'lib/client/index.js',
  'lib/client.js',
  'lib/types/client/index.d.ts',
]

let failed = false
for (const rel of required) {
  const p = join(root, rel)
  if (!existsSync(p)) {
    console.error(`verify: missing artifact ${rel}`)
    failed = true
  }
}

if (failed) {
  process.exit(1)
}

console.log('verify:build OK (skeleton artifacts present; full verify pyramid lands in M6)')
