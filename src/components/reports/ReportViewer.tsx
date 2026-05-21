'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Edit2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ReportSection {
  title: string
  content: string
  edited: boolean
}

interface ReportViewerProps {
  report: {
    sections: Record<string, ReportSection>
    reportId: string
    roleType: string
  }
  onBack: () => void
}

export function ReportViewer({ report, onBack }: ReportViewerProps) {
  const [sections, setSections] = useState(report.sections)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  function handleEdit(sectionId: string, value: string) {
    setSections((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], content: value, edited: true },
    }))
  }

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.reportId, sections }),
      })
      if (!res.ok) throw new Error('Error al exportar')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `informe-${report.reportId.slice(0, 8)}.docx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Informe exportado correctamente')
    } catch {
      toast.error('Error al exportar el informe')
    } finally {
      setExporting(false)
    }
  }

  const sectionEntries = Object.entries(sections)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al formulario
        </button>
        <Button onClick={handleExport} disabled={exporting} size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          {exporting ? 'Exportando...' : 'Descargar .docx'}
        </Button>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sectionEntries.map(([id, section]) => (
          <div key={id} className="group rounded-lg border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm">{section.title}</h3>
                {section.edited && (
                  <Badge variant="secondary" className="text-xs">Editado</Badge>
                )}
              </div>
              <button
                onClick={() => setEditingId(editingId === id ? null : id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {editingId === id ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                )}
              </button>
            </div>

            {editingId === id ? (
              <Textarea
                value={section.content}
                onChange={(e) => handleEdit(id, e.target.value)}
                className="min-h-32 text-sm resize-y"
                autoFocus
              />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {section.content}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
