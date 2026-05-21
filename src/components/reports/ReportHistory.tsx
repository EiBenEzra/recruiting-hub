import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Report } from '@/types/database.types'

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: 'Borrador', variant: 'secondary' },
  reviewed: { label: 'Revisado', variant: 'default' },
  exported: { label: 'Exportado', variant: 'outline' },
}

interface ReportHistoryProps {
  reports: Partial<Report>[]
}

export function ReportHistory({ reports }: ReportHistoryProps) {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm text-muted-foreground">No hay informes generados aún.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {reports.map((report) => {
        const status = STATUS_LABELS[report.status ?? 'draft']
        return (
          <div
            key={report.id}
            className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 hover:bg-muted/30 transition-colors"
          >
            <div className="space-y-0.5 min-w-0">
              <p className="text-sm font-medium truncate">
                {report.is_anonymized || !report.candidate_name
                  ? 'Candidato anónimo'
                  : report.candidate_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {report.role} · {report.seniority_level}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
              <span className="text-xs text-muted-foreground">
                {report.created_at
                  ? format(new Date(report.created_at), 'dd MMM yyyy', { locale: es })
                  : '—'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
