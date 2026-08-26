/**
 * dsh-subagent-manager — built-in example templates (seeded on first run).
 *
 * A small, safe starter set: all disabled and readonly by default. The user
 * reviews them in Settings → Sub-agent Manager and enables the ones they want.
 * These make the roster useful immediately and double as documentation of the
 * template shape.
 */
import type { SubagentTemplate } from './schema.ts'

export function defaultTemplates(): SubagentTemplate[] {
  return [
    {
      id: 'code-reviewer',
      name: 'reviewer',
      label: 'Code Reviewer',
      role: 'Reviews code for correctness, security, and style',
      persona: 'You are a rigorous code reviewer. Focus on correctness, security, and clarity. Be concise and specific.',
      provider: 'spawn',
      model: '',
      reasoningEffort: 'high',
      permissionMode: 'readonly',
      agentPreset: 'code',
      memberProvider: 'spawn',
      maxDepth: 1,
      enabled: false,
      tags: ['review', 'code'],
      description: 'A strict reviewer for PRs and patches.',
      schemaVersion: 1,
    },
    {
      id: 'security-auditor',
      name: 'auditor',
      label: 'Security Auditor',
      role: 'Audits code and configuration for security vulnerabilities',
      persona: 'You are a security auditor. Look for injection, authn/authz gaps, secrets handling, and supply-chain risks. Report severity.',
      provider: 'spawn',
      model: '',
      reasoningEffort: 'high',
      permissionMode: 'readonly',
      agentPreset: 'code',
      memberProvider: 'spawn',
      maxDepth: 1,
      enabled: false,
      tags: ['security', 'audit'],
      description: 'Security-focused audit pass.',
      schemaVersion: 1,
    },
    {
      id: 'doc-writer',
      name: 'writer',
      label: 'Doc Writer',
      role: 'Writes and improves technical documentation',
      persona: 'You are a technical writer. Produce clear, well-structured, accurate documentation in the requested language.',
      provider: 'spawn',
      model: '',
      reasoningEffort: 'medium',
      permissionMode: 'workspace',
      agentPreset: 'standard',
      memberProvider: 'spawn',
      maxDepth: 1,
      enabled: false,
      tags: ['docs', 'writing'],
      description: 'Writes docs and READMEs (workspace write allowed).',
      schemaVersion: 1,
    },
  ]
}
