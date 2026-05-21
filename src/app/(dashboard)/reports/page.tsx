import { PageHeader } from '@/components/layout/PageHeader'
import { AIBanner } from '@/components/layout/AIBanner'
import { ReportGenerator } from '@/components/reports/ReportGenerator'
import { createClient } from '@/lib/supabase/server'

export default async function ReportsPage() {
  const supabase = await createClient()

  const { data: templates } = await supabase
    .from('report_templates')
    .select('*')
    .eq('is_active', true)
    .order('display_name')

  const { data: historyRaw } = await supabase
    .from('reports')
    .select('id, role, seniority_level, status, is_anonymized, candidate_name, created_at')
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })
    .limit(20)

  const history = historyRaw ?? []

  return (
    <div className="flex flex-col">
      <AIBanner />
      <div className="space-y-8 p-8">
        <PageHeader
          title="Generador de Informes"
          description="Pega la transcripción de la entrevista y obtén un informe estructurado listo para editar y exportar."
        />
        <ReportGenerator templates={templates ?? []} history={history} />
      </div>
    </div>
  )
}
