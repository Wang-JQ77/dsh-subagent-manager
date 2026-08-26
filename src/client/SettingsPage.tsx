/**
 * dsh-subagent-manager — "Sub-agent Manager" settings page (M3).
 *
 * Reads/writes the host `/plugins/dsh-subagent-manager/state` route (GET polls,
 * POST writes) so all mutations ride the DSH process. Polls every ~3s with an
 * in-flight guard, and refreshes on window focus.
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { SUBAGENT_MANAGER_LOCALE_NAMESPACE } from './locales.ts'
import styles from './SettingsPage.module.css'

export interface SettingsPageProps {
  close?: () => void
  /** Current session cwd (project path); provided by the client entry. */
  getCurrentCwd?: () => string | undefined
  /** Session-list change subscription; provided by the client entry. */
  subscribeSessions?: (fn: () => void) => () => void
}

/** Client mirror of the host template + running instance surfaces. */
export interface Tmpl {
  id: string
  name: string
  label: string
  role: string
  provider: string
  model?: string
  reasoningEffort?: string
  permissionMode: 'readonly' | 'workspace' | 'full'
  agentPreset?: 'standard' | 'code' | 'minimal' | 'creator'
  memberProvider: 'spawn' | 'fork'
  maxDepth?: number
  enabled: boolean
  tags: string[]
  description?: string
  scope?: string
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
const STATE_URL = '/plugins/dsh-subagent-manager/state'

async function readState(signal?: AbortSignal): Promise<State> {
  const res = await fetch(STATE_URL, { cache: 'no-store', signal })
  if (!res.ok) throw new Error(`load failed: ${res.status}`)
  return (await res.json()) as State
}

async function writeResult<T>(action: string, payload: unknown, expectedRevision: number): Promise<T | undefined> {
  const res = await fetch(STATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload, expectedRevision }),
  })
  const data = await res.json() as { error?: string; message?: string; result?: T }
  if (!res.ok) throw new Error(data.message ?? data.error ?? `write failed: ${res.status}`)
  return data.result
}

async function write(action: string, payload: unknown, expectedRevision: number): Promise<void> {
  await writeResult<void>(action, payload, expectedRevision)
}

function blank(): Tmpl {
  return {
    id: '', name: '', label: '', role: '', provider: 'fork', model: '',
    reasoningEffort: 'medium', permissionMode: 'readonly', agentPreset: 'standard', memberProvider: 'fork', maxDepth: 1,
    enabled: true, tags: [], description: '', scope: 'global', schemaVersion: 1,
  }
}

