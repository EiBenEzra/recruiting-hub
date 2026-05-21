import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import type { LanguageModel } from 'ai'

export type AIProviderName = 'anthropic' | 'openai' | 'google'
export type AIModule = 'reports' | 'feedback' | 'sourcing_boolean' | 'sourcing_outreach'

const MODULE_MODEL_ENV: Record<AIModule, string> = {
  reports: 'AI_MODEL_REPORTS',
  feedback: 'AI_MODEL_FEEDBACK',
  sourcing_boolean: 'AI_MODEL_SOURCING',
  sourcing_outreach: 'AI_MODEL_SOURCING',
}

const DEFAULT_MODELS: Record<AIProviderName, string> = {
  anthropic: 'claude-sonnet-4-5',
  openai: 'gpt-4o-mini',
  google: 'gemini-1.5-pro',
}

function getProviderName(): AIProviderName {
  const provider = process.env.AI_PROVIDER as AIProviderName
  if (!provider || !['anthropic', 'openai', 'google'].includes(provider)) {
    return 'anthropic'
  }
  return provider
}

function getModelId(module: AIModule): string {
  const envKey = MODULE_MODEL_ENV[module]
  return process.env[envKey] ?? DEFAULT_MODELS[getProviderName()]
}

export function getModel(module: AIModule): LanguageModel {
  const provider = getProviderName()
  const modelId = getModelId(module)

  switch (provider) {
    case 'anthropic':
      return anthropic(modelId)
    case 'openai':
      return openai(modelId)
    case 'google':
      return google(modelId)
    default:
      return anthropic('claude-sonnet-4-5')
  }
}
