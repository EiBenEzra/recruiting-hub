import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'

export type AuditAction =
  | 'generate_report'
  | 'export_report_docx'
  | 'delete_report'
  | 'delete_transcript'
  | 'generate_feedback'
  | 'generate_boolean'
  | 'generate_outreach'
  | 'save_template'
  | 'create_resource'
  | 'update_resource'
  | 'delete_resource'
  | 'update_prompt_version'
  | 'invite_user'
  | 'change_user_role'

interface AuditEntry {
  userId: string | null
  action: AuditAction
  module: string
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, unknown>
}

export async function createAuditLog(entry: AuditEntry): Promise<void> {
  try {
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] ?? null

    const supabase = createAdminClient()
    await supabase.from('audit_logs').insert({
      user_id: entry.userId,
      action: entry.action,
      module: entry.module,
      resource_type: entry.resourceType ?? null,
      resource_id: entry.resourceId ?? null,
      metadata: entry.metadata ?? {},
      ip_address: ipAddress,
    })
  } catch (error) {
    // Audit log failures must never break the main flow
    console.error('[AuditLog] Failed to write audit entry:', error)
  }
}
