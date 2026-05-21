export type PromptModule = 'reports' | 'feedback' | 'sourcing_boolean' | 'sourcing_outreach'

export interface PromptDefinition {
  name: string
  slug: string
  description: string
  version: number
  module: PromptModule
  inputSchema: Record<string, unknown>
  outputSchema: Record<string, unknown>
  systemPrompt: string
  userPrompt: string
  examples: Array<{ input: unknown; output: unknown }>
}
