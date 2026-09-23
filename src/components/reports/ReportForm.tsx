'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, AlertTriangle } from 'lucide-react'
import { GenerateReportInputSchema, type GenerateReportInput } from '@/lib/schemas/report.schema'
import { toast } from 'sonner'
import type { ReportTemplate } from '@/types/database.types'

interface ReportFormProps {
  templates: ReportTemplate[]
  onGenerated: (report: {
    sections: Record<string, { title: string; content: string; edited: boolean }>
    reportId: string
    roleType: string
  }) => void
}

const SENIORITY_OPTIONS = ['Junior', 'Semi-Senior', 'Senior', 'Staff', 'Principal', 'Director', 'VP']

export function ReportForm({ templates, onGenerated }: ReportFormProps) {
  const [loading, setLoading] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<GenerateReportInput>({
    resolver: zodResolver(GenerateReportInputSchema) as any,
    defaultValues: { consentGiven: false, storeTranscript: false },
  })

  const selectedTemplateId = watch('templateId')

  async function onSubmit(data: GenerateReportInput) {
    if (!consentChecked) {
      toast.error('Debes confirmar el consentimiento para procesar la transcripción.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, consentGiven: true }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al generar el informe')
      }

      const result = await res.json()
      onGenerated(result)
      toast.success('Informe generado correctamente')
    } catch (error: unknown) {
      toast.error('Error al generar', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {/* Role type */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Tipo de rol *</Label>
          <Select onValueChange={(v) => {
            if (!v) return
            const tpl = templates.find(t => t.role_type === v)
            if (tpl) {
              setValue('roleType', v as GenerateReportInput['roleType'])
              setValue('templateId', tpl.id)
            }
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tipo" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.role_type}>
                  {t.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.roleType && <p className="text-xs text-destructive">{errors.roleType.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rol específico *</Label>
          <Input id="role" placeholder="ej. Backend Engineer" {...register('role')} />
          {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Seniority *</Label>
          <Select onValueChange={(v) => { if (v) setValue('seniority', v as string) }}>
            <SelectTrigger>
              <SelectValue placeholder="Nivel" />
            </SelectTrigger>
            <SelectContent>
              {SENIORITY_OPTIONS.map((s) => (
                <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.seniority && <p className="text-xs text-destructive">{errors.seniority.message}</p>}
        </div>
      </div>

      {/* Optional fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="candidateName">Nombre del candidato (opcional)</Label>
          <Input id="candidateName" placeholder="Puedes dejarlo vacío para anonimizar" {...register('candidateName')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="interviewDate">Fecha de entrevista</Label>
          <Input id="interviewDate" type="date" {...register('interviewDate')} />
        </div>
      </div>

      {/* Transcript */}
      <div className="space-y-2">
        <Label htmlFor="transcript">Transcripción de la entrevista *</Label>
        <Textarea
          id="transcript"
          placeholder="Pega aquí la transcripción completa de la entrevista..."
          className="min-h-64 font-mono text-sm resize-y"
          {...register('transcript')}
        />
        {errors.transcript && <p className="text-xs text-destructive">{errors.transcript.message}</p>}
      </div>

      {/* Consent */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                Confirmación de uso
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Confirmo que tengo autorización para procesar esta transcripción con fines de evaluación interna.
                La transcripción será procesada por un modelo de IA y <strong>no será almacenada</strong> salvo que lo indique explícitamente.
                El informe generado requiere revisión humana antes de ser utilizado.
              </p>
            </div>
          </label>
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading || !consentChecked} className="gap-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Generando informe...' : 'Generar informe'}
      </Button>
    </form>
  )
}
