/**
 * dsh-subagent-manager — browser plugin.
 *
 * Registers the "Sub-agent Manager" settings section (a `settings.section`
 * entry, M3) plus its locale dictionaries. M3 fills the rest of the page.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the browser locale service into ClientContext.
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: makes the `settings.section` SlotMap entry (and its owner props,
// including `close`) visible via the settings-domain augmentation.
import type {} from '@deepseek-ai/dsh-client-ui-settings'
import { SettingsPage, type SettingsPageProps } from './SettingsPage.tsx'
import {
  SUBAGENT_MANAGER_LOCALE_NAMESPACE,
  en,
  zh,
  type SubAgentManagerLocaleKey,
} from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Sub-agent manager settings page and template list copy. */
    subagentManager: SubAgentManagerLocaleKey
  }
}

/** Required services: slot registry, locale, and sessions (for the current project filter). */
export const inject = ['slots', 'locale', 'sessions']

export function apply(ctx: ClientContext): void {
  ctx.effect(
    () => ctx.locale.register(SUBAGENT_MANAGER_LOCALE_NAMESPACE, { zh, en }),
    'subagent-manager: dictionaries',
  )

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'subagent-manager',
    order: 90,
    label: 'Sub-agent Manager',
    locale: SUBAGENT_MANAGER_LOCALE_NAMESPACE,
  }, (props: SettingsPageProps & PropsLocale<'subagentManager'>) => {
    // Current project (cwd) + change subscription, so the page can hide
    // templates scoped to other projects.
    const sessionsList = ctx.sessions.list
    const getCurrentCwd = (): string | undefined => {
      const snap = sessionsList.getSnapshot()
      const current = snap.current
      return current === undefined ? undefined : snap.byId[current]?.cwd
    }
    return (
      <SettingsPage
        {...props}
        getCurrentCwd={getCurrentCwd}
        subscribeSessions={sessionsList.subscribe.bind(sessionsList)}
      />
    )
  }))
}
