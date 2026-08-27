import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import { SUBAGENT_MANAGER_LOCALE_NAMESPACE } from './locales.ts';
export interface SettingsPageProps {
    close?: () => void;
    /** Current session cwd (project path); provided by the client entry. */
    getCurrentCwd?: () => string | undefined;
    /** Session-list change subscription; provided by the client entry. */
    subscribeSessions?: (fn: () => void) => () => void;
}
/** Client mirror of the host template + running instance surfaces. */
export interface Tmpl {
    id: string;
    name: string;
    label: string;
    role: string;
    provider: string;
    model?: string;
    reasoningEffort?: string;
    permissionMode: 'readonly' | 'workspace' | 'full';
    agentPreset?: 'standard' | 'code' | 'minimal' | 'creator';
    memberProvider: 'spawn' | 'fork';
    maxDepth?: number;
    enabled: boolean;
    tags: string[];
    description?: string;
    scope?: string;
    schemaVersion: number;
}
export declare function SettingsPage({ close: _close, getCurrentCwd, subscribeSessions, t, }: SettingsPageProps & PropsLocale<typeof SUBAGENT_MANAGER_LOCALE_NAMESPACE>): import("react/jsx-runtime").JSX.Element;
