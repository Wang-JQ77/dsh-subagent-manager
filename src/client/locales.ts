/**
 * dsh-subagent-manager — client locale dictionaries.
 *
 * Registered through `ctx.locale.register(NAMESPACE, { zh, en })`. The key type
 * is derived from the English dictionary; the Chinese dictionary is checked
 * against it at build time.
 */
export const SUBAGENT_MANAGER_LOCALE_NAMESPACE = 'subagentManager'

export const en = {
  'settings.title': 'Sub-agent Manager',
  'settings.subtitle': 'Create, edit, enable, and launch sub-agent templates.',
  'template.empty': 'No templates yet. Create one to get started.',
  'template.create': 'Create template',
  'template.id': 'Id',
  'template.name': 'Name',
  'template.role': 'Role',
  'template.persona': 'Persona',
  'template.provider': 'Provider',
  'template.model': 'Model',
  'template.reasoningEffort': 'Reasoning effort',
  'template.permissionMode': 'Permission mode',
  'template.memberProvider': 'Member provider',
  'template.agentPreset': 'Agent preset',
  'template.maxDepth': 'Max depth',
  'template.tags': 'Tags (comma separated)',
  'template.description': 'Description',
  'template.enabled': 'Enabled',
  'template.delete': 'Delete',
  'template.duplicate': 'Duplicate',
  'template.edit': 'Edit',
  'template.export': 'Export',
  'template.import': 'Import',
  'template.save': 'Save',
  'template.cancel': 'Cancel',
  'template.joinTeam': 'Join a team',
  'template.running': 'Running instances',
  'template.stop': 'Stop',
} as const

export type SubAgentManagerLocaleKey = keyof typeof en

export const zh: Record<SubAgentManagerLocaleKey, string> = {
  'settings.title': '子 Agent 管理',
  'settings.subtitle': '创建、编辑、启用并拉起子 Agent 模板。',
  'template.empty': '暂无模板。创建一个开始使用。',
  'template.create': '新建模板',
  'template.id': 'ID',
  'template.name': '名称',
  'template.role': '角色',
  'template.persona': '人设',
  'template.provider': 'Provider',
  'template.model': '模型',
  'template.reasoningEffort': '推理强度',
  'template.permissionMode': '权限模式',
  'template.memberProvider': '成员 Provider',
  'template.agentPreset': 'Agent 预设',
  'template.maxDepth': '最大深度',
  'template.tags': '标签（逗号分隔）',
  'template.description': '描述',
  'template.enabled': '已启用',
  'template.delete': '删除',
  'template.duplicate': '复制',
  'template.edit': '编辑',
  'template.export': '导出',
  'template.import': '导入',
  'template.save': '保存',
  'template.cancel': '取消',
  'template.joinTeam': '加入团队',
  'template.running': '运行中实例',
  'template.stop': '停止',
}
