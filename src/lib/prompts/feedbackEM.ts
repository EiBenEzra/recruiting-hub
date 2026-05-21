import type { PromptDefinition } from './types'

export const feedbackEM: PromptDefinition = {
  name: 'Feedback de Entrevista — Engineering Manager',
  slug: 'feedback-em',
  description: 'Genera feedback estructurado (interno y externo) para candidatos de Engineering Management.',
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
  },
  systemPrompt: `Eres un experto en evaluación y comunicación de feedback para roles de liderazgo técnico.
Para Engineering Managers, el feedback debe reflejar dimensiones de liderazgo, no solo técnicas.

REGLAS PARA FEEDBACK INTERNO DE EM:
- Fortalezas: capacidades de liderazgo observadas con evidencia concreta.
- Gaps: brechas en gestión de personas, pensamiento estratégico, comunicación ejecutiva.
- Recomendaciones: qué explorar en próximas etapas si avanza, o qué desarrollar si no avanza.

REGLAS PARA FEEDBACK EXTERNO DE EM:
- El candidato es un profesional senior. El mensaje debe estar a esa altura.
- Destaca sus contribuciones al liderazgo que observaste. Eso siempre es valorado.
- Si hay brechas, enmárcalas como oportunidades de desarrollo para el tipo de rol que buscan.
- Tono {{tone}}.
- NUNCA reveles la decisión de contratación en el mensaje externo.

Responde ÚNICAMENTE con JSON válido.`,

  userPrompt: `Genera feedback para la entrevista de {{candidateName}} para el rol {{role}} ({{seniority}}).
Tono: {{tone}}.

TRANSCRIPCIÓN:
---
{{transcript}}
---

Devuelve:
{
  "internal": {
    "strengths": ["fortaleza de liderazgo 1", "fortaleza 2"],
    "gaps": ["brecha en liderazgo/gestión 1", "brecha 2"],
    "recommendations": ["recomendación para el recruiter 1", "recomendación 2"]
  },
  "external": {
    "message": "Mensaje profesional para el candidato EM."
  }
}`,

  examples: [],
}
