'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Copy, CheckCircle2, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react'
import { GenerateFeedbackInputSchema, type GenerateFeedbackInput, type FeedbackOutput } from '@/lib/schemas/feedback.schema'
import { toast } from 'sonner'

const ROLE_TYPES = [
  { value: 'software_engineer', label: 'Software Engineer' },
  { value: 'engineering_manager', label: 'Engineering Manager' },
]
const SENIORITY_OPTIONS = ['Junior', 'Semi-Senior', 'Senior', 'Staff', 'Principal', 'Director', 'VP']
const TONE_OPTIONS = [
  { value: 'formal', label: 'Formal' },
  { value: 'cercano', label: 'Cercano' },
  { value: 'ejecutivo', label: 'Ejecutivo' },
]

export function FeedbackGenerator() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<FeedbackOutput | null>(null)
  const [copied, setCopied] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<GenerateFeedbackInput>({
    resolver: zodResolver(GenerateFeedbackInputSchema),
  })

  async function onSubmit(data: GenerateFeedbackInput) {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/feedback/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al generar')
      }
      const feedback: FeedbackOutput = await res.json()
      setResult(feedback)
      toast.success('Feedback generado correctamente')
    } catch (error: unknown) {
      toast.error('Error', { description: error instanceof Error ? error.message : 'Intenta nuevamente' })
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(result.external.message)
    setCopied(true)
    toast.success('Copiado al portapapeles')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tipo de rol *</Label>
            <Select onValueChange={(v) => v && setValue('roleType', v as GenerateFeedbackInput['roleType'])}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                {ROLE_TYPES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rol específico *</Label>
            <Input id="role" placeholder="Backend Engineer" {...register('role')} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Seniority *</Label>
            <Select onValueChange={(v) => { if (v) setValue('seniority', v as string) }}>
              <SelectTrigger><SelectValue placeholder="Nivel" /></SelectTrigger>
              <SelectContent>
                {SENIORITY_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tono del mensaje *</Label>
            <Select onValueChange={(v) => v && setValue('tone', v as GenerateFeedbackInput['tone'])}>
              <SelectTrigger><SelectValue placeholder="Tono" /></SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="candidateName">Nombre del candidato (opcional)</Label>
          <Input id="candidateName" placeholder="Anónimo si se deja vacío" {...register('candidateName')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transcript">Transcripción *</Label>
          <Textarea
            id="transcript"
            placeholder="Pega la transcripción aquí..."
            className="min-h-48 font-mono text-sm resize-y"
            {...register('transcript')}
          />
          {errors.transcript && <p className="text-xs text-destructive">{errors.transcript.message}</p>}
        </div>

        <Button type="submit" disabled={loading} className="gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Generando...' : 'Generar feedback'}
        </Button>
      </form>

      {/* Result */}
      {result ? (
        <Tabs defaultValue="internal">
          <TabsList className="w-full">
            <TabsTrigger value="internal" className="flex-1">Vista interna</TabsTrigger>
            <TabsTrigger value="external" className="flex-1">Vista candidato</TabsTrigger>
          </TabsList>

          <TabsContent value="internal" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" /> Fortalezas observadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.internal.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-600" /> Brechas / Áreas de desarrollo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.internal.gaps.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="h-1.5 w-1.5 mt-2 rounded-full bg-amber-400 shrink-0" />
                      {g}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Lightbulb className="h-4 w-4 text-blue-600" /> Recomendaciones accionables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.internal.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-xs text-muted-foreground mt-0.5">{i + 1}.</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="external" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm">Mensaje para el candidato</CardTitle>
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {result.external.message}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed h-64">
          <p className="text-sm text-muted-foreground">
            El feedback aparecerá aquí una vez generado.
          </p>
        </div>
      )}
    </div>
  )
}
