'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react'

const MODULE_LABELS: Record<string, string> = {
  reports: 'Informes',
  feedback: 'Feedback',
  sourcing_boolean: 'Booleanos',
  sourcing_outreach: 'Outreach',
}

interface PromptManagerProps {
  templates: any[]
}

export function PromptManager({ templates }: PromptManagerProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editing, setEditing] = useState<Record<string, string>>({})

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm text-muted-foreground">No hay prompts configurados.</p>
        <p className="text-xs text-muted-foreground mt-1">Ejecuta el seed script para cargar los prompts iniciales.</p>
        <code className="mt-3 rounded bg-muted px-3 py-1.5 text-xs font-mono">npm run seed:prompts</code>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-w-4xl">
      {templates.map((template) => {
        const currentVersion = template.versions?.find((v: any) => v.is_current)
        const isExpanded = expanded === template.id

        return (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer py-4"
              onClick={() => setExpanded(isExpanded ? null : template.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-sm">{template.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {MODULE_LABELS[template.module] ?? template.module}
                  </Badge>
                  {currentVersion && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      v{currentVersion.version_number} activa
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">System Prompt (versión activa)</p>
                  <Textarea
                    value={editing[template.id] ?? currentVersion?.system_prompt ?? 'Sin prompt configurado'}
                    onChange={(e) => setEditing((prev) => ({ ...prev, [template.id]: e.target.value }))}
                    className="min-h-48 font-mono text-xs resize-y"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {template.versions?.length ?? 0} versiones guardadas
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing((p) => { const n = { ...p }; delete n[template.id]; return n })}>
                      Descartar
                    </Button>
                    <Button size="sm" disabled={!editing[template.id]}>
                      Guardar nueva versión
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
