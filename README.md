# Hub de Reclutamiento

Plataforma interna de reclutamiento construida sobre Next.js y Supabase, con generación asistida por IA para informes de candidatos, feedback estructurado y búsqueda de talento.

## Módulos

| Módulo | Qué hace |
|---|---|
| **Sourcing** | Genera booleanos de búsqueda para LinkedIn Recruiter, Google X-Ray y GitHub a partir del perfil del cargo |
| **Reports** | Redacta informes de evaluación de candidatos y los exporta a DOCX |
| **Feedback** | Estructura feedback de entrevistas con formato consistente |
| **SST** | Módulo de seguridad y salud en el trabajo |
| **Admin** | Gestión de prompts, versiones y configuración de la organización |

## Stack

- **Next.js** (App Router) + React + TypeScript
- **Supabase** — Postgres, auth y row-level security
- **Vercel AI SDK** con proveedores intercambiables: Anthropic, OpenAI y Google
- **Tailwind CSS** + Base UI
- **docx** para exportación de informes

## Configuración

Copia el archivo de ejemplo y completa tus credenciales:

```bash
cp .env.example .env.local
```

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública del cliente |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servidor — **nunca la expongas al cliente** |
| `SUPABASE_MGMT_TOKEN` | Token de Management API, solo para los scripts de seed |
| `AI_PROVIDER` | `anthropic`, `openai` o `google` |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` | Según el proveedor elegido |
| `AI_MODEL_REPORTS` / `AI_MODEL_FEEDBACK` / `AI_MODEL_SOURCING` | Modelo por módulo |
| `NEXT_PUBLIC_APP_URL` | URL base de la app |
| `NEXT_PUBLIC_ORG_ID` | Identificador de la organización |

Ningún `.env` se versiona. Si necesitas rotar credenciales, hazlo desde el panel de cada proveedor.

## Desarrollo

```bash
npm install
npm run dev
```

Las migraciones de base de datos están en `supabase/migrations/`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run type-check` | Verificación de tipos |
| `npm run seed:prompts` | Carga las versiones de prompts en la base |
