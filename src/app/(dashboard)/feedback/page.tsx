import { PageHeader } from '@/components/layout/PageHeader'
import { AIBanner } from '@/components/layout/AIBanner'
import { FeedbackGenerator } from '@/components/feedback/FeedbackGenerator'

export default function FeedbackPage() {
  return (
    <div className="flex flex-col">
      <AIBanner />
      <div className="space-y-8 p-8">
        <PageHeader
          title="Generador de Feedback"
          description="Genera feedback estructurado para candidatos. Vista interna para el recruiter y versión lista para enviar al candidato."
        />
        <FeedbackGenerator />
      </div>
    </div>
  )
}
