/**
 * dsh-subagent-manager — "Sub-agent Manager" settings page (M3).
 *
 * Reads/writes the host `/plugins/subagent-manager/state` route (GET polls,
 * POST writes) so all mutations ride the DSH process. Polls every ~3s with an
 * in-flight guard, and refreshes on window focus.
 */
import { useEffect, useRef, useState } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { SUBAGENT_MANAGER_LOCALE_NAMESPACE } from './locales.ts'

export interface SettingsPageProps {
  close?: () => void
}

/** Client mirror of the host template + running instance surfaces. */
export interface Tmpl {
  id: string
  name: string
  label: string
  role: string
  persona?: string
  provider: string
  model?: string
  reasoningEffort?: string
  permissionMode: 'readonly' | 'workspace' | 'full'
  memberProvider: 'spawn' | 'fork'
  maxDepth?: number
  enabled: boolean
  tags: string[]
  description?: string
  schemaVersion: number
}
interface Running {
  childId: string
  templateId: string
  status: string
}
interface State {
  templates: Tmpl[]
  running: Running[]
  revision: number
}

const EMPTY_STATE: State = { templates: [], running: [], revision: 0 }
const POLL_MS = 3000
const STATE_URL = '/plugins/subagent-manager/state'

async function readState(signal?: AbortSignal): Promise<State> {
  const res = await fetch(STATE_URL, { cache: 'no-store', signal })
  if (!res.ok) throw new Error(`load failed: ${res.status}`)
  return (await res.json()) as State
}

async function write(action: string, payload: unknown, expectedRevision: number): Promise<void> {
  const res = await fetch(STATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload, expectedRevision }),
  })
  const data = await res.json() as { error?: string; message?: string }
  if (!res.ok) throw new Error(data.message ?? data.error ?? `write failed: ${res.status}`)
}

function blank(): Tmpl {
  return {
    id: '', name: '', label: '', role: '', persona: '', provider: 'spawn', model: '',
    reasoningEffort: '', permissionMode: 'readonly', memberProvider: 'spawn', maxDepth: 1,
    enabled: false, tags: [], description: '', schemaVersion: 1,
  }
}

