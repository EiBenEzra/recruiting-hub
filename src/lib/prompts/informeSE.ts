import type { PromptDefinition } from './types'

export const informeSE: PromptDefinition = {
  name: 'Informe de Entrevista — Software Engineer',
  slug: 'informe-se',
  description: 'Genera un informe estructurado de entrevista para candidatos de Software Engineering.',
  version: 1,
  module: 'reports',
  inputSchema: {
    type: 'object',
    required: ['transcript', 'role', 'seniority'],
    properties: {
      transcript: { type: 'string', description: 'Transcripción completa de la entrevista' },
      role: { type: 'string', description: 'Título del rol específico' },
      seniority: { type: 'string', enum: ['junior', 'semi-senior', 'senior', 'staff', 'principal'] },
      interviewDate: { type: 'string', format: 'date' },
    },
  },
  outputSchema: {
    type: 'object',
    required: ['introduccion', 'situacionActual', 'motivacion', 'proyectoDestacado', 'profundidadTecnica', 'riesgos', 'conclusion', 'recomendacion'],
    properties: {
      introduccion: { type: 'string' },
      situacionActual: { type: 'string' },
      motivacion: { type: 'string' },
      proyectoDestacado: { type: 'string' },
      profundidadTecnica: { type: 'string' },
      riesgos: { type: 'string' },
      conclusion: { type: 'string' },
      recomendacion: { type: 'string', enum: ['Avanzar', 'Avanzar con reservas', 'No avanzar', 'En evaluación'] },
    },
  },
  systemPrompt: `Eres un experto evaluador técnico de talento con 15 años de experiencia en Tech Recruiting.
Tu tarea es analizar transcripciones de entrevistas técnicas y generar informes estructurados, objetivos y accionables.

REGLAS FUNDAMENTALES:
- Basas TODA tu evaluación exclusivamente en lo que el candidato dijo en la entrevista. No asumas ni inventes.
- Eres descriptivo, no sentencioso. Describes lo que observaste, no emites juicios morales.
- Distingues entre evidencia directa (el candidato lo dijo explícitamente) e inferencia (se deduce del contexto).
- Tu informe será revisado por un humano antes de cualquier uso. Siempre aclaras lo que requiere validación adicional.
- Usas lenguaje profesional, claro y directo. Sin jerga innecesaria.
- Si la transcripción es insuficiente para evaluar una sección, lo indicas explícitamente.

FORMATO DE RESPUESTA:
Responde ÚNICAMENTE con un JSON válido que siga el schema provisto. Sin texto adicional antes ni después del JSON.`,

  userPrompt: `Analiza la siguiente transcripción de entrevista para el rol de {{role}} (nivel {{seniority}}).

TRANSCRIPCIÓN:
---
{{transcript}}
---

Genera el informe en español siguiendo exactamente este JSON schema:
{
  "introduccion": "Párrafo de contexto: quién es el candidato, su trayectoria general y qué lo trae a esta conversación.",
  "situacionActual": "Situación laboral actual: empresa, rol, responsabilidades, tiempo en el cargo.",
  "motivacion": "Qué motiva al candidato a explorar nuevas oportunidades. Razones declaradas y no declaradas.",
  "proyectoDestacado": "El proyecto más relevante que mencionó. Stack, rol del candidato, impacto y complejidad técnica.",
  "profundidadTecnica": "Evaluación de la solidez técnica: conocimiento de sistemas, calidad del código, decisiones de arquitectura, resolución de problemas. Con ejemplos concretos de la entrevista.",
  "riesgos": "Alertas o gaps observados. Puede ser vacíos técnicos, señales de motivación baja, expectativas no alineadas, o simplemente áreas a profundizar.",
  "conclusion": "Síntesis ejecutiva del candidato: fortalezas principales y elementos diferenciadores.",
  "recomendacion": "Uno de: Avanzar | Avanzar con reservas | No avanzar | En evaluación"
}`,

  examples: [
    {
      input: { role: 'Backend Engineer', seniority: 'senior', transcript: '...' },
      output: {
        introduccion: 'Juan cuenta con 7 años de experiencia en desarrollo backend...',
        situacionActual: 'Actualmente trabaja en Mercado Libre como Senior Engineer...',
        motivacion: 'Menciona búsqueda de mayor impacto técnico y crecimiento hacia arquitectura...',
        proyectoDestacado: 'Lideró la migración de monolito a microservicios en sistema de pagos...',
        profundidadTecnica: 'Demostró sólido conocimiento de sistemas distribuidos...',
        riesgos: 'No tiene experiencia directa con Kubernetes en producción...',
        conclusion: 'Candidato técnicamente sólido con buena capacidad de comunicación...',
        recomendacion: 'Avanzar',
      },
    },
  ],
}
