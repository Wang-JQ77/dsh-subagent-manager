/**
 * Declaration-merge augmentation: make `ctx.subagentManager` visible on the
 * Cordis `Context` interface for this plugin's host code, without importing
 * runtime values (type-only merge).
 */
import type { SubagentManager } from './service.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** The sub-agent template registry service. */
    readonly subagentManager: SubagentManager
  }
}
