import { jsx as _jsx } from "react/jsx-runtime";
import { SettingsPage } from "./SettingsPage.js";
import { SUBAGENT_MANAGER_LOCALE_NAMESPACE, en, zh, } from "./locales.js";
/** Required services: slot registry, locale, and sessions (for the current project filter). */
export const inject = ['slots', 'locale', 'sessions'];
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(SUBAGENT_MANAGER_LOCALE_NAMESPACE, { zh, en }), 'subagent-manager: dictionaries');
    ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'subagent-manager',
        order: 90,
        label: 'Sub-agent Manager',
        locale: SUBAGENT_MANAGER_LOCALE_NAMESPACE,
    }, (props) => {
        // Current project (cwd) + change subscription, so the page can hide
        // templates scoped to other projects.
        const sessionsList = ctx.sessions.list;
        const getCurrentCwd = () => {
            const snap = sessionsList.getSnapshot();
            const current = snap.current;
            return current === undefined ? undefined : snap.byId[current]?.cwd;
        };
        return (_jsx(SettingsPage, { ...props, getCurrentCwd: getCurrentCwd, subscribeSessions: sessionsList.subscribe.bind(sessionsList) }));
    }));
}
