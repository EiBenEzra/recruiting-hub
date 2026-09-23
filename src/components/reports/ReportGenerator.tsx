'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReportForm } from './ReportForm'
import { ReportViewer } from './ReportViewer'
import { ReportHistory } from './ReportHistory'
import type { ReportTemplate, Report } from '@/types/database.types'

interface ReportGeneratorProps {
  templates: ReportTemplate[]
  history: Partial<Report>[]
}

export function ReportGenerator({ templates, history }: ReportGeneratorProps) {
  const router = useRouter()
  const [generatedReport, setGeneratedReport] = useState<{
    sections: Record<string, { title: string; content: string; edited: boolean }>
    reportId: string
    roleType: string
  } | null>(null)

  function handleGenerated(report: typeof generatedReport) {
    setGeneratedReport(report)
    router.refresh()
  }

  return (
    <Tabs defaultValue="generate" className="space-y-6">
      <TabsList>
        <TabsTrigger value="generate">Generar informe</TabsTrigger>
        <TabsTrigger value="history">
          Historial
          {history.length > 0 && (
            <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums">
              {history.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="generate" className="space-y-6">
        {generatedReport ? (
          <ReportViewer
            report={generatedReport}
            onBack={() => setGeneratedReport(null)}
          />
        ) : (
          <ReportForm
            templates={templates}
            onGenerated={handleGenerated}
          />
        )}
      </TabsContent>

      <TabsContent value="history">
        <ReportHistory reports={history} />
      </TabsContent>
    </Tabs>
  )
}
