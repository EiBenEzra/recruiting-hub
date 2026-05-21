import { NextRequest, NextResponse } from 'next/server'
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType,
} from 'docx'
import { createClient } from '@/lib/supabase/server'
import { createAuditLog } from '@/lib/services/audit.service'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { reportId, sections } = await req.json()

    const children: Paragraph[] = [
      new Paragraph({
        text: 'Informe de Entrevista',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Contenido generado por IA. Requiere revisión y validación humana antes de ser utilizado.',
            italics: true,
            color: 'B45309',
            size: 18,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      }),
    ]

    for (const [, section] of Object.entries(sections as Record<string, { title: string; content: string }>)) {
      children.push(
        new Paragraph({
          text: section.title,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 120 },
        }),
        new Paragraph({
          children: [new TextRun({ text: section.content, size: 22 })],
          spacing: { after: 200 },
        })
      )
    }

    const doc = new Document({
      sections: [{ properties: {}, children }],
      creator: 'Hub de Reclutamiento R',
      title: 'Informe de Entrevista',
    })

    const buffer = Buffer.from(await Packer.toBuffer(doc))

    await createAuditLog({
      userId: user.id,
      action: 'export_report_docx',
      module: 'reports',
      resourceType: 'report',
      resourceId: reportId,
    })

    // Mark as exported
    if (reportId && reportId !== 'unknown') {
      await supabase.from('reports').update({ status: 'exported', exported_at: new Date().toISOString() }).eq('id', reportId)
    }

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="informe-${reportId?.slice(0, 8) ?? 'report'}.docx"`,
      },
    })
  } catch (error) {
    console.error('[export/docx]', error)
    return NextResponse.json({ error: 'Error al exportar' }, { status: 500 })
  }
}
