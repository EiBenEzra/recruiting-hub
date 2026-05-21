import type { PromptDefinition } from './types'

export const informeEM: PromptDefinition = {
  name: 'Informe de Entrevista — Engineering Manager',
  slug: 'informe-em',
  description: 'Genera un informe estructurado de entrevista para candidatos de Engineering Management.',
  version: 1,
  module: 'reports',
  inputSchema: {
    type: 'object',
    required: ['transcript', 'role', 'seniority'],
    properties: {
      transcript: { type: 'string' },
      role: { type: 'string' },
      seniority: { type: 'string', enum: ['engineering-manager', 'senior-em', 'director', 'vp'] },
      teamSize: { type: 'number', description: 'Tamaño del equipo que gestionaría' },
    },
  },
  outputSchema: {
    type: 'object',
    required: ['introduccion', 'situacionActual', 'motivacion', 'proyectoDestacado', 'liderazgo', 'gestionPersonas', 'tomaDecisiones', 'riesgos', 'conclusion', 'recomendacion'],
  },
  systemPrompt: `Eres un experto evaluador de liderazgo técnico y Engineering Management con 15 años de experiencia en Tech Recruiting senior.
Tu especialidad es evaluar la dimensión humana y estratégica de candidatos a roles de gestión técnica.

REGLAS FUNDAMENTALES:
- Para un EM, el foco está en liderazgo, desarrollo de personas, gestión de la ambigüedad y pensamiento sistémico.
- El conocimiento técnico importa, pero evalúas principalmente si el candidato sabe gestionar equipos técnicos, no si puede codear.
- Buscas evidencia concreta de comportamientos de liderazgo (situaciones reales, no respuestas teóricas).
- Usas el framework STAR implícitamente al describir sus respuestas (Situación, Tarea, Acción, Resultado).
- Diferencias entre lo que el candidato hizo vs. lo que el equipo hizo.
- Responde ÚNICAMENTE con JSON válido, sin texto adicional.`,

  userPrompt: `Analiza la transcripción de entrevista para el rol de {{role}}.

TRANSCRIPCIÓN:
---
{{transcript}}
---

Genera el informe JSON con estas secciones:
{
  "introduccion": "Perfil ejecutivo: trayectoria de liderazgo, escala de equipos gestionados, contextos organizacionales.",
  "situacionActual": "Rol actual, tamaño del equipo, alcance de responsabilidades y contexto de la empresa.",
  "motivacion": "Por qué busca cambio. Motivadores de carrera: impacto, escala, cultura, autonomía.",
  "proyectoDestacado": "Iniciativa de liderazgo más significativa. Contexto, rol del candidato, decisiones clave y resultado medible.",
  "liderazgo": "Estilo de liderazgo, cómo comunica visión, maneja la ambigüedad y genera confianza en el equipo.",
  "gestionPersonas": "Cómo desarrolla talento, maneja conflictos, da feedback difícil y toma decisiones de equipo (contratación, salida).",
  "tomaDecisiones": "Cómo toma decisiones técnicas y organizacionales con información incompleta. Ejemplos concretos.",
  "riesgos": "Alertas observadas: tendencia al micromanagement, dificultad para delegar, gaps estratégicos, expectativas desalineadas.",
  "conclusion": "Síntesis del perfil de liderazgo: fortalezas diferenciadoras y madurez gerencial observada.",
  "recomendacion": "Uno de: Avanzar | Avanzar con reservas | No avanzar | En evaluación"
}`,

  examples: [],
}
