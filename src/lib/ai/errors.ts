export class AIGenerationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly module?: string
  ) {
    super(message)
    this.name = 'AIGenerationError'
  }
}

export class AIValidationError extends Error {
  constructor(
    message: string,
    public readonly issues?: unknown[]
  ) {
    super(message)
    this.name = 'AIValidationError'
  }
}

export function handleAIError(error: unknown, module: string): never {
  console.error(`[AI:${module}]`, error)

  if (error instanceof AIGenerationError || error instanceof AIValidationError) {
    throw error
  }

  const message = error instanceof Error ? error.message : 'Error desconocido del modelo de IA'
  throw new AIGenerationError(message, error, module)
}
