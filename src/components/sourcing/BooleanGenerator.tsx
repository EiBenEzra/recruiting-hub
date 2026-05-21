'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Copy } from 'lucide-react'
import { GenerateBooleanInputSchema, type GenerateBooleanInput, type BooleanResult } from '@/lib/schemas/sourcing.schema'
import { toast } from 'sonner'

const SENIORITY_OPTIONS = ['Junior', 'Semi-Senior', 'Senior', 'Staff', 'Principal']

export function BooleanGenerator() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BooleanResult | null>(null)
  const [techInput, setTechInput] = useState('')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<GenerateBooleanInput>({
    resolver: zodResolver(GenerateBooleanInputSchema) as any,
    defaultValues: { technologies: [], industries: [], exclusions: [] },
  })

  const technologies = watch('technologies') ?? []

  function addTech(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = techInput.trim()
      if (val && !technologies.includes(val)) {
        setValue('technologies', [...technologies, val])
      }
      setTechInput('')
    }
  }

  function removeTech(tech: string) {
    setValue('technologies', technologies.filter((t) => t !== tech))
  }

  async function onSubmit(data: GenerateBooleanInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/sourcing/boolean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al generar')
      setResult(await res.json())
      toast.success('Strings generados')
    } catch {
      toast.error('Error al generar strings booleanos')
    } finally {
      setLoading(false)
    }
  }

  async function copyString(text: string, label: string) {
    await navigator.clipboard.writeText(text)
    toast.success(`${label} copiado al portapapeles`)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="role">Rol *</Label>
            <Input id="role" placeholder="Backend Engineer" {...register('role')} />
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>
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
        </div>

        <div className="space-y-2">
          <Label>Tecnologías *</Label>
          <Input
            placeholder="Escribe y presiona Enter o coma... (ej. Python, FastAPI)"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={addTech}
          />
          {technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {technologies.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => removeTech(t)}
                  className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary hover:bg-primary/20 transition-colors"
                >
                  {t} ×
                </button>
              ))}
            </div>
          )}
          {errors.technologies && <p className="text-xs text-destructive">Agrega al menos una tecnología</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input id="location" placeholder="Chile, LATAM, Remoto..." {...register('location')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exclusions">Exclusiones (separadas por coma)</Label>
            <Input
              id="exclusions"
              placeholder="Empresa A, Empresa B..."
              onChange={(e) => setValue('exclusions', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Generando...' : 'Generar strings booleanos'}
        </Button>
      </form>

      {result ? (
        <div className="space-y-4">
          {([
            { key: 'linkedin', label: 'LinkedIn Recruiter' },
            { key: 'google_xray', label: 'Google X-Ray' },
            { key: 'github', label: 'GitHub Search' },
          ] as const).map(({ key, label }) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">{label}</CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyString(result[key], label)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="break-all font-mono text-xs text-muted-foreground leading-relaxed">
                  {result[key]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed h-64">
          <p className="text-sm text-muted-foreground">Los strings aparecerán aquí.</p>
        </div>
      )}
    </div>
  )
}
