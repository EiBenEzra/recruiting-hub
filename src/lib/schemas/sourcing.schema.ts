import { z } from 'zod'

export const BooleanResultSchema = z.object({
  linkedin: z.string().min(10),
  google_xray: z.string().min(10),
  github: z.string().url(),
})

export const GenerateBooleanInputSchema = z.object({
  role: z.string().min(1).max(100),
  seniority: z.string().min(1).max(50),
  technologies: z.array(z.string()).min(1).max(15),
  location: z.string().max(100).optional(),
  industries: z.array(z.string()).max(5).default([]),
  exclusions: z.array(z.string()).max(10).default([]),
})

export const OutreachResultSchema = z.object({
  subject: z.string().min(5).max(100),
  message: z.string().min(30).max(800),
})

export const GenerateOutreachInputSchema = z.object({
  candidateName: z.string().min(1).max(100),
  profileSummary: z.string().min(20).max(1000),
  tone: z.enum(['formal', 'cercano', 'ejecutivo']),
  role: z.string().max(100).optional(),
  companyContext: z.string().max(500).optional(),
})

export type BooleanResult = z.infer<typeof BooleanResultSchema>
export type GenerateBooleanInput = z.infer<typeof GenerateBooleanInputSchema>
export type OutreachResult = z.infer<typeof OutreachResultSchema>
export type GenerateOutreachInput = z.infer<typeof GenerateOutreachInputSchema>
