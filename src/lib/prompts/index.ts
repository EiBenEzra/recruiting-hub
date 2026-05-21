export { informeSE } from './informeSE'
export { informeEM } from './informeEM'
export { feedbackSE } from './feedbackSE'
export { feedbackEM } from './feedbackEM'
export { sourcingBooleanos } from './sourcingBooleanos'
export { sourcingOutreach } from './sourcingOutreach'
export type { PromptDefinition, PromptModule } from './types'

import { informeSE } from './informeSE'
import { informeEM } from './informeEM'
import { feedbackSE } from './feedbackSE'
import { feedbackEM } from './feedbackEM'
import { sourcingBooleanos } from './sourcingBooleanos'
import { sourcingOutreach } from './sourcingOutreach'
import type { PromptDefinition } from './types'

export const ALL_PROMPTS: PromptDefinition[] = [
  informeSE,
  informeEM,
  feedbackSE,
  feedbackEM,
  sourcingBooleanos,
  sourcingOutreach,
]

export const PROMPTS_BY_SLUG: Record<string, PromptDefinition> = Object.fromEntries(
  ALL_PROMPTS.map((p) => [p.slug, p])
)
