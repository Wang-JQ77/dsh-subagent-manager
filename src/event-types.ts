/**
 * Shared host/client event types (type-only, zero runtime imports) so the twin
 * tsconfigs' Context augmentations stay isolated. The merge target is the
 * session event map so audit events flow into the session log.
 */
import type {} from '@deepseek-ai/dsh-session'

export type SubAgentTemplateAuditAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'enabled'
  | 'disabled'
  | 'launched'
  | 'joined-team'

/** Audit payload appended to the session event log on each template lifecycle action. */
export interface SubAgentTemplateAuditEvent {
  templateId: string
  label: string
  action: SubAgentTemplateAuditAction
  at: string
}

// Declaration merge: make the audit event part of the session event map so the
// host can append it via `ctx.session.append('subagent-manager/template-audit', ...)`.
declare module '@deepseek-ai/dsh-session' {
  interface SessionEventMap {
    'subagent-manager/template-audit': SubAgentTemplateAuditEvent
  }
}
