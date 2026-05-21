import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { ResourceGrid } from '@/components/sst/ResourceGrid'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function SSTPage() {
  const supabase = await createClient()

  const { data: resources } = await supabase
    .from('resources')
    .select('*, category:resource_categories(id, name, slug, icon, color)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('resource_categories')
    .select('*')
    .order('sort_order')

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Single Source of Truth"
        description="Biblioteca central de conocimiento del equipo: pautas, rúbricas, guías de entrevista, criterios por rol y asistentes IA."
        action={
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo recurso
          </Button>
        }
      />
      <ResourceGrid resources={resources ?? []} categories={categories ?? []} />
    </div>
  )
}
