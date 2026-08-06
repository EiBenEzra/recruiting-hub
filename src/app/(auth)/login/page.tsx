'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrainCircuit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error('Error al iniciar sesión', { description: error.message })
      setLoading(false)
      return
    }

    router.push('/sst')
    router.refresh()
  }

  return (
    <Card className="w-full max-w-sm shadow-sm">
      <CardHeader className="text-center space-y-3 pb-4">
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-7 w-7 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl">Hub de Reclutamiento</CardTitle>
        <CardDescription>Ingresa con tu cuenta del equipo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
