import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { getModel } from '@/lib/ai/provider'
import { handleAIError } from '@/lib/ai/errors'
import { GenerateFeedbackInputSchema, FeedbackOutputSchema } from '@/lib/schemas/feedback.schema'
import { feedbackSE } from '@/lib/prompts/feedbackSE'
import { feedbackEM } from '@/lib/prompts/feedbackEM'
import { createAuditLog } from '@/lib/services/audit.service'

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '')
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const input = GenerateFeedbackInputSchema.parse(body)

    const isEM = input.roleType === 'engineering_manager'
    const prompt = isEM ? feedbackEM : feedbackSE

    const vars: Record<string, string> = {
      role: input.role,
      seniority: input.seniority,
      tone: input.tone,
      transcript: input.transcript,
      candidateName: input.candidateName ?? 'el candidato',
    }

    const { object } = await generateObject({
      model: getModel('feedback'),
      schema: FeedbackOutputSchema,
      system: interpolate(prompt.systemPrompt, vars),
      prompt: interpolate(prompt.userPrompt, vars),
    })

    await supabase.from('feedback_outputs').insert({
      created_by: user.id,
      candidate_name: input.candidateName ?? null,
      role: input.role,
      seniority_level: input.seniority,
      interview_date: input.interviewDate ?? null,
      internal_feedback: object.internal,
      external_feedback: object.external,
      tone: input.tone,
      status: 'draft',
      is_anonymized: !input.candidateName,
    })

    await createAuditLog({
      userId: user.id,
      action: 'generate_feedback',
      module: 'feedback',
      metadata: { roleType: input.roleType, tone: input.tone },
    })

    return NextResponse.json(object)
  } catch (error) {
    handleAIError(error, 'feedback/generate')
  }
}
