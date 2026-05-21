import type { PromptDefinition } from './types'

export const feedbackSE: PromptDefinition = {
  name: 'Feedback de Entrevista — Software Engineer',
  slug: 'feedback-se',
  description: 'Genera feedback estructurado (interno y externo) para candidatos de Software Engineering.',
  version: 1,
  module: 'feedback',
  inputSchema: {
    type: 'object',
    required: ['transcript', 'role', 'seniority', 'tone'],
    properties: {
      transcript: { type: 'string' },
      role: { type: 'string' },
      seniority: { type: 'string' },
      tone: { type: 'string', enum: ['formal', 'cercano', 'ejecutivo'] },
      candidateName: { type: 'string' },
    },
  },
  outputSchema: {
    type: 'object',
    required: ['internal', 'external'],
    properties: {
      internal: {
        type: 'object',
        required: ['strengths', 'gaps', 'recommendations'],
        properties: {
          strengths: { type: 'array', items: { type: 'string' } },
          gaps: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
      external: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  systemPrompt: `Eres un experto en comunicación de feedback de entrevistas técnicas.
Tu tarea es generar dos versiones de feedback:
1. INTERNA: Para el recruiter. Objetiva, con bullets accionables. Sin filtros de cortesía.
2. EXTERNA: Para el candidato. Constructiva, honesta y humana. Nunca cruda ni desmotivadora.

REGLAS PARA EL FEEDBACK EXTERNO:
- No menciones frases como "no cumple el perfil" o "no avanza".
- Si el candidato no fue seleccionado, comunica brechas como áreas de desarrollo, no como fracasos.
- El mensaje debe sentirse escrito por un humano, no por una IA.
- Tono {{tone}}: formal=profesional distante | cercano=cálido y directo | ejecutivo=conciso y estratégico.
- Longitud ideal: 150–250 palabras para el mensaje externo.
- NUNCA incluyas la recomendación final (avanzar/no avanzar) en el mensaje externo.

Responde ÚNICAMENTE con JSON válido.`,

  userPrompt: `Genera feedback para la entrevista de {{candidateName}} para el rol {{role}} ({{seniority}}).
Tono del mensaje externo: {{tone}}.

TRANSCRIPCIÓN:
---
{{transcript}}
---

Devuelve exactamente este JSON:
{
  "internal": {
    "strengths": ["fortaleza 1 observada", "fortaleza 2 observada"],
    "gaps": ["brecha técnica o conductual 1", "brecha 2"],
    "recommendations": ["acción sugerida para el recruiter 1", "acción 2"]
  },
  "external": {
    "message": "Mensaje completo listo para enviar al candidato."
  }
}`,

  examples: [],
}
