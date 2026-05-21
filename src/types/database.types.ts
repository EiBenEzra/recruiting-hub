export type UserRole = 'admin' | 'manager' | 'recruiter' | 'viewer'
export type ResourceType = 'document' | 'guide' | 'rubric' | 'template' | 'tool' | 'ai_assistant'
export type ReportStatus = 'draft' | 'reviewed' | 'exported' | 'deleted'
export type FeedbackStatus = 'draft' | 'sent' | 'deleted'
export type MessageTone = 'formal' | 'cercano' | 'ejecutivo'
export type PromptModule = 'reports' | 'feedback' | 'sourcing_boolean' | 'sourcing_outreach'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  organization_id: string
  created_at: string
  updated_at: string
}

export interface ResourceCategory {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  sort_order: number
  created_at: string
}

export interface Resource {
  id: string
  category_id: string
  title: string
  description: string
  content: string | null
  resource_type: ResourceType
  tags: string[]
  is_active: boolean
  organization_id: string
  created_by: string
  updated_by: string | null
  created_at: string
  updated_at: string
  // joins
  category?: ResourceCategory
  creator?: Pick<Profile, 'id' | 'full_name'>
}

export interface ReportTemplate {
  id: string
  role_type: string
  display_name: string
  sections: ReportSection[]
  is_active: boolean
  organization_id: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface ReportSection {
  id: string
  title: string
  description: string
  order: number
  required: boolean
}

export interface Report {
  id: string
  template_id: string
  created_by: string
  candidate_name: string | null
  candidate_id_hash: string | null
  role: string
  seniority_level: string | null
  interview_date: string | null
  transcript_stored: boolean
  transcript_hash: string | null
  sections_json: Record<string, { title: string; content: string; edited: boolean }>
  ai_raw_output: Record<string, unknown> | null
  status: ReportStatus
  is_anonymized: boolean
  consent_given: boolean
  consent_timestamp: string | null
  exported_at: string | null
  organization_id: string
  created_at: string
  updated_at: string
  // joins
  template?: ReportTemplate
  creator?: Pick<Profile, 'id' | 'full_name'>
}

export interface FeedbackOutput {
  id: string
  created_by: string
  candidate_name: string | null
  candidate_id_hash: string | null
  role: string
  seniority_level: string
  interview_date: string | null
  internal_feedback: {
    strengths: string[]
    gaps: string[]
    recommendations: string[]
  }
  external_feedback: {
    message: string
    tone: MessageTone
  }
  tone: MessageTone
  status: FeedbackStatus
  is_anonymized: boolean
  organization_id: string
  created_at: string
  updated_at: string
}

export interface BooleanSearch {
  id: string
  created_by: string
  role: string
  seniority: string
  technologies: string[]
  location: string | null
  industries: string[]
  exclusions: string[]
  results: {
    linkedin: string
    google_xray: string
    github: string
  }
  organization_id: string
  created_at: string
}

export interface SourcingMessage {
  id: string
  created_by: string
  candidate_name: string
  profile_summary: string
  tone: MessageTone
  generated_message: string
  is_template: boolean
  template_name: string | null
  times_used: number
  organization_id: string
  created_at: string
  updated_at: string
}

export interface PromptTemplate {
  id: string
  name: string
  slug: string
  description: string
  module: PromptModule
  input_schema: Record<string, unknown>
  output_schema: Record<string, unknown>
  is_active: boolean
  created_at: string
}

export interface PromptVersion {
  id: string
  template_id: string
  version_number: number
  system_prompt: string
  user_prompt: string
  examples: Array<{ input: unknown; output: unknown }>
  notes: string | null
  is_current: boolean
  created_by: string
  created_at: string
  // joins
  template?: PromptTemplate
  creator?: Pick<Profile, 'id' | 'full_name'>
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  module: string
  resource_type: string | null
  resource_id: string | null
  metadata: Record<string, unknown>
  ip_address: string | null
  created_at: string
  // joins
  user?: Pick<Profile, 'id' | 'full_name' | 'email'>
}

export interface DashboardMetric {
  id: string
  period_year: number
  period_month: number
  metric_key: string
  metric_value: number
  dimension: string | null
  dimension_value: string | null
  created_at: string
}