export function SettingsPage({
  close: _close,
  getCurrentCwd,
  subscribeSessions,
  t,
}: SettingsPageProps & PropsLocale<typeof SUBAGENT_MANAGER_LOCALE_NAMESPACE>) {
  const [state, setState] = useState<State>(EMPTY_STATE)
  const [editing, setEditing] = useState<Tmpl | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [onlyCurrentProject, setOnlyCurrentProject] = useState(true)
  const inFlight = useRef(false)

  // Current project (cwd path segments) for the scope filter.
  const cwd = useSyncExternalStore(
    subscribeSessions ?? (() => () => {}),
    getCurrentCwd ?? (() => undefined),
    getCurrentCwd ?? (() => undefined),
  )
  const currentSegments = useMemo(() => (cwd ?? '').split(/[\\/]+/).filter(Boolean), [cwd])

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

  const joinTeam = async (id: string): Promise<void> => {
    setError(null)
    try {
      const res = await writeResult<{ provider: string; model?: string; persona?: string }>('join_team', { id }, state.revision)
      setNotice(res
        ? `已生成成员参数（${id}）：provider=${res.provider}, model=${res.model ?? '默认'}, persona=${res.persona ? '已设置' : '无'}。真正加入/退出团队需在会话内让模型调用 agent_teams_create / agent_teams_add_member / agent_teams_remove_member 完成——本按钮只生成参数，不会自动建队。`
        : 'ok')
    } catch (err) { setError(err instanceof Error ? err.message : String(err)) }
  }

  const stopInstance = async (childId: string): Promise<void> => {
    setError(null)
    try { await write('stop', { childId }, state.revision); await refresh() }
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
  const visibleTemplates = onlyCurrentProject
    ? templates.filter((t) => !t.scope?.startsWith('project:') || (t.scope !== undefined && currentSegments.includes(t.scope.replace(/^project:/, ''))))
    : templates
  const hiddenCount = templates.length - visibleTemplates.length

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h2>{t('settings.title')}</h2>
        <p className={styles.subtitle}>{t('settings.subtitle')}</p>
        <div className={styles.toolbar}>
          <button onClick={() => setEditing(blank())}>{t('template.create')}</button>
          <button onClick={exportJson}>{t('template.export')}</button>
          <label className={styles.import}>
            {t('template.import')}
            <input type="file" accept="application/json" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importJson(f) }} />
          </label>
        </div>
      </header>

      {error && <p className={styles.error}>{error}</p>}
      {notice && <p className={styles.notice}>{notice}</p>}

      {templates.length === 0 ? (
        <p className={styles.empty}>{t('template.empty')}</p>
      ) : (
        <>
          <label className={styles.enable}>
            <input type="checkbox" checked={onlyCurrentProject} onChange={(e) => setOnlyCurrentProject(e.target.checked)} />
            {' '}{t('template.onlyCurrentProject')}
          </label>
          {hiddenCount > 0 && <p className={styles.meta}>{t('template.hiddenCount').replace('{n}', String(hiddenCount))}</p>}
          {visibleTemplates.length === 0 ? (
            <p className={styles.empty}>{t('template.empty')}</p>
          ) : (
            <ul className={styles.list}>
              {visibleTemplates.map((tmpl) => (
                <li key={tmpl.id} className={styles.card}>
                  <div className={styles.cardMain}>
                    <strong>{tmpl.label}</strong> <code>{tmpl.id}</code>
                    <span className={styles.meta}> · {tmpl.role} · {tmpl.permissionMode} · {tmpl.model || tmpl.provider}</span>
                    {tmpl.scope && tmpl.scope !== 'global' && <span className={styles.scope}>{tmpl.scope.replace(/^project:/, '')}</span>}
                  </div>
                  <div className={styles.cardActions}>
                    <label className={styles.enable}>
                      <input type="checkbox" checked={tmpl.enabled} onChange={(e) => void setEnabled(tmpl.id, e.target.checked)} />
                      {' '}{t('template.enabled')}
                    </label>
                    <button onClick={() => setEditing(tmpl)}>{t('template.edit')}</button>
                    <button onClick={() => void duplicate(tmpl.id)}>{t('template.duplicate')}</button>
                    <button onClick={() => void joinTeam(tmpl.id)}>{t('template.joinTeam')}</button>
                    <button onClick={() => void remove(tmpl.id)}>{t('template.delete')}</button>
                    {running.some((r) => r.templateId === tmpl.id) && <span className={styles.running} title="running">●</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {editing && (
        <TemplateForm
          isNew={!state.templates.some((x) => x.id === editing.id)}
          initial={editing}
          currentProject={currentSegments.length ? currentSegments.join('/') : undefined}
          onSave={save}
          onCancel={() => setEditing(null)}
          t={t}
        />
      )}

      {running.length > 0 && (
        <section className={styles.running}>
          <h3>{t('template.running')}</h3>
          <ul className={styles.list}>
            {running.map((r) => (
              <li key={r.childId} className={styles.card}>
                <div className={styles.cardMain}>
                  <code>{r.childId}</code> · {r.templateId} · {r.status}
                </div>
                <button onClick={() => void stopInstance(r.childId)}>{t('template.stop')}</button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  )
}

type T = (key: keyof typeof import('./locales.ts')['en']) => string

function TemplateForm({ initial, isNew, currentProject, onSave, onCancel, t }: {
  initial: Tmpl
  isNew: boolean
  currentProject?: string
  onSave: (tmpl: Tmpl) => Promise<void>
  onCancel: () => void
  t: T
}) {
  const [draft, setDraft] = useState<Tmpl>(initial)
  const set = (patch: Partial<Tmpl>): void => setDraft((d) => ({ ...d, ...patch }))
  const submit = (e: React.FormEvent): void => { e.preventDefault(); void onSave(draft) }
  // name defaults to the id for new templates (user can still change it later).
  const setId = (id: string): void => {
    setDraft((d) => ({ ...d, id, ...(isNew && (d.name === '' || d.name === d.id) ? { name: id } : {}) }))
  }
  const field = (label: string, hint: string, control: React.ReactNode, full = false): React.ReactNode => (
    <label className={full ? styles.fieldFull : styles.field}>
      <span className={styles.label}>{label}</span>
      {control}
      <span className={styles.hint}>{hint}</span>
    </label>
  )
  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formGrid}>
        {field(t('template.id'), t('template.hint.id'), (
          <input value={draft.id} disabled={!isNew} onChange={(e) => setId(e.target.value)} />
        ))}
        {field(t('template.name'), t('template.hint.name'), (
          <input value={draft.name} onChange={(e) => set({ name: e.target.value })} />
        ))}
        {field(t('template.label'), t('template.hint.label'), (
          <input value={draft.label} onChange={(e) => set({ label: e.target.value })} />
        ))}
        {field(t('template.role'), t('template.hint.role'), (
          <textarea rows={3} value={draft.role} onChange={(e) => set({ role: e.target.value })} />
        ), true)}
        {field(t('template.provider'), t('template.hint.provider'), (
          <select value={draft.provider} onChange={(e) => set({ provider: e.target.value })}>
            <option value="fork">fork</option><option value="spawn">spawn</option>
          </select>
        ))}
        {field(t('template.model'), t('template.hint.model'), (
          <input value={draft.model ?? ''} onChange={(e) => set({ model: e.target.value })} />
        ))}
        {field(t('template.reasoningEffort'), t('template.hint.reasoningEffort'), (
          <select value={draft.reasoningEffort ?? 'medium'} onChange={(e) => set({ reasoningEffort: e.target.value })}>
            <option value="low">low</option><option value="medium">medium</option><option value="high">high</option>
          </select>
        ))}
        {field(t('template.permissionMode'), t('template.hint.permissionMode'), (
          <select
            value={draft.permissionMode}
            onChange={(e) => {
              const mode = e.target.value as Tmpl['permissionMode']
              // Safety rule: a "full" permission template must stay disabled.
              set({ permissionMode: mode, ...(mode === 'full' ? { enabled: false } : {}) })
            }}
          >
            <option value="readonly">readonly</option><option value="workspace">workspace</option><option value="full">full</option>
          </select>
        ))}
        {field(t('template.memberProvider'), t('template.hint.memberProvider'), (
          <select value={draft.memberProvider} onChange={(e) => set({ memberProvider: e.target.value as Tmpl['memberProvider'] })}>
            <option value="fork">fork</option><option value="spawn">spawn</option>
          </select>
        ))}
        {field(t('template.agentPreset'), t('template.hint.agentPreset'), (
          <select value={draft.agentPreset ?? 'standard'} onChange={(e) => set({ agentPreset: e.target.value as Tmpl['agentPreset'] })}>
            <option value="standard">standard</option><option value="code">code</option><option value="minimal">minimal</option><option value="creator">creator</option>
          </select>
        ))}
        {field(t('template.maxDepth'), t('template.hint.maxDepth'), (
          <input type="number" min={0} value={draft.maxDepth ?? 1} onChange={(e) => set({ maxDepth: Number(e.target.value) })} />
        ))}
        {field(t('template.tags'), t('template.hint.tags'), (
          <input value={draft.tags.join(', ')} onChange={(e) => set({ tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
        ))}
        {field(t('template.scope'), t('template.hint.scope'), (
          <select
            value={(draft.scope ?? 'global') === 'global' ? 'global' : 'project'}
            onChange={(e) => {
              const kind = e.target.value
              set({ scope: kind === 'global' ? 'global' : 'project:' })
            }}
          >
            <option value="global">global</option><option value="project">project</option>
          </select>
        ))}
        {(draft.scope ?? '').startsWith('project:') && field(t('template.scopeProject'), t('template.hint.scopeProject'), (
          <input
            value={(draft.scope ?? '').replace(/^project:/, '')}
            onChange={(e) => set({ scope: `project:${e.target.value.trim()}` })}
            placeholder="my-project"
          />
        ))}
        {field(t('template.description'), t('template.hint.description'), (
          <textarea rows={2} value={draft.description ?? ''} onChange={(e) => set({ description: e.target.value })} />
        ), true)}
      </div>

      {currentProject && (
        <p className={styles.hint}>{t('template.currentProject').replace('{p}', currentProject)}</p>
      )}

      <div className={styles.formFooter}>
        <label className={styles.enable}>
          <input type="checkbox" checked={draft.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
          {' '}{t('template.enabled')}
        </label>
        <div className={styles.formButtons}>
          <button type="submit">{t('template.save')}</button>
          <button type="button" onClick={onCancel}>{t('template.cancel')}</button>
        </div>
      </div>
    </form>
  )
}
