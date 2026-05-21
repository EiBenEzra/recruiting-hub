import type { PromptDefinition } from './types'

export const sourcingBooleanos: PromptDefinition = {
  name: 'Generador de Strings Booleanos',
  slug: 'sourcing-booleanos',
  description: 'Genera strings booleanos optimizados para LinkedIn Recruiter, Google X-Ray y GitHub.',
  version: 1,
  module: 'sourcing_boolean',
  inputSchema: {
    type: 'object',
    required: ['role', 'seniority', 'technologies'],
    properties: {
      role: { type: 'string' },
      seniority: { type: 'string' },
      technologies: { type: 'array', items: { type: 'string' } },
      location: { type: 'string' },
      industries: { type: 'array', items: { type: 'string' } },
      exclusions: { type: 'array', items: { type: 'string' } },
    },
  },
  outputSchema: {
    type: 'object',
    required: ['linkedin', 'google_xray', 'github'],
    properties: {
      linkedin: { type: 'string' },
      google_xray: { type: 'string' },
      github: { type: 'string' },
    },
  },
  systemPrompt: `Eres un experto en Tech Sourcing con dominio avanzado de búsqueda booleana.
Tu tarea es generar strings de búsqueda optimizados para encontrar candidatos técnicos pasivos.

REGLAS PARA LINKEDIN RECRUITER:
- Usa operadores: AND, OR, NOT entre paréntesis.
- Incluye variaciones de títulos de cargo (title:"Software Engineer" OR title:"Backend Developer").
- Agrega keywords de skills relevantes.
- Si hay ubicación, inclúyela con location: o como keyword.
- Máximo 1000 caracteres.

REGLAS PARA GOOGLE X-RAY:
- Usa: site:linkedin.com/in/ para perfiles.
- Incluye comillas para frases exactas.
- Usa filetype, intitle, inurl cuando corresponda.
- Excluye páginas de jobs: -jobs -"job description" -"we are hiring".

REGLAS PARA GITHUB:
- Usa la API de búsqueda de GitHub con parámetros: language, location, followers.
- Formato: https://github.com/search?q=... con parámetros URL.
- Complementa con búsqueda de topics y repos.

Responde ÚNICAMENTE con JSON válido, sin markdown ni texto adicional.`,

  userPrompt: `Genera strings booleanos para buscar candidatos con este perfil:

Rol: {{role}}
Seniority: {{seniority}}
Tecnologías: {{technologies}}
Ubicación: {{location}}
Industrias objetivo: {{industries}}
Exclusiones (empresas o términos a evitar): {{exclusions}}

Devuelve exactamente:
{
  "linkedin": "string booleano completo para LinkedIn Recruiter",
  "google_xray": "query completa para pegar en Google",
  "github": "URL de búsqueda de GitHub con parámetros"
}`,

  examples: [
    {
      input: {
        role: 'Backend Engineer',
        seniority: 'Senior',
        technologies: ['Python', 'FastAPI', 'PostgreSQL', 'AWS'],
        location: 'Chile',
        industries: ['Fintech', 'E-commerce'],
        exclusions: ['Falabella', 'Ripley'],
      },
      output: {
        linkedin: '(title:"Backend Engineer" OR title:"Software Engineer" OR title:"Python Developer") AND (Python AND (FastAPI OR Django OR Flask)) AND (AWS OR GCP) AND Chile',
        google_xray: 'site:linkedin.com/in/ "Backend Engineer" OR "Python Developer" "FastAPI" OR "Django" "Chile" -jobs -"job description"',
        github: 'https://github.com/search?q=location%3AChile+language%3APython+followers%3A%3E10&type=users',
      },
    },
  ],
}
