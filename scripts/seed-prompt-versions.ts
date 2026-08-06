import { ALL_PROMPTS } from '../src/lib/prompts/index'

const MGMT_TOKEN = process.env.SUPABASE_MGMT_TOKEN ?? ''
const PROJECT_REF = 'ijupbnbdlvnynqbwyxii'
const ADMIN_USER_ID = '2fccb721-4a0b-4652-8a66-575cb66ddf8f'

const SLUG_TO_ID: Record<string, string> = {
  'informe-se':         '38bc7824-94c0-4c8e-8bff-0fb7ea021d3f',
  'informe-em':         'b4f68450-1447-4fe6-9021-edbab6ac324d',
  'feedback-se':        '4b3064e0-bc25-4d74-a5f0-3e4f21a7d343',
  'feedback-em':        '76996a6e-6487-434f-991d-2b1f863943bf',
  'sourcing-booleanos': '36d80509-3e9d-4e43-944d-88f5d9472b37',
  'sourcing-outreach':  '5806081f-0e77-446e-968e-7e8ff320971b',
}

async function runSQL(query: string) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MGMT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
  return res.json()
}

// Dollar-quote a string safely. Finds a tag that doesn't appear in the content.
function dollarQuote(text: string): string {
  let tag = ''
  let i = 0
  while (text.includes(`$${tag}$`)) tag = `q${i++}`
  return `$${tag}$${text}$${tag}$`
}

async function seedVersions() {
  console.log(`\n🌱 Seeding ${ALL_PROMPTS.length} prompt versions...\n`)

  for (const prompt of ALL_PROMPTS) {
    const templateId = SLUG_TO_ID[prompt.slug]
    if (!templateId) {
      console.log(`  ⚠️  No ID para ${prompt.slug}`)
      continue
    }

    const examplesJson = JSON.stringify(prompt.examples)
    const query = `
      UPDATE public.prompt_versions SET is_current = false
        WHERE template_id = '${templateId}';

      INSERT INTO public.prompt_versions
        (template_id, version_number, system_prompt, user_prompt, examples, is_current, created_by, notes)
      VALUES (
        '${templateId}',
        ${prompt.version},
        ${dollarQuote(prompt.systemPrompt)},
        ${dollarQuote(prompt.userPrompt)},
        ${dollarQuote(examplesJson)}::jsonb,
        true,
        '${ADMIN_USER_ID}',
        'Versión inicial desde seed'
      )
      ON CONFLICT (template_id, version_number) DO NOTHING;
    `

    const result = await runSQL(query)
    if (result?.message) {
      console.log(`  ❌ ${prompt.slug}: ${result.message}`)
    } else {
      console.log(`  ✅ ${prompt.slug} v${prompt.version}`)
    }
  }

  console.log('\n✅ Seed de versiones completado.\n')
}

seedVersions().catch(console.error)
