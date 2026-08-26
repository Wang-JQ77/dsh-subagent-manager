/**
 * Shared host/client event types (type-only, zero runtime imports) so the twin
 * tsconfigs' Context augmentations stay isolated. M2.3 fills in the
 * `subagent_template_*` audit events; the merge target is the session event map.
 */
export type SubAgentTemplateAuditAction = 'created' | 'updated' | 'deleted' | 'enabled' | 'disabled' | 'launched' | 'joined-team'

export interface SubAgentTemplateAuditEvent {
  templateId: string
  label: string
  action: SubAgentTemplateAuditAction
  at: string
}
