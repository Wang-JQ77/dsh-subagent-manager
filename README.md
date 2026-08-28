# dsh-subagent-manager

[English](README.md) | [简体中文](README-zh.md)

**Reusable sub-agent templates for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).**
Define each specialist once — display name, persona, model route, permission mode, depth cap — then launch it as a durable, continuable sub-agent from any conversation, pin it to a single project, or hand it to an Agent-Teams squad as a member.

## Why this plugin

| Capability | User outcome |
| --- | --- |
| Reusable templates | Define a reviewer, auditor, writer, or domain expert once; reuse across conversations and projects |
| Durable continuable children | Launched agents keep their own resumable session instead of being fire-and-forget |
| Safety policy by construction | Read-only permission by default; a full-permission template can never be enabled |
| Project scoping | `global` or `project:<id>`, re-checked at launch; the settings page hides foreign projects |
| Roster injection | The lead model always sees enabled specialists together with their routes and personas |
| Managed lifecycle | Editing never disturbs running instances; disabling only blocks new launches |
| Running instances view + JSON import/export | View and stop running sub-agents; export/import entire template library |

## Installation

```bash
# Install to web profile
dsh plugin --profile web add dsh-subagent-manager
# Restart dsh for the plugin to take effect
dsh web
```

## Quick Start

1. Open **Settings → Sub-Agent Manager**
2. Click **Create Template** — fill in display name, persona, model, and permission mode
3. Save the template — it appears in the roster with its enabled status
4. In any conversation, mention the sub-agent name or use the roster to launch it
5. The launched sub-agent runs as a durable child — you can switch back to it anytime

> Templates are scoped to `global` or a specific project. The settings page only shows templates relevant to the current project.

## Template Configuration

Each template defines:

| Field | Description |
| --- | --- |
| Display name | How the sub-agent appears in the roster |
| Persona | System prompt / role description |
| Model route | Which LLM model to use for this agent |
| Permission mode | Read-only (default) or full access |
| Depth cap | Maximum recursion depth |
| Project scope | `global` or `project:<id>` |

## Usage

### Launch a sub-agent

In a conversation, type the sub-agent's name or use the roster UI to launch it. The agent starts in its own resumable session.

### View running instances

Go to **Settings → Sub-Agent Manager → Running Instances** to see all active sub-agents. You can stop any instance from here.

### Export/Import templates

Use the JSON export/import feature in the settings page to backup or transfer your template library between DSH installations.

### Integration with Agent-Teams

Templates can be used as team members in `dsh-agent-teams`. Each template defines a specialist role that the team can dispatch tasks to.

## License

MIT
