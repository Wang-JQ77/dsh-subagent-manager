/**
 * dsh-subagent-manager — systemPrompt roster builder (M4.3).
 *
 * Builds the "template roster" text injected into the captain's context so a
 * natural-language team request ("use code-reviewer and security-auditor") can
 * resolve to enabled templates with their preset provider/model/persona. Pure + testable.
 */
import type { SubagentTemplate } from './schema.ts';
export declare function buildRosterText(templates: readonly SubagentTemplate[]): string;
