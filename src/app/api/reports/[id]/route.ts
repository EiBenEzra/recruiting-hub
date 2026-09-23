import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const { data, error } = await supabase
    .from('reports')
    .select('id, sections_json, role, seniority_level, candidate_name, template_id')
    .eq('id', id)
    .eq('created_by', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const roleType = data.template_id === 'dea55572-883f-4d8b-b8cb-c18f7a6fc11a'
    ? 'engineering_manager'
    : 'software_engineer'

  return NextResponse.json({ sections: data.sections_json, reportId: data.id, roleType })
}
