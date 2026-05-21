import { z } from 'zod'

export const InternalFeedbackSchema = z.object({
  strengths: z.array(z.string().min(5)).min(1).max(8),
  gaps: z.array(z.string().min(5)).min(0).max(8),
  recommendations: z.array(z.string().min(5)).min(1).max(6),
})

export const ExternalFeedbackSchema = z.object({
  message: z.string().min(50).max(1500),
})

export const FeedbackOutputSchema = z.object({
  internal: InternalFeedbackSchema,
  external: ExternalFeedbackSchema,
})

export const GenerateFeedbackInputSchema = z.object({
  roleType: z.enum(['software_engineer', 'engineering_manager']),
  role: z.string().min(1).max(100),
  seniority: z.string().min(1).max(50),
  tone: z.enum(['formal', 'cercano', 'ejecutivo']),
  transcript: z.string().min(100).max(50000),
  candidateName: z.string().max(100).optional(),
  interviewDate: z.string().optional(),
})

export type FeedbackOutput = z.infer<typeof FeedbackOutputSchema>
export type InternalFeedback = z.infer<typeof InternalFeedbackSchema>
export type GenerateFeedbackInput = z.infer<typeof GenerateFeedbackInputSchema>
