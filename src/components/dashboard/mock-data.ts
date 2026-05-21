export const FUNNEL_DATA = [
  { stage: 'Sourcing', count: 240 },
  { stage: 'Aplicaciones', count: 180 },
  { stage: 'CV Review', count: 120 },
  { stage: 'Recruiter Screen', count: 80 },
  { stage: 'Técnica', count: 45 },
  { stage: 'Cultura', count: 28 },
  { stage: 'Oferta', count: 18 },
  { stage: 'Contratado', count: 12 },
]

export const MONTHLY_TREND = [
  { month: 'Ene', applicants: 38, offers: 3, hires: 2 },
  { month: 'Feb', applicants: 52, offers: 4, hires: 3 },
  { month: 'Mar', applicants: 61, offers: 5, hires: 4 },
  { month: 'Abr', applicants: 45, offers: 3, hires: 2 },
  { month: 'May', applicants: 78, offers: 6, hires: 5 },
  { month: 'Jun', applicants: 90, offers: 7, hires: 6 },
]

export const SOURCE_DATA = [
  { source: 'LinkedIn', value: 42 },
  { source: 'Referidos', value: 28 },
  { source: 'GitHub', value: 12 },
  { source: 'Job Boards', value: 10 },
  { source: 'Otros', value: 8 },
]

export const REJECTION_REASONS = [
  { reason: 'Expectativa salarial', count: 32 },
  { reason: 'Fit técnico insuficiente', count: 28 },
  { reason: 'Fit cultural', count: 18 },
  { reason: 'Contraoferta empresa actual', count: 15 },
  { reason: 'Ubicación / modalidad', count: 12 },
  { reason: 'Timing', count: 9 },
]

export const KPI_DATA = {
  timeToOffer: { value: 28, unit: 'días', label: 'Tiempo a oferta (prom.)' },
  offerAcceptRate: { value: 72, unit: '%', label: 'Tasa aceptación oferta' },
  activeRoles: { value: 14, unit: 'roles', label: 'Roles activos' },
  pipelineSize: { value: 156, unit: 'candidatos', label: 'Pipeline activo' },
}
