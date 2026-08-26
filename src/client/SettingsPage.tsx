/**
 * dsh-subagent-manager — "Sub-agent Manager" settings page.
 *
 * M1 skeleton: renders a minimal placeholder list. M3 fills the full
 * create/edit/enable/delete/duplicate/join-team flows wired to the host
 * `/plugins/subagent-manager/state` route.
 */
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import {
  SUBAGENT_MANAGER_LOCALE_NAMESPACE,
  type SubAgentManagerLocaleKey,
} from './locales.ts'

/** Owner share of a `settings.section` entry: the shell hands the section `close`. */
export interface SettingsPageProps {
  close?: () => void
}

export function SettingsPage({
  close: _close,
  t,
}: SettingsPageProps & PropsLocale<typeof SUBAGENT_MANAGER_LOCALE_NAMESPACE>) {
  const label = t('settings.title' as SubAgentManagerLocaleKey)
  return <section className="dsh-subagent-manager">{label}</section>
}
