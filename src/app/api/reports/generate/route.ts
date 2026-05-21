import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { getModel } from '@/lib/ai/provider'
import { handleAIError } from '@/lib/ai/errors'
import { GenerateReportInputSchema, SEReportSchema, EMReportSchema } from '@/lib/schemas/report.schema'
import { informeSE } from '@/lib/prompts/informeSE'
import { informeEM } from '@/lib/prompts/informeEM'
import { createAuditLog } from '@/lib/services/audit.service'
import crypto from 'crypto'

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '')
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const input = GenerateReportInputSchema.parse(body)

    if (!input.consentGiven) {
      return NextResponse.json({ error: 'Se requiere consentimiento explícito' }, { status: 400 })
    }

    const isEM = input.roleType === 'engineering_manager'
    const prompt = isEM ? informeEM : informeSE
    const schema = isEM ? EMReportSchema : SEReportSchema

    const vars: Record<string, string> = {
      role: input.role,
      seniority: input.seniority,
      transcript: input.transcript,
    }

    const { object } = await generateObject({
      model: getModel('reports'),
      schema,
      system: prompt.systemPrompt,
      prompt: interpolate(prompt.userPrompt, vars),
    })

    // Build sections map from the validated output
    const sectionLabels: Record<string, string> = isEM
      ? {
          introduccion: 'Introducción y perfil ejecutivo',
          situacionActual: 'Situación actual',
          motivacion: 'Motivación y drivers de carrera',
          proyectoDestacado: 'Proyecto / iniciativa destacada',
          liderazgo: 'Liderazgo',
          gestionPersonas: 'Gestión de personas',
          tomaDecisiones: 'Toma de decisiones',
          riesgos: 'Riesgos y alertas',
          conclusion: 'Conclusión general',
          recomendacion: 'Recomendación final',
        }
      : {
          introduccion: 'Introducción y motivaciones',
          situacionActual: 'Situación actual',
          motivacion: 'Motivación',
          proyectoDestacado: 'Proyecto destacado',
          profundidadTecnica: 'Profundidad técnica',
          riesgos: 'Riesgos y alertas',
          conclusion: 'Conclusión general',
          recomendacion: 'Recomendación final',
        }

    const sections: Record<string, { title: string; content: string; edited: boolean }> = {}
    for (const [key, value] of Object.entries(object as Record<string, string>)) {
      sections[key] = { title: sectionLabels[key] ?? key, content: String(value), edited: false }
    }

    // Persist report (without transcript unless explicitly stored)
    const transcriptHash = crypto.createHash('sha256').update(input.transcript).digest('hex').slice(0, 16)

    const { data: report, error } = await supabase.from('reports').insert({
      template_id: input.templateId,
      created_by: user.id,
      candidate_name: input.candidateName ?? null,
      role: input.role,
      seniority_level: input.seniority,
      interview_date: input.interviewDate ?? null,
      transcript_stored: false,
      transcript_hash: transcriptHash,
      sections_json: sections,
      ai_raw_output: object,
      status: 'draft',
      is_anonymized: !input.candidateName,
      consent_given: true,
      consent_timestamp: new Date().toISOString(),
    }).select('id').single()

    if (error) console.error('[reports/generate] DB insert error:', error)

    await createAuditLog({
      userId: user.id,
      action: 'generate_report',
      module: 'reports',
      resourceType: 'report',
      resourceId: report?.id,
      metadata: { roleType: input.roleType, role: input.role, seniority: input.seniority },
    })

    return NextResponse.json({ sections, reportId: report?.id ?? 'unknown', roleType: input.roleType })
  } catch (error) {
    handleAIError(error, 'reports/generate')
  }
}
