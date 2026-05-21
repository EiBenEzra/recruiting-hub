import { AlertTriangle } from 'lucide-react'

export function AIBanner() {
  return (
    <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-6 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span>
        <strong>Contenido generado por IA.</strong> Requiere revisión y validación humana antes de ser utilizado en procesos de selección.
      </span>
    </div>
  )
}
