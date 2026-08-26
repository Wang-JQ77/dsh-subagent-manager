/**
 * dsh-subagent-manager — systemPrompt roster builder (M4.3).
 *
 * Builds the "template roster" text injected into the captain's context so a
 * natural-language team request ("use code-reviewer and security-auditor") can
 * resolve to enabled templates with their preset provider/model/persona. Pure + testable.
 */
import type { SubagentTemplate } from './schema.ts'

export function buildRosterText(templates: readonly SubagentTemplate[]): string {
  const enabled = templates.filter((t) => t.enabled)
  if (enabled.length === 0) {
    return '[subagent-manager] No enabled sub-agent templates. Create one in Settings → Sub-agent Manager.'
  }
  const lines = enabled.map((t) => {
    const model = t.model?.trim() ? `, model="${t.model.trim()}"` : ''
    const depth = typeof t.maxDepth === 'number' ? `, maxDepth=${t.maxDepth}` : ''
    return `- ${t.name} (id ${t.id}): provider=${t.provider}, role="${t.role}", permissionMode=${t.permissionMode}, memberProvider=${t.memberProvider}${model}${depth}`
  })
  return [
    '[subagent-manager] Enabled sub-agent templates (use them as AgentTeams members):',
    ...lines,
    'To build a team, call agent_teams_create then agent_teams_add_member with a template\'s provider/model/persona above.',
  ].join('\n')
}
