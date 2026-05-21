import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { getModel } from '@/lib/ai/provider'
import { handleAIError } from '@/lib/ai/errors'
import { GenerateBooleanInputSchema, BooleanResultSchema } from '@/lib/schemas/sourcing.schema'
import { sourcingBooleanos } from '@/lib/prompts/sourcingBooleanos'
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
    const input = GenerateBooleanInputSchema.parse(body)

    const vars: Record<string, string> = {
      role: input.role,
      seniority: input.seniority,
      technologies: input.technologies.join(', '),
      location: input.location ?? 'Sin restricción',
      industries: input.industries.length ? input.industries.join(', ') : 'Cualquier industria',
      exclusions: input.exclusions.length ? input.exclusions.join(', ') : 'Ninguna',
    }

    const { object } = await generateObject({
      model: getModel('sourcing_boolean'),
      schema: BooleanResultSchema,
      system: sourcingBooleanos.systemPrompt,
      prompt: interpolate(sourcingBooleanos.userPrompt, vars),
    })

    await supabase.from('boolean_searches').insert({
      created_by: user.id,
      role: input.role,
      seniority: input.seniority,
      technologies: input.technologies,
      location: input.location ?? null,
      industries: input.industries,
      exclusions: input.exclusions,
      results: object,
    })

    await createAuditLog({
      userId: user.id,
      action: 'generate_boolean',
      module: 'sourcing',
      metadata: { role: input.role, seniority: input.seniority },
    })

    return NextResponse.json(object)
  } catch (error) {
    handleAIError(error, 'sourcing/boolean')
  }
}
