import { PageHeader } from '@/components/layout/PageHeader'
import { ProductivityDashboard } from '@/components/dashboard/ProductivityDashboard'

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Dashboard de Productividad"
        description="Métricas del equipo de recruiting. Actualizado mensualmente."
      />
      <ProductivityDashboard />
    </div>
  )
}
