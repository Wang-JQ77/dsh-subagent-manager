export type SubAgentTemplateAuditAction = 'created' | 'updated' | 'deleted' | 'enabled' | 'disabled' | 'launched' | 'joined-team';
/** Audit payload appended to the session event log on each template lifecycle action. */
export interface SubAgentTemplateAuditEvent {
    templateId: string;
    name: string;
    action: SubAgentTemplateAuditAction;
    at: string;
}
declare module '@deepseek-ai/dsh-session' {
    interface SessionEventMap {
        'subagent-manager/template-audit': SubAgentTemplateAuditEvent;
    }
}
