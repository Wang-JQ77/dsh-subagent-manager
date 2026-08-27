/**
 * dsh-subagent-manager — browser plugin.
 *
 * Registers the "Sub-agent Manager" settings section (a `settings.section`
 * entry, M3) plus its locale dictionaries. M3 fills the rest of the page.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type SubAgentManagerLocaleKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Sub-agent manager settings page and template list copy. */
        subagentManager: SubAgentManagerLocaleKey;
    }
}
/** Required services: slot registry, locale, and sessions (for the current project filter). */
export declare const inject: string[];
export declare function apply(ctx: ClientContext): void;
