import { PageHeader } from '@/components/layout/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PromptManager } from '@/components/admin/PromptManager'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground">No tienes permisos para acceder a esta sección.</p>
      </div>
    )
  }

  const { data: promptTemplates } = await supabase
    .from('prompt_templates')
    .select('*, versions:prompt_versions(id, version_number, is_current, created_at, notes)')
    .eq('is_active', true)
    .order('name')

  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*, user:profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Administración"
        description="Gestión de prompts, usuarios y logs de auditoría."
      />
      <Tabs defaultValue="prompts">
        <TabsList>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="audit">Auditoría</TabsTrigger>
        </TabsList>
        <TabsContent value="prompts" className="mt-6">
          <PromptManager templates={promptTemplates ?? []} />
        </TabsContent>
        <TabsContent value="audit" className="mt-6">
          <AuditTable logs={auditLogs ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AuditTable({ logs }: { logs: any[] }) {
  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed py-16">
        <p className="text-sm text-muted-foreground">No hay logs de auditoría aún.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Usuario</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Acción</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Módulo</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3 text-xs">{log.user?.email ?? 'Sistema'}</td>
              <td className="px-4 py-3 text-xs font-mono">{log.action}</td>
              <td className="px-4 py-3 text-xs">{log.module}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {new Date(log.created_at).toLocaleString('es-CL')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
