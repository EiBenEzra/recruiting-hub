'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Copy, Bookmark } from 'lucide-react'
import { GenerateOutreachInputSchema, type GenerateOutreachInput, type OutreachResult } from '@/lib/schemas/sourcing.schema'
import { toast } from 'sonner'
import type { SourcingMessage } from '@/types/database.types'

const TONE_OPTIONS = [
  { value: 'formal', label: 'Formal', desc: 'Profesional y distante' },
  { value: 'cercano', label: 'Cercano', desc: 'Cálido y directo' },
  { value: 'ejecutivo', label: 'Ejecutivo', desc: 'Conciso y estratégico' },
]

interface OutreachGeneratorProps {
  savedTemplates: Partial<SourcingMessage>[]
}

export function OutreachGenerator({ savedTemplates }: OutreachGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OutreachResult | null>(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<GenerateOutreachInput>({
    resolver: zodResolver(GenerateOutreachInputSchema),
  })

  async function onSubmit(data: GenerateOutreachInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/sourcing/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al generar')
      setResult(await res.json())
      toast.success('Mensaje generado')
    } catch {
      toast.error('Error al generar el mensaje')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(`${result.subject}\n\n${result.message}`)
    toast.success('Copiado al portapapeles')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="candidateName">Nombre del candidato *</Label>
            <Input id="candidateName" placeholder="María González" {...register('candidateName')} />
            {errors.candidateName && <p className="text-xs text-destructive">{errors.candidateName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Tono del mensaje *</Label>
            <Select onValueChange={(v) => v && setValue('tone', v as GenerateOutreachInput['tone'])}>
              <SelectTrigger><SelectValue placeholder="Seleccionar tono" /></SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div>
                      <p>{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rol que ofrecemos</Label>
          <Input id="role" placeholder="Senior Backend Engineer" {...register('role')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profileSummary">Resumen del perfil del candidato *</Label>
          <Textarea
            id="profileSummary"
            placeholder="Describe brevemente: experiencia, stack, logros, empresa actual..."
            className="min-h-28 resize-y"
            {...register('profileSummary')}
          />
          {errors.profileSummary && <p className="text-xs text-destructive">{errors.profileSummary.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyContext">Contexto de la empresa (opcional)</Label>
          <Textarea
            id="companyContext"
            placeholder="Qué hace tu empresa, por qué es relevante para este perfil..."
            className="min-h-20 resize-y"
            {...register('companyContext')}
          />
        </div>

        <Button type="submit" disabled={loading} className="gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Generando...' : 'Generar mensaje'}
        </Button>
      </form>

      <div className="space-y-4">
        {result ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm">Mensaje generado</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Guardar como plantilla">
                  <Bookmark className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Asunto</p>
                <p className="text-sm font-medium">{result.subject}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Mensaje</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.message}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {result.message.split(' ').length} palabras aprox.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed h-48">
            <p className="text-sm text-muted-foreground">El mensaje aparecerá aquí.</p>
          </div>
        )}

        {savedTemplates.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Plantillas guardadas</p>
            {savedTemplates.map((t) => (
              <button
                key={t.id}
                className="w-full rounded-lg border bg-muted/30 px-4 py-3 text-left text-sm hover:bg-muted/60 transition-colors"
              >
                <p className="font-medium truncate">{t.template_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.tone} · Usado {t.times_used ?? 0} veces
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
