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
  'template.label': 'Label',
  'template.role': 'Role',
  'template.persona': 'Persona',
  'template.provider': 'Provider',
  'template.model': 'Model',
  'template.permissionMode': 'Permission mode',
  'template.maxDepth': 'Max depth',
  'template.enabled': 'Enabled',
  'template.delete': 'Delete',
  'template.duplicate': 'Duplicate',
  'template.edit': 'Edit',
  'template.export': 'Export',
  'template.import': 'Import',
  'template.save': 'Save',
  'template.cancel': 'Cancel',
  'template.joinTeam': 'Join a team',
} as const

export type SubAgentManagerLocaleKey = keyof typeof en

export const zh: Record<SubAgentManagerLocaleKey, string> = {
  'settings.title': '子 Agent 管理',
  'settings.subtitle': '创建、编辑、启用并拉起子 Agent 模板。',
  'template.empty': '暂无模板。创建一个开始使用。',
  'template.create': '新建模板',
  'template.id': 'ID',
  'template.name': '名称',
  'template.label': '展示名',
  'template.role': '角色',
  'template.persona': '人设',
  'template.provider': 'Provider',
  'template.model': '模型',
  'template.permissionMode': '权限模式',
  'template.maxDepth': '最大深度',
  'template.enabled': '已启用',
  'template.delete': '删除',
  'template.duplicate': '复制',
  'template.edit': '编辑',
  'template.export': '导出',
  'template.import': '导入',
  'template.save': '保存',
  'template.cancel': '取消',
  'template.joinTeam': '加入团队',
}
