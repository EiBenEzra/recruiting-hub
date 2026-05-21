import { z } from 'zod'

export const RecommendationSchema = z.enum([
  'Avanzar',
  'Avanzar con reservas',
  'No avanzar',
  'En evaluación',
])

export const SEReportSchema = z.object({
  introduccion: z.string().min(50, 'Introducción demasiado corta'),
  situacionActual: z.string().min(20),
  motivacion: z.string().min(20),
  proyectoDestacado: z.string().min(20),
  profundidadTecnica: z.string().min(30),
  riesgos: z.string().min(10),
  conclusion: z.string().min(30),
  recomendacion: RecommendationSchema,
})

export const EMReportSchema = z.object({
  introduccion: z.string().min(50),
  situacionActual: z.string().min(20),
  motivacion: z.string().min(20),
  proyectoDestacado: z.string().min(20),
  liderazgo: z.string().min(30),
  gestionPersonas: z.string().min(30),
  tomaDecisiones: z.string().min(30),
  riesgos: z.string().min(10),
  conclusion: z.string().min(30),
  recomendacion: RecommendationSchema,
})

export const GenerateReportInputSchema = z.object({
  templateId: z.string().uuid(),
  roleType: z.enum(['software_engineer', 'engineering_manager']),
  role: z.string().min(1).max(100),
  seniority: z.string().min(1).max(50),
  transcript: z.string().min(100, 'La transcripción es demasiado corta').max(50000),
  candidateName: z.string().max(100).optional(),
  interviewDate: z.string().optional(),
  consentGiven: z.boolean(),
  storeTranscript: z.boolean().default(false),
})

export type SEReport = z.infer<typeof SEReportSchema>
export type EMReport = z.infer<typeof EMReportSchema>
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>
export type Recommendation = z.infer<typeof RecommendationSchema>
