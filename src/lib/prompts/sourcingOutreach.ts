import type { PromptDefinition } from './types'

export const sourcingOutreach: PromptDefinition = {
  name: 'Generador de Mensajes de Outreach',
  slug: 'sourcing-outreach',
  description: 'Genera mensajes personalizados de contacto para candidatos pasivos.',
  version: 1,
  module: 'sourcing_outreach',
  inputSchema: {
    type: 'object',
    required: ['candidateName', 'profileSummary', 'tone'],
    properties: {
      candidateName: { type: 'string' },
      profileSummary: { type: 'string', description: 'Resumen del perfil del candidato: experiencia, stack, logros observados' },
      tone: { type: 'string', enum: ['formal', 'cercano', 'ejecutivo'] },
      role: { type: 'string' },
      companyContext: { type: 'string', description: 'Qué hace la empresa, por qué es relevante para este perfil' },
    },
  },
  outputSchema: {
    type: 'object',
    required: ['message', 'subject'],
    properties: {
      subject: { type: 'string', description: 'Línea de asunto para LinkedIn o email' },
      message: { type: 'string' },
    },
  },
  systemPrompt: `Eres un experto en Tech Recruiting con capacidad de escribir mensajes de outreach que realmente reciben respuesta.

LO QUE NUNCA DEBES HACER:
- Mensajes genéricos: "Vi tu perfil y me pareció interesante".
- Frases vacías: "Oportunidad emocionante", "Empresa de primer nivel".
- Más de 150 palabras. Los mensajes cortos tienen más respuesta.
- Inventar información que no está en el perfil del candidato.

LO QUE SIEMPRE DEBES HACER:
- Mencionar algo específico del perfil del candidato (un stack, un logro, una empresa donde trabajó).
- Ser directo sobre qué es lo que ofreces y por qué contactas a este candidato en particular.
- Cerrar con una pregunta concreta y fácil de responder.
- Adaptar el tono según la instrucción: formal | cercano | ejecutivo.

TONOS:
- formal: "Estimado/a [nombre], me permito contactarle..."
- cercano: "Hola [nombre], vi tu perfil y quería conectar..."
- ejecutivo: "[Nombre], directo al punto:..."

Responde ÚNICAMENTE con JSON válido.`,

  userPrompt: `Escribe un mensaje de outreach para:

Nombre: {{candidateName}}
Resumen del perfil: {{profileSummary}}
Rol que ofrecemos: {{role}}
Contexto de la empresa: {{companyContext}}
Tono: {{tone}}

Devuelve:
{
  "subject": "Línea de asunto (max 60 caracteres)",
  "message": "Mensaje completo. Máximo 150 palabras. Personalizado y con gancho específico."
}`,

  examples: [
    {
      input: {
        candidateName: 'María González',
        profileSummary: '8 años en backend Python, ex-Cornershop, lideró migración de microservicios, contribuye a repos open source de FastAPI',
        role: 'Senior Backend Engineer',
        tone: 'cercano',
        companyContext: 'Fintech que procesa pagos en LATAM, equipo técnico de 25 personas',
      },
      output: {
        subject: 'Tu experiencia en microservicios — oportunidad backend',
        message: 'Hola María, vi tu experiencia liderando la migración a microservicios en Cornershop y tus contribuciones a FastAPI — exactamente el perfil que buscamos.\n\nEstamos construyendo la infraestructura de pagos para el mercado LATAM y necesitamos a alguien que haya vivido los dolores de escalar sistemas de alta concurrencia.\n\n¿Tendrías 20 minutos para contarme en qué estás trabajando ahora?',
      },
    },
  ],
}
