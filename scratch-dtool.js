import { defineTool } from '@deepseek-ai/dsh-tools';
const t = defineTool({
    name: 'x',
    description: 'x',
    parameters: { id: { type: 'string', required: true } },
    output: {
        schema: { type: 'object', additionalProperties: false, properties: { id: { type: 'string', required: true } } },
        render: (args, value) => [{ type: 'text', text: value.id }],
    },
    execute: async (args) => ({ id: args.id }),
});
void t;
