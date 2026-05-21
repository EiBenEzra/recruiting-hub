import { PageHeader } from '@/components/layout/PageHeader'
import { AIBanner } from '@/components/layout/AIBanner'
import { SourcingHub } from '@/components/sourcing/SourcingHub'
import { createClient } from '@/lib/supabase/server'

export default async function SourcingPage() {
  const supabase = await createClient()

  const { data: templates } = await supabase
    .from('sourcing_messages')
    .select('id, template_name, generated_message, tone, times_used, created_at')
    .eq('is_template', true)
    .order('times_used', { ascending: false })
    .limit(10)

  return (
    <div className="flex flex-col">
      <AIBanner />
      <div className="space-y-8 p-8">
        <PageHeader
          title="Tech Sourcing Hub"
          description="Genera strings booleanos para LinkedIn, Google y GitHub, y mensajes de outreach personalizados para cada candidato."
        />
        <SourcingHub savedTemplates={templates ?? []} />
      </div>
    </div>
  )
}
