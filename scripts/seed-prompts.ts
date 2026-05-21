/**
 * Seed script: carga todos los prompts desde los archivos .ts a la base de datos.
 * Uso: npx tsx scripts/seed-prompts.ts
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { ALL_PROMPTS } from '../src/lib/prompts/index'
import ws from 'ws'

config({ path: '.env.local' })

const ADMIN_USER_ID = process.env.SEED_ADMIN_USER_ID

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

if (!ADMIN_USER_ID) {
  console.error('❌ Falta SEED_ADMIN_USER_ID en .env.local')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } }
)

async function seedPrompts() {
  console.log(`\n🌱 Seeding ${ALL_PROMPTS.length} prompts...\n`)

  for (const prompt of ALL_PROMPTS) {
    // Upsert prompt template
    const { data: template, error: tplError } = await supabase
      .from('prompt_templates')
      .upsert({
        name: prompt.name,
        slug: prompt.slug,
        description: prompt.description,
        module: prompt.module,
        input_schema: prompt.inputSchema,
        output_schema: prompt.outputSchema,
        is_active: true,
      }, { onConflict: 'slug' })
      .select('id')
      .single()

    if (tplError) {
      console.error(`  ❌ Error en template "${prompt.slug}":`, tplError.message)
      continue
    }

    // Check if current version already exists
    const { data: existingVersion } = await supabase
      .from('prompt_versions')
      .select('id, version_number')
      .eq('template_id', template.id)
      .eq('version_number', prompt.version)
      .single()

    if (existingVersion) {
      console.log(`  ⏭  ${prompt.slug} v${prompt.version} ya existe — skipping`)
      continue
    }

    // Mark previous versions as non-current
    await supabase
      .from('prompt_versions')
      .update({ is_current: false })
      .eq('template_id', template.id)

    // Insert new version
    const { error: versionError } = await supabase
      .from('prompt_versions')
      .insert({
        template_id: template.id,
        version_number: prompt.version,
        system_prompt: prompt.systemPrompt,
        user_prompt: prompt.userPrompt,
        examples: prompt.examples,
        is_current: true,
        created_by: ADMIN_USER_ID,
        notes: `Versión inicial cargada desde seed (${new Date().toISOString()})`,
      })

    if (versionError) {
      console.error(`  ❌ Error en versión "${prompt.slug}":`, versionError.message)
    } else {
      console.log(`  ✅ ${prompt.slug} v${prompt.version} → OK`)
    }
  }

  console.log('\n✅ Seed completado.\n')
}

seedPrompts().catch(console.error)