export function SettingsPage({
  close: _close,
  t,
}: SettingsPageProps & PropsLocale<typeof SUBAGENT_MANAGER_LOCALE_NAMESPACE>) {
  const [state, setState] = useState<State>(EMPTY_STATE)
  const [editing, setEditing] = useState<Tmpl | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inFlight = useRef(false)

  const refresh = async (): Promise<void> => {
    if (inFlight.current) return
    inFlight.current = true
    try {
      setState(await readState())
    } catch (err) {
      setError(String(err))
    } finally {
      inFlight.current = false
    }
  }

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => void refresh(), POLL_MS)
    const onFocus = (): void => void refresh()
    window.addEventListener('focus', onFocus)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', onFocus) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = async (tmpl: Tmpl): Promise<void> => {
    setError(null)
    const exists = state.templates.some((x) => x.id === tmpl.id)
    try {
      if (exists) await write('update', { id: tmpl.id, patch: tmpl }, state.revision)
      else await write('create', tmpl, state.revision)
      setEditing(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const setEnabled = async (id: string, enabled: boolean): Promise<void> => {
    setError(null)
    try { await write('set_enabled', { id, enabled }, state.revision); await refresh() }
    catch (err) { setError(err instanceof Error ? err.message : String(err)) }
  }

  const remove = async (id: string): Promise<void> => {
    const running = state.running.filter((r) => r.templateId === id).length
    const msg = running > 0
      ? `${id}: archive template (${running} running instance(s) keep running).`
      : `${id}: archive this template?`
    if (!window.confirm(msg)) return
    setError(null)
    try { await write('archive', { id }, state.revision); await refresh() }
    catch (err) { setError(err instanceof Error ? err.message : String(err)) }
  }

  const duplicate = async (id: string): Promise<void> => {
    setError(null)
    try { await write('duplicate', { id }, state.revision); await refresh() }
    catch (err) { setError(err instanceof Error ? err.message : String(err)) }
  }

  const exportJson = (): void => {
    const blob = new Blob([JSON.stringify(state.templates, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subagent-templates.json'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const importJson = async (file: File): Promise<void> => {
    setError(null)
    try {
      const arr = JSON.parse(await file.text()) as Tmpl[]
      for (const tmpl of arr) {
        if (state.templates.some((x) => x.id === tmpl.id)) continue
        await write('create', tmpl, state.revision)
      }
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const { templates, running } = state

  return (
    <section className="dsh-subagent-manager">
      <header>
        <h2>{t('settings.title')}</h2>
        <p>{t('settings.subtitle')}</p>
        <div>
          <button onClick={() => setEditing(blank())}>{t('template.create')}</button>
          <button onClick={exportJson}>{t('template.export')}</button>
          <label>{t('template.import')}
            <input type="file" accept="application/json" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importJson(f) }} />
          </label>
        </div>
      </header>

      {error && <p className="error">{error}</p>}

      {templates.length === 0 ? (
        <p>{t('template.empty')}</p>
      ) : (
        <ul>
          {templates.map((tmpl) => (
            <li key={tmpl.id}>
              <strong>{tmpl.label}</strong> <code>{tmpl.id}</code>
              <span> · {tmpl.role} · {tmpl.permissionMode} · {tmpl.model || tmpl.provider}</span>
              <label>
                <input type="checkbox" checked={tmpl.enabled} onChange={(e) => void setEnabled(tmpl.id, e.target.checked)} />
                {' '}{t('template.enabled')}
              </label>
              <button onClick={() => setEditing(tmpl)}>{t('template.edit')}</button>
              <button onClick={() => void duplicate(tmpl.id)}>{t('template.duplicate')}</button>
              <button onClick={() => void remove(tmpl.id)}>{t('template.delete')}</button>
              {running.some((r) => r.templateId === tmpl.id) && <span className="running">●</span>}
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <TemplateForm
          isNew={!state.templates.some((x) => x.id === editing.id)}
          initial={editing}
          onSave={save}
          onCancel={() => setEditing(null)}
          t={t}
        />
      )}
    </section>
  )
}

type T = (key: keyof typeof import('./locales.ts')['en']) => string

function TemplateForm({ initial, isNew, onSave, onCancel, t }: {
  initial: Tmpl
  isNew: boolean
  onSave: (tmpl: Tmpl) => Promise<void>
  onCancel: () => void
  t: T
}) {
  const [draft, setDraft] = useState<Tmpl>(initial)
  const set = (patch: Partial<Tmpl>): void => setDraft((d) => ({ ...d, ...patch }))
  const submit = (e: React.FormEvent): void => { e.preventDefault(); void onSave(draft) }
  return (
    <form onSubmit={submit}>
      <label>{t('template.id')} <input value={draft.id} disabled={!isNew} onChange={(e) => set({ id: e.target.value })} /></label>
      <label>{t('template.name')} <input value={draft.name} onChange={(e) => set({ name: e.target.value })} /></label>
      <label>{t('template.label')} <input value={draft.label} onChange={(e) => set({ label: e.target.value })} /></label>
      <label>{t('template.role')} <input value={draft.role} onChange={(e) => set({ role: e.target.value })} /></label>
      <label>{t('template.persona')} <textarea value={draft.persona ?? ''} onChange={(e) => set({ persona: e.target.value })} /></label>
      <label>{t('template.provider')} <input value={draft.provider} onChange={(e) => set({ provider: e.target.value })} /></label>
      <label>{t('template.model')} <input value={draft.model ?? ''} onChange={(e) => set({ model: e.target.value })} /></label>
      <label>{t('template.permissionMode')}
        <select value={draft.permissionMode} onChange={(e) => set({ permissionMode: e.target.value as Tmpl['permissionMode'] })}>
          <option value="readonly">readonly</option><option value="workspace">workspace</option><option value="full">full</option>
        </select>
      </label>
      <label>{t('template.maxDepth')} <input type="number" min={0} value={draft.maxDepth ?? 1} onChange={(e) => set({ maxDepth: Number(e.target.value) })} /></label>
      <label><input type="checkbox" checked={draft.enabled} onChange={(e) => set({ enabled: e.target.checked })} /> {t('template.enabled')}</label>
      <button type="submit">{t('template.save')}</button>
      <button type="button" onClick={onCancel}>{t('template.cancel')}</button>
    </form>
  )
}
