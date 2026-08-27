window.__ModuleLoader__.load({
	id: "dsh-subagent-manager",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region \0dsh-css:C:\Users\Wangjq\dsh-subagent-manager\src\client\SettingsPage.module.css.mjs
		const css = ".HFOWUq_page{max-width:720px;color:var(--text-1,#e8e8e8);flex-direction:column;gap:16px;padding:4px 2px;display:flex}.HFOWUq_header h2{margin:0 0 4px;font-size:20px;font-weight:600}.HFOWUq_subtitle{color:var(--text-2,#a0a0a0);margin:0 0 12px;font-size:13px}.HFOWUq_toolbar{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.HFOWUq_toolbar button,.HFOWUq_formButtons button,.HFOWUq_cardActions button{border:1px solid var(--border,#ffffff26);background:var(--bg-2,#ffffff0f);color:inherit;cursor:pointer;border-radius:8px;padding:6px 12px;font-size:13px}.HFOWUq_toolbar button:hover,.HFOWUq_formButtons button:hover,.HFOWUq_cardActions button:hover{background:var(--bg-3,#ffffff1f)}.HFOWUq_import{border:1px solid var(--border,#ffffff26);background:var(--bg-2,#ffffff0f);cursor:pointer;border-radius:8px;align-items:center;gap:6px;padding:6px 12px;font-size:13px;display:inline-flex}.HFOWUq_import input{max-width:140px}.HFOWUq_error{color:#ff6b6b;font-size:13px}.HFOWUq_notice{color:#7ecb8b;font-size:13px}.HFOWUq_empty{color:var(--text-2,#a0a0a0);font-size:14px}.HFOWUq_list{flex-direction:column;gap:8px;margin:0;padding:0;list-style:none;display:flex}.HFOWUq_card{border:1px solid var(--border,#ffffff1a);background:var(--bg-2,#ffffff0a);border-radius:10px;justify-content:space-between;align-items:center;gap:12px;padding:12px 14px;display:flex}.HFOWUq_cardMain{align-items:center;gap:8px;min-width:0;display:flex}.HFOWUq_cardMain code,.HFOWUq_meta{color:var(--text-2,#a0a0a0);font-size:12px}.HFOWUq_cardActions{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.HFOWUq_enable{white-space:nowrap;align-items:center;gap:6px;font-size:13px;display:inline-flex}.HFOWUq_running{color:#ffcf5c}.HFOWUq_scope{color:#7ecb8b;border:1px solid #7ecb8b66;border-radius:6px;padding:1px 6px;font-size:11px}.HFOWUq_form{border:1px solid var(--border,#ffffff1f);background:var(--bg-2,#ffffff08);border-radius:12px;padding:16px}.HFOWUq_formGrid{grid-template-columns:repeat(2,1fr);gap:14px 16px;display:grid}.HFOWUq_field,.HFOWUq_fieldFull{flex-direction:column;gap:6px;min-width:0;display:flex}.HFOWUq_fieldFull{grid-column:1/-1}.HFOWUq_label{color:var(--text-2,#a0a0a0);margin-bottom:2px;font-size:12px}.HFOWUq_hint{color:var(--text-3,gray);font-size:11px;line-height:1.4}.HFOWUq_hintInline{color:var(--text-3,gray);margin-left:6px;font-size:11px;font-weight:400}.HFOWUq_field input,.HFOWUq_field select,.HFOWUq_fieldFull textarea{border:1px solid var(--border,#ffffff26);background:var(--bg-1,#00000040);width:100%;color:inherit;box-sizing:border-box;border-radius:8px;padding:7px 10px;font-size:13px}.HFOWUq_field input:disabled{opacity:.6}.HFOWUq_formFooter{justify-content:space-between;align-items:center;gap:12px;margin-top:16px;display:flex}.HFOWUq_formButtons{gap:8px;display:flex}";
		const tagId = "dsh-subagent-manager/SettingsPage.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-subagent-manager";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var SettingsPage_module_css_default = {
			"card": "HFOWUq_card",
			"cardActions": "HFOWUq_cardActions",
			"cardMain": "HFOWUq_cardMain",
			"empty": "HFOWUq_empty",
			"enable": "HFOWUq_enable",
			"error": "HFOWUq_error",
			"field": "HFOWUq_field",
			"fieldFull": "HFOWUq_fieldFull",
			"form": "HFOWUq_form",
			"formButtons": "HFOWUq_formButtons",
			"formFooter": "HFOWUq_formFooter",
			"formGrid": "HFOWUq_formGrid",
			"header": "HFOWUq_header",
			"hint": "HFOWUq_hint",
			"hintInline": "HFOWUq_hintInline",
			"import": "HFOWUq_import",
			"label": "HFOWUq_label",
			"list": "HFOWUq_list",
			"meta": "HFOWUq_meta",
			"notice": "HFOWUq_notice",
			"page": "HFOWUq_page",
			"running": "HFOWUq_running",
			"scope": "HFOWUq_scope",
			"subtitle": "HFOWUq_subtitle",
			"toolbar": "HFOWUq_toolbar"
		};
		//#endregion
		//#region lib/client/SettingsPage.js
		/**
		* dsh-subagent-manager — "Sub-agent Manager" settings page (M3).
		*
		* Reads/writes the host `/plugins/dsh-subagent-manager/state` route (GET polls,
		* POST writes) so all mutations ride the DSH process. Polls every ~3s with an
		* in-flight guard, and refreshes on window focus.
		*/
		const EMPTY_STATE = {
			templates: [],
			running: [],
			revision: 0
		};
		const POLL_MS = 3e3;
		const STATE_URL = "/plugins/dsh-subagent-manager/state";
		async function readState(signal) {
			const res = await fetch(STATE_URL, {
				cache: "no-store",
				signal
			});
			if (!res.ok) throw new Error(`load failed: ${res.status}`);
			return await res.json();
		}
		async function writeResult(action, payload, expectedRevision) {
			const res = await fetch(STATE_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action,
					payload,
					expectedRevision
				})
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message ?? data.error ?? `write failed: ${res.status}`);
			return data.result;
		}
		async function write(action, payload, expectedRevision) {
			await writeResult(action, payload, expectedRevision);
		}
		function blank() {
			return {
				id: "",
				name: "",
				label: "",
				role: "",
				provider: "fork",
				model: "",
				reasoningEffort: "medium",
				permissionMode: "readonly",
				agentPreset: "standard",
				memberProvider: "fork",
				maxDepth: 1,
				enabled: true,
				tags: [],
				description: "",
				scope: "global",
				schemaVersion: 1
			};
		}
		function SettingsPage({ close: _close, getCurrentCwd, subscribeSessions, t }) {
			const [state, setState] = (0, react.useState)(EMPTY_STATE);
			const [editing, setEditing] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const [notice, setNotice] = (0, react.useState)(null);
			const [onlyCurrentProject, setOnlyCurrentProject] = (0, react.useState)(true);
			const inFlight = (0, react.useRef)(false);
			const cwd = (0, react.useSyncExternalStore)(subscribeSessions ?? (() => () => {}), getCurrentCwd ?? (() => void 0), getCurrentCwd ?? (() => void 0));
			const currentSegments = (0, react.useMemo)(() => (cwd ?? "").split(/[\\/]+/).filter(Boolean), [cwd]);
			const refresh = async () => {
				if (inFlight.current) return;
				inFlight.current = true;
				try {
					setState(await readState());
				} catch (err) {
					setError(String(err));
				} finally {
					inFlight.current = false;
				}
			};
			(0, react.useEffect)(() => {
				refresh();
				const timer = window.setInterval(() => void refresh(), POLL_MS);
				const onFocus = () => void refresh();
				window.addEventListener("focus", onFocus);
				return () => {
					window.clearInterval(timer);
					window.removeEventListener("focus", onFocus);
				};
			}, []);
			const save = async (tmpl) => {
				setError(null);
				const exists = state.templates.some((x) => x.id === tmpl.id);
				try {
					if (exists) await write("update", {
						id: tmpl.id,
						patch: tmpl
					}, state.revision);
					else await write("create", tmpl, state.revision);
					setEditing(null);
					await refresh();
				} catch (err) {
					setError(err instanceof Error ? err.message : String(err));
				}
			};
			const setEnabled = async (id, enabled) => {
				setError(null);
				try {
					await write("set_enabled", {
						id,
						enabled
					}, state.revision);
					await refresh();
				} catch (err) {
					setError(err instanceof Error ? err.message : String(err));
				}
			};
			const remove = async (id) => {
				const running = state.running.filter((r) => r.templateId === id).length;
				const msg = running > 0 ? `${id}: archive template (${running} running instance(s) keep running).` : `${id}: archive this template?`;
				if (!window.confirm(msg)) return;
				setError(null);
				try {
					await write("archive", { id }, state.revision);
					await refresh();
				} catch (err) {
					setError(err instanceof Error ? err.message : String(err));
				}
			};
			const duplicate = async (id) => {
				setError(null);
				try {
					await write("duplicate", { id }, state.revision);
					await refresh();
				} catch (err) {
					setError(err instanceof Error ? err.message : String(err));
				}
			};
			const joinTeam = async (id) => {
				setError(null);
				try {
					const res = await writeResult("join_team", { id }, state.revision);
					setNotice(res ? `已生成成员参数（${id}）：provider=${res.provider}, model=${res.model ?? "默认"}, persona=${res.persona ? "已设置" : "无"}。真正加入/退出团队需在会话内让模型调用 agent_teams_create / agent_teams_add_member / agent_teams_remove_member 完成——本按钮只生成参数，不会自动建队。` : "ok");
				} catch (err) {
					setError(err instanceof Error ? err.message : String(err));
				}
			};
			const stopInstance = async (childId) => {
				setError(null);
				try {
					await write("stop", { childId }, state.revision);
					await refresh();
				} catch (err) {
					setError(err instanceof Error ? err.message : String(err));
				}
			};
			const exportJson = () => {
				const blob = new Blob([JSON.stringify(state.templates, null, 2)], { type: "application/json" });
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = "subagent-templates.json";
				a.click();
				window.URL.revokeObjectURL(url);
			};
			const importJson = async (file) => {
				setError(null);
				try {
					const arr = JSON.parse(await file.text());
					for (const tmpl of arr) {
						if (state.templates.some((x) => x.id === tmpl.id)) continue;
						await write("create", tmpl, state.revision);
					}
					await refresh();
				} catch (err) {
					setError(err instanceof Error ? err.message : String(err));
				}
			};
			const { templates, running } = state;
			const visibleTemplates = onlyCurrentProject ? templates.filter((t) => !t.scope?.startsWith("project:") || t.scope !== void 0 && currentSegments.includes(t.scope.replace(/^project:/, ""))) : templates;
			const hiddenCount = templates.length - visibleTemplates.length;
			return (0, react_jsx_runtime.jsxs)("section", {
				className: SettingsPage_module_css_default.page,
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: SettingsPage_module_css_default.header,
						children: [
							(0, react_jsx_runtime.jsx)("h2", { children: t("settings.title") }),
							(0, react_jsx_runtime.jsx)("p", {
								className: SettingsPage_module_css_default.subtitle,
								children: t("settings.subtitle")
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: SettingsPage_module_css_default.toolbar,
								children: [
									(0, react_jsx_runtime.jsx)("button", {
										onClick: () => setEditing(blank()),
										children: t("template.create")
									}),
									(0, react_jsx_runtime.jsx)("button", {
										onClick: exportJson,
										children: t("template.export")
									}),
									(0, react_jsx_runtime.jsxs)("label", {
										className: SettingsPage_module_css_default.import,
										children: [t("template.import"), (0, react_jsx_runtime.jsx)("input", {
											type: "file",
											accept: "application/json",
											onChange: (e) => {
												const f = e.target.files?.[0];
												if (f) importJson(f);
											}
										})]
									})
								]
							})
						]
					}),
					error && (0, react_jsx_runtime.jsx)("p", {
						className: SettingsPage_module_css_default.error,
						children: error
					}),
					notice && (0, react_jsx_runtime.jsx)("p", {
						className: SettingsPage_module_css_default.notice,
						children: notice
					}),
					templates.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: SettingsPage_module_css_default.empty,
						children: t("template.empty")
					}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						(0, react_jsx_runtime.jsxs)("label", {
							className: SettingsPage_module_css_default.enable,
							children: [
								(0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: onlyCurrentProject,
									onChange: (e) => setOnlyCurrentProject(e.target.checked)
								}),
								" ",
								t("template.onlyCurrentProject")
							]
						}),
						hiddenCount > 0 && (0, react_jsx_runtime.jsx)("p", {
							className: SettingsPage_module_css_default.meta,
							children: t("template.hiddenCount").replace("{n}", String(hiddenCount))
						}),
						visibleTemplates.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
							className: SettingsPage_module_css_default.empty,
							children: t("template.empty")
						}) : (0, react_jsx_runtime.jsx)("ul", {
							className: SettingsPage_module_css_default.list,
							children: visibleTemplates.map((tmpl) => (0, react_jsx_runtime.jsxs)("li", {
								className: SettingsPage_module_css_default.card,
								children: [(0, react_jsx_runtime.jsxs)("div", {
									className: SettingsPage_module_css_default.cardMain,
									children: [
										(0, react_jsx_runtime.jsx)("strong", { children: tmpl.label }),
										" ",
										(0, react_jsx_runtime.jsx)("code", { children: tmpl.id }),
										(0, react_jsx_runtime.jsxs)("span", {
											className: SettingsPage_module_css_default.meta,
											children: [
												" · ",
												tmpl.role,
												" · ",
												tmpl.permissionMode,
												" · ",
												tmpl.model || tmpl.provider
											]
										}),
										tmpl.scope && tmpl.scope !== "global" && (0, react_jsx_runtime.jsx)("span", {
											className: SettingsPage_module_css_default.scope,
											children: tmpl.scope.replace(/^project:/, "")
										})
									]
								}), (0, react_jsx_runtime.jsxs)("div", {
									className: SettingsPage_module_css_default.cardActions,
									children: [
										(0, react_jsx_runtime.jsxs)("label", {
											className: SettingsPage_module_css_default.enable,
											children: [
												(0, react_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: tmpl.enabled,
													onChange: (e) => void setEnabled(tmpl.id, e.target.checked)
												}),
												" ",
												t("template.enabled")
											]
										}),
										(0, react_jsx_runtime.jsx)("button", {
											onClick: () => setEditing(tmpl),
											children: t("template.edit")
										}),
										(0, react_jsx_runtime.jsx)("button", {
											onClick: () => void duplicate(tmpl.id),
											children: t("template.duplicate")
										}),
										(0, react_jsx_runtime.jsx)("button", {
											onClick: () => void joinTeam(tmpl.id),
											children: t("template.joinTeam")
										}),
										(0, react_jsx_runtime.jsx)("button", {
											onClick: () => void remove(tmpl.id),
											children: t("template.delete")
										}),
										running.some((r) => r.templateId === tmpl.id) && (0, react_jsx_runtime.jsx)("span", {
											className: SettingsPage_module_css_default.running,
											title: "running",
											children: "●"
										})
									]
								})]
							}, tmpl.id))
						})
					] }),
					editing && (0, react_jsx_runtime.jsx)(TemplateForm, {
						isNew: !state.templates.some((x) => x.id === editing.id),
						initial: editing,
						currentProject: currentSegments.length ? currentSegments.join("/") : void 0,
						onSave: save,
						onCancel: () => setEditing(null),
						t
					}),
					running.length > 0 && (0, react_jsx_runtime.jsxs)("section", {
						className: SettingsPage_module_css_default.running,
						children: [(0, react_jsx_runtime.jsx)("h3", { children: t("template.running") }), (0, react_jsx_runtime.jsx)("ul", {
							className: SettingsPage_module_css_default.list,
							children: running.map((r) => (0, react_jsx_runtime.jsxs)("li", {
								className: SettingsPage_module_css_default.card,
								children: [(0, react_jsx_runtime.jsxs)("div", {
									className: SettingsPage_module_css_default.cardMain,
									children: [
										(0, react_jsx_runtime.jsx)("code", { children: r.childId }),
										" · ",
										r.templateId,
										" · ",
										r.status
									]
								}), (0, react_jsx_runtime.jsx)("button", {
									onClick: () => void stopInstance(r.childId),
									children: t("template.stop")
								})]
							}, r.childId))
						})]
					})
				]
			});
		}
		function TemplateForm({ initial, isNew, currentProject, onSave, onCancel, t }) {
			const [draft, setDraft] = (0, react.useState)(initial);
			const set = (patch) => setDraft((d) => ({
				...d,
				...patch
			}));
			const submit = (e) => {
				e.preventDefault();
				onSave(draft);
			};
			const setId = (id) => {
				setDraft((d) => ({
					...d,
					id,
					...isNew && (d.name === "" || d.name === d.id) ? { name: id } : {}
				}));
			};
			const field = (label, hint, control, full = false) => (0, react_jsx_runtime.jsxs)("label", {
				className: full ? SettingsPage_module_css_default.fieldFull : SettingsPage_module_css_default.field,
				children: [(0, react_jsx_runtime.jsxs)("span", {
					className: SettingsPage_module_css_default.label,
					children: [
						label,
						" ",
						(0, react_jsx_runtime.jsx)("span", {
							className: SettingsPage_module_css_default.hintInline,
							children: hint
						})
					]
				}), control]
			});
			return (0, react_jsx_runtime.jsxs)("form", {
				className: SettingsPage_module_css_default.form,
				onSubmit: submit,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: SettingsPage_module_css_default.formGrid,
						children: [
							field(t("template.id"), t("template.hint.id"), (0, react_jsx_runtime.jsx)("input", {
								value: draft.id,
								disabled: !isNew,
								onChange: (e) => setId(e.target.value)
							})),
							field(t("template.name"), t("template.hint.name"), (0, react_jsx_runtime.jsx)("input", {
								value: draft.name,
								onChange: (e) => set({ name: e.target.value })
							})),
							field(t("template.label"), t("template.hint.label"), (0, react_jsx_runtime.jsx)("input", {
								value: draft.label,
								onChange: (e) => set({ label: e.target.value })
							})),
							field(t("template.role"), t("template.hint.role"), (0, react_jsx_runtime.jsx)("textarea", {
								rows: 3,
								value: draft.role,
								onChange: (e) => set({ role: e.target.value })
							}), true),
							field(t("template.provider"), t("template.hint.provider"), (0, react_jsx_runtime.jsxs)("select", {
								value: draft.provider,
								onChange: (e) => set({ provider: e.target.value }),
								children: [(0, react_jsx_runtime.jsx)("option", {
									value: "fork",
									children: "fork"
								}), (0, react_jsx_runtime.jsx)("option", {
									value: "spawn",
									children: "spawn"
								})]
							})),
							field(t("template.model"), t("template.hint.model"), (0, react_jsx_runtime.jsx)("input", {
								value: draft.model ?? "",
								onChange: (e) => set({ model: e.target.value })
							})),
							field(t("template.reasoningEffort"), t("template.hint.reasoningEffort"), (0, react_jsx_runtime.jsxs)("select", {
								value: draft.reasoningEffort ?? "medium",
								onChange: (e) => set({ reasoningEffort: e.target.value }),
								children: [
									(0, react_jsx_runtime.jsx)("option", {
										value: "low",
										children: "low"
									}),
									(0, react_jsx_runtime.jsx)("option", {
										value: "medium",
										children: "medium"
									}),
									(0, react_jsx_runtime.jsx)("option", {
										value: "high",
										children: "high"
									})
								]
							})),
							field(t("template.permissionMode"), t("template.hint.permissionMode"), (0, react_jsx_runtime.jsxs)("select", {
								value: draft.permissionMode,
								onChange: (e) => {
									const mode = e.target.value;
									set({
										permissionMode: mode,
										...mode === "full" ? { enabled: false } : {}
									});
								},
								children: [
									(0, react_jsx_runtime.jsx)("option", {
										value: "readonly",
										children: "readonly"
									}),
									(0, react_jsx_runtime.jsx)("option", {
										value: "workspace",
										children: "workspace"
									}),
									(0, react_jsx_runtime.jsx)("option", {
										value: "full",
										children: "full"
									})
								]
							})),
							field(t("template.memberProvider"), t("template.hint.memberProvider"), (0, react_jsx_runtime.jsxs)("select", {
								value: draft.memberProvider,
								onChange: (e) => set({ memberProvider: e.target.value }),
								children: [(0, react_jsx_runtime.jsx)("option", {
									value: "fork",
									children: "fork"
								}), (0, react_jsx_runtime.jsx)("option", {
									value: "spawn",
									children: "spawn"
								})]
							})),
							field(t("template.agentPreset"), t("template.hint.agentPreset"), (0, react_jsx_runtime.jsxs)("select", {
								value: draft.agentPreset ?? "standard",
								onChange: (e) => set({ agentPreset: e.target.value }),
								children: [
									(0, react_jsx_runtime.jsx)("option", {
										value: "standard",
										children: "standard"
									}),
									(0, react_jsx_runtime.jsx)("option", {
										value: "code",
										children: "code"
									}),
									(0, react_jsx_runtime.jsx)("option", {
										value: "minimal",
										children: "minimal"
									}),
									(0, react_jsx_runtime.jsx)("option", {
										value: "creator",
										children: "creator"
									})
								]
							})),
							field(t("template.maxDepth"), t("template.hint.maxDepth"), (0, react_jsx_runtime.jsx)("input", {
								type: "number",
								min: 0,
								value: draft.maxDepth ?? 1,
								onChange: (e) => set({ maxDepth: Number(e.target.value) })
							})),
							field(t("template.tags"), t("template.hint.tags"), (0, react_jsx_runtime.jsx)("input", {
								value: draft.tags.join(", "),
								onChange: (e) => set({ tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
							})),
							field(t("template.scope"), t("template.hint.scope"), (0, react_jsx_runtime.jsxs)("select", {
								value: (draft.scope ?? "global") === "global" ? "global" : "project",
								onChange: (e) => {
									const kind = e.target.value;
									set({ scope: kind === "global" ? "global" : "project:" });
								},
								children: [(0, react_jsx_runtime.jsx)("option", {
									value: "global",
									children: "global"
								}), (0, react_jsx_runtime.jsx)("option", {
									value: "project",
									children: "project"
								})]
							})),
							(draft.scope ?? "").startsWith("project:") && field(t("template.scopeProject"), t("template.hint.scopeProject"), (0, react_jsx_runtime.jsx)("input", {
								value: (draft.scope ?? "").replace(/^project:/, ""),
								onChange: (e) => set({ scope: `project:${e.target.value.trim()}` }),
								placeholder: "my-project"
							})),
							field(t("template.description"), t("template.hint.description"), (0, react_jsx_runtime.jsx)("textarea", {
								rows: 2,
								value: draft.description ?? "",
								onChange: (e) => set({ description: e.target.value })
							}), true)
						]
					}),
					currentProject && (0, react_jsx_runtime.jsx)("p", {
						className: SettingsPage_module_css_default.hint,
						children: t("template.currentProject").replace("{p}", currentProject)
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: SettingsPage_module_css_default.formFooter,
						children: [(0, react_jsx_runtime.jsxs)("label", {
							className: SettingsPage_module_css_default.enable,
							children: [
								(0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: draft.enabled,
									onChange: (e) => set({ enabled: e.target.checked })
								}),
								" ",
								t("template.enabled")
							]
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: SettingsPage_module_css_default.formButtons,
							children: [(0, react_jsx_runtime.jsx)("button", {
								type: "submit",
								children: t("template.save")
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: onCancel,
								children: t("template.cancel")
							})]
						})]
					})
				]
			});
		}
		//#endregion
		//#region lib/client/locales.js
		/**
		* dsh-subagent-manager — client locale dictionaries.
		*
		* Registered through `ctx.locale.register(NAMESPACE, { zh, en })`. The key type
		* is derived from the English dictionary; the Chinese dictionary is checked
		* against it at build time.
		*/
		const SUBAGENT_MANAGER_LOCALE_NAMESPACE = "subagentManager";
		const en = {
			"settings.title": "Sub-agent Manager",
			"settings.subtitle": "Create, edit, enable, and launch sub-agent templates.",
			"template.empty": "No templates yet. Create one to get started.",
			"template.create": "Create template",
			"template.id": "Id",
			"template.name": "Name",
			"template.label": "Label",
			"template.role": "Role",
			"template.provider": "Provider",
			"template.model": "Model",
			"template.reasoningEffort": "Reasoning effort",
			"template.permissionMode": "Permission mode",
			"template.memberProvider": "Member provider",
			"template.agentPreset": "Agent preset",
			"template.maxDepth": "Max depth",
			"template.tags": "Tags (comma separated)",
			"template.scope": "Scope",
			"template.scopeProject": "Project id",
			"template.description": "Description",
			"template.enabled": "Enabled",
			"template.onlyCurrentProject": "Only show templates for the current project",
			"template.hiddenCount": "({n} template(s) hidden — scoped to other projects)",
			"template.currentProject": "Current project: {p}. Project-scoped templates only work in sessions under this path.",
			"template.delete": "Delete",
			"template.duplicate": "Duplicate",
			"template.edit": "Edit",
			"template.export": "Export",
			"template.import": "Import",
			"template.save": "Save",
			"template.cancel": "Cancel",
			"template.joinTeam": "Join a team",
			"template.running": "Running instances",
			"template.stop": "Stop",
			"template.hint.id": "Stable kebab-case id (instance/audit key).",
			"template.hint.name": "Member name used by agent-teams; defaults to the id.",
			"template.hint.label": "Display / roster name shown in lists and the roster.",
			"template.hint.role": "Role description + persona; the sub-agent uses this as its persona.",
			"template.hint.provider": "fork = copy the calling session context; spawn = clean new session.",
			"template.hint.model": "Optional model override; empty uses the default.",
			"template.hint.reasoningEffort": "Reasoning level: low / medium / high (default medium).",
			"template.hint.permissionMode": "readonly / workspace / full. Full must stay disabled (safety).",
			"template.hint.memberProvider": "How this template becomes an agent-teams member (fork/spawn).",
			"template.hint.agentPreset": "Built-in capability combo: standard / code / minimal / creator.",
			"template.hint.maxDepth": "Delegation depth cap; 0 forbids delegation.",
			"template.hint.tags": "Comma-separated tags for natural-language matching.",
			"template.hint.scope": "global = any project; project = only sessions whose path contains the project id.",
			"template.hint.scopeProject": "Directory name of the project (must match a cwd path segment).",
			"template.hint.description": "Longer description (optional)."
		};
		const zh = {
			"settings.title": "子 Agent 管理",
			"settings.subtitle": "创建、编辑、启用并拉起子 Agent 模板。",
			"template.empty": "暂无模板。创建一个开始使用。",
			"template.create": "新建模板",
			"template.id": "ID",
			"template.name": "名称",
			"template.label": "展示名",
			"template.role": "角色",
			"template.provider": "Provider",
			"template.model": "模型",
			"template.reasoningEffort": "推理强度",
			"template.permissionMode": "权限模式",
			"template.memberProvider": "成员 Provider",
			"template.agentPreset": "Agent 预设",
			"template.maxDepth": "最大深度",
			"template.tags": "标签（逗号分隔）",
			"template.scope": "作用域",
			"template.scopeProject": "项目 ID",
			"template.description": "描述",
			"template.enabled": "已启用",
			"template.onlyCurrentProject": "仅显示当前项目可用的模板",
			"template.hiddenCount": "（已隐藏 {n} 个模板——属于其他项目）",
			"template.currentProject": "当前项目：{p}。限定项目的模板只在该路径下的会话中可用。",
			"template.delete": "删除",
			"template.duplicate": "复制",
			"template.edit": "编辑",
			"template.export": "导出",
			"template.import": "导入",
			"template.save": "保存",
			"template.cancel": "取消",
			"template.joinTeam": "加入团队",
			"template.running": "运行中实例",
			"template.stop": "停止",
			"template.hint.id": "稳定唯一标识（kebab 式），作为实例/审计的 key。",
			"template.hint.name": "agent-teams 用的成员名；默认等于 id。",
			"template.hint.label": "展示名/名册名，列表和名册里显示的名字。",
			"template.hint.role": "角色描述 + 人设；子 Agent 以此作为人设。",
			"template.hint.provider": "fork = 复制调用方会话上下文；spawn = 全新干净会话。",
			"template.hint.model": "可选模型覆盖；留空用默认。",
			"template.hint.reasoningEffort": "推理强度：low / medium / high（默认 medium）。",
			"template.hint.permissionMode": "readonly / workspace / full。full 必须保持停用（安全规则）。",
			"template.hint.memberProvider": "该模板成为 agent-teams 成员的方式（fork/spawn）。",
			"template.hint.agentPreset": "内置能力组合预设：standard / code / minimal / creator。",
			"template.hint.maxDepth": "最大委托深度；0 = 禁止再委托。",
			"template.hint.tags": "逗号分隔标签，供自然语言匹配。",
			"template.hint.scope": "global = 任意项目；project = 仅路径包含该项目 ID 的会话可用。",
			"template.hint.scopeProject": "项目目录名（须与 cwd 的某个路径段一致）。",
			"template.hint.description": "更长的说明（可选）。"
		};
		//#endregion
		//#region lib/client/index.js
		/** Required services: slot registry, locale, and sessions (for the current project filter). */
		const inject = [
			"slots",
			"locale",
			"sessions"
		];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(SUBAGENT_MANAGER_LOCALE_NAMESPACE, {
				zh,
				en
			}), "subagent-manager: dictionaries");
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "subagent-manager",
				order: 90,
				label: "Sub-agent Manager",
				locale: SUBAGENT_MANAGER_LOCALE_NAMESPACE
			}, (props) => {
				const sessionsList = ctx.sessions.list;
				const getCurrentCwd = () => {
					const snap = sessionsList.getSnapshot();
					const current = snap.current;
					return current === void 0 ? void 0 : snap.byId[current]?.cwd;
				};
				return (0, react_jsx_runtime.jsx)(SettingsPage, {
					...props,
					getCurrentCwd,
					subscribeSessions: sessionsList.subscribe.bind(sessionsList)
				});
			}));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map