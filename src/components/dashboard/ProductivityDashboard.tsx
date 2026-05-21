'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, FunnelChart, Funnel, LabelList,
} from 'recharts'
import { FUNNEL_DATA, MONTHLY_TREND, SOURCE_DATA, REJECTION_REASONS, KPI_DATA } from './mock-data'
import { TrendingUp, Users, Clock, CheckCircle } from 'lucide-react'

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff']

export function ProductivityDashboard() {
  const [selectedMonth, setSelectedMonth] = useState('5')

  return (
    <div className="space-y-6">
      {/* Month filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Período:</span>
        <Select value={selectedMonth} onValueChange={(v) => v && setSelectedMonth(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={i} value={String(i)}>{m} 2025</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground italic">Datos mock — conectar fuente real en Fase 4</span>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard icon={Clock} label={KPI_DATA.timeToOffer.label} value={KPI_DATA.timeToOffer.value} unit={KPI_DATA.timeToOffer.unit} trend="+2" trendPositive={false} />
        <KPICard icon={CheckCircle} label={KPI_DATA.offerAcceptRate.label} value={KPI_DATA.offerAcceptRate.value} unit={KPI_DATA.offerAcceptRate.unit} trend="+5%" trendPositive />
        <KPICard icon={TrendingUp} label={KPI_DATA.activeRoles.label} value={KPI_DATA.activeRoles.value} unit={KPI_DATA.activeRoles.unit} />
        <KPICard icon={Users} label={KPI_DATA.pipelineSize.label} value={KPI_DATA.pipelineSize.value} unit={KPI_DATA.pipelineSize.unit} trend="+12" trendPositive />
      </div>

      {/* Row 1: Funnel + Source */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Funnel de Recruiting</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={FUNNEL_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} width={110} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {FUNNEL_DATA.map((_, i) => (
                    <Cell key={i} fill={COLORS[Math.min(i, COLORS.length - 1)]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Fuente de Candidatos (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={SOURCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Trend + Rejection reasons */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Evolución mensual</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={MONTHLY_TREND}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="applicants" stroke="#6366f1" strokeWidth={2} dot={false} name="Aplicantes" />
                <Line type="monotone" dataKey="offers" stroke="#10b981" strokeWidth={2} dot={false} name="Ofertas" />
                <Line type="monotone" dataKey="hires" stroke="#f59e0b" strokeWidth={2} dot={false} name="Contratados" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Motivos de descarte</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={REJECTION_REASONS} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="reason" tick={{ fontSize: 10 }} width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface KPICardProps {
  icon: React.ElementType
  label: string
  value: number
  unit: string
  trend?: string
  trendPositive?: boolean
}

function KPICard({ icon: Icon, label, value, unit, trend, trendPositive }: KPICardProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tabular-nums">{value}</span>
              <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
            {trend && (
              <p className={`text-xs ${trendPositive ? 'text-green-600' : 'text-red-500'}`}>
                {trend} vs. mes anterior
              </p>
            )}
          </div>
          <div className="rounded-lg bg-primary/10 p-2.5">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
