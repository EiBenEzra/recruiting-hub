import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { getModel } from '@/lib/ai/provider'
import { handleAIError } from '@/lib/ai/errors'
import { GenerateOutreachInputSchema, OutreachResultSchema } from '@/lib/schemas/sourcing.schema'
import { sourcingOutreach } from '@/lib/prompts/sourcingOutreach'
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
    const input = GenerateOutreachInputSchema.parse(body)

    const vars: Record<string, string> = {
      candidateName: input.candidateName,
      profileSummary: input.profileSummary,
      tone: input.tone,
      role: input.role ?? 'no especificado',
      companyContext: input.companyContext ?? 'empresa de tecnología',
    }

    const { object } = await generateObject({
      model: getModel('sourcing_outreach'),
      schema: OutreachResultSchema,
      system: interpolate(sourcingOutreach.systemPrompt, vars),
      prompt: interpolate(sourcingOutreach.userPrompt, vars),
    })

    await supabase.from('sourcing_messages').insert({
      created_by: user.id,
      candidate_name: input.candidateName,
      profile_summary: input.profileSummary,
      tone: input.tone,
      generated_message: object.message,
      is_template: false,
    })

    await createAuditLog({
      userId: user.id,
      action: 'generate_outreach',
      module: 'sourcing',
      metadata: { tone: input.tone, role: input.role },
    })

    return NextResponse.json(object)
  } catch (error) {
    handleAIError(error, 'sourcing/outreach')
  }
}
