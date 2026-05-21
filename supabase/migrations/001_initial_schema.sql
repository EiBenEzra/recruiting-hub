-- ============================================================
-- Recruiting Intelligence Hub — Initial Schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for full-text search

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL DEFAULT '',
  email           TEXT NOT NULL DEFAULT '',
  role            TEXT NOT NULL DEFAULT 'recruiter'
                  CHECK (role IN ('admin', 'manager', 'recruiter', 'viewer')),
  avatar_url      TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SINGLE SOURCE OF TRUTH
-- ============================================================
CREATE TABLE public.resource_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT,
  color       TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.resources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID NOT NULL REFERENCES resource_categories(id),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  content         TEXT,
  resource_type   TEXT NOT NULL DEFAULT 'document'
                  CHECK (resource_type IN ('document','guide','rubric','template','tool','ai_assistant')),
  tags            TEXT[] NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_by      UUID NOT NULL REFERENCES profiles(id),
  updated_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resources_category ON resources(category_id);
CREATE INDEX idx_resources_tags ON resources USING GIN(tags);
CREATE INDEX idx_resources_fts ON resources
  USING GIN(to_tsvector('spanish', title || ' ' || description));
CREATE INDEX idx_resources_org ON resources(organization_id, is_active);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE public.report_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_type       TEXT NOT NULL UNIQUE,
  display_name    TEXT NOT NULL,
  sections        JSONB NOT NULL DEFAULT '[]',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id         UUID NOT NULL REFERENCES report_templates(id),
  created_by          UUID NOT NULL REFERENCES profiles(id),
  candidate_name      TEXT,
  candidate_id_hash   TEXT,
  role                TEXT NOT NULL,
  seniority_level     TEXT,
  interview_date      DATE,
  transcript_stored   BOOLEAN NOT NULL DEFAULT false,
  transcript_hash     TEXT,
  sections_json       JSONB NOT NULL DEFAULT '{}',
  ai_raw_output       JSONB,
  status              TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft','reviewed','exported','deleted')),
  is_anonymized       BOOLEAN NOT NULL DEFAULT false,
  consent_given       BOOLEAN NOT NULL DEFAULT false,
  consent_timestamp   TIMESTAMPTZ,
  exported_at         TIMESTAMPTZ,
  organization_id     UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_created_by ON reports(created_by);
CREATE INDEX idx_reports_status ON reports(status) WHERE status != 'deleted';
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_org ON reports(organization_id);

-- ============================================================
-- FEEDBACK
-- ============================================================
CREATE TABLE public.feedback_outputs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by          UUID NOT NULL REFERENCES profiles(id),
  candidate_name      TEXT,
  candidate_id_hash   TEXT,
  role                TEXT NOT NULL,
  seniority_level     TEXT NOT NULL,
  interview_date      DATE,
  internal_feedback   JSONB NOT NULL DEFAULT '{}',
  external_feedback   JSONB NOT NULL DEFAULT '{}',
  tone                TEXT NOT NULL DEFAULT 'formal'
                      CHECK (tone IN ('formal','cercano','ejecutivo')),
  status              TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft','sent','deleted')),
  is_anonymized       BOOLEAN NOT NULL DEFAULT false,
  organization_id     UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TECH SOURCING
-- ============================================================
CREATE TABLE public.boolean_searches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      UUID NOT NULL REFERENCES profiles(id),
  role            TEXT NOT NULL,
  seniority       TEXT NOT NULL,
  technologies    TEXT[] NOT NULL DEFAULT '{}',
  location        TEXT,
  industries      TEXT[] NOT NULL DEFAULT '{}',
  exclusions      TEXT[] NOT NULL DEFAULT '{}',
  results         JSONB NOT NULL DEFAULT '{}',
  organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.sourcing_messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by        UUID NOT NULL REFERENCES profiles(id),
  candidate_name    TEXT NOT NULL,
  profile_summary   TEXT NOT NULL,
  tone              TEXT NOT NULL CHECK (tone IN ('formal','cercano','ejecutivo')),
  generated_message TEXT NOT NULL,
  is_template       BOOLEAN NOT NULL DEFAULT false,
  template_name     TEXT,
  times_used        INTEGER NOT NULL DEFAULT 0,
  organization_id   UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sourcing_templates ON sourcing_messages(organization_id, is_template)
  WHERE is_template = true;

-- ============================================================
-- PROMPTS
-- ============================================================
CREATE TABLE public.prompt_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT NOT NULL DEFAULT '',
  module          TEXT NOT NULL
                  CHECK (module IN ('reports','feedback','sourcing_boolean','sourcing_outreach')),
  input_schema    JSONB NOT NULL DEFAULT '{}',
  output_schema   JSONB NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.prompt_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id     UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
  version_number  INTEGER NOT NULL,
  system_prompt   TEXT NOT NULL,
  user_prompt     TEXT NOT NULL,
  examples        JSONB NOT NULL DEFAULT '[]',
  notes           TEXT,
  is_current      BOOLEAN NOT NULL DEFAULT false,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(template_id, version_number)
);

CREATE INDEX idx_prompt_versions_current ON prompt_versions(template_id, is_current)
  WHERE is_current = true;

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES profiles(id),
  action        TEXT NOT NULL,
  module        TEXT NOT NULL,
  resource_type TEXT,
  resource_id   UUID,
  metadata      JSONB NOT NULL DEFAULT '{}',
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_module ON audit_logs(module);

-- ============================================================
-- DASHBOARD METRICS
-- ============================================================
CREATE TABLE public.dashboard_metrics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_year     INTEGER NOT NULL,
  period_month    INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  metric_key      TEXT NOT NULL,
  metric_value    NUMERIC NOT NULL,
  dimension       TEXT,
  dimension_value TEXT,
  organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(period_year, period_month, metric_key, organization_id, dimension, dimension_value)
);

CREATE INDEX idx_metrics_period ON dashboard_metrics(organization_id, period_year, period_month);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources          ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports            ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_outputs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE boolean_searches   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sourcing_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics  ENABLE ROW LEVEL SECURITY;

-- Helper: get current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- PROFILES
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  USING (id = auth.uid() OR current_user_role() IN ('admin','manager'));
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid());

-- RESOURCES (all authenticated read; admin+manager write)
CREATE POLICY "resources_select" ON resources FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);
CREATE POLICY "resources_insert" ON resources FOR INSERT
  WITH CHECK (current_user_role() IN ('admin','manager'));
CREATE POLICY "resources_update" ON resources FOR UPDATE
  USING (current_user_role() IN ('admin','manager'));

CREATE POLICY "categories_select" ON resource_categories FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "categories_write" ON resource_categories FOR ALL
  USING (current_user_role() = 'admin');

-- REPORT TEMPLATES
CREATE POLICY "templates_select" ON report_templates FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);
CREATE POLICY "templates_write" ON report_templates FOR ALL
  USING (current_user_role() IN ('admin','manager'));

-- REPORTS (recruiters see own; managers+admins see all)
CREATE POLICY "reports_select" ON reports FOR SELECT
  USING (
    created_by = auth.uid()
    OR current_user_role() IN ('admin','manager')
  );
CREATE POLICY "reports_insert" ON reports FOR INSERT
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "reports_update" ON reports FOR UPDATE
  USING (created_by = auth.uid() OR current_user_role() IN ('admin','manager'));

-- FEEDBACK (same as reports)
CREATE POLICY "feedback_select" ON feedback_outputs FOR SELECT
  USING (created_by = auth.uid() OR current_user_role() IN ('admin','manager'));
CREATE POLICY "feedback_insert" ON feedback_outputs FOR INSERT
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "feedback_update" ON feedback_outputs FOR UPDATE
  USING (created_by = auth.uid() OR current_user_role() IN ('admin','manager'));

-- SOURCING
CREATE POLICY "boolean_select" ON boolean_searches FOR SELECT
  USING (created_by = auth.uid() OR current_user_role() IN ('admin','manager'));
CREATE POLICY "boolean_insert" ON boolean_searches FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "sourcing_msg_select" ON sourcing_messages FOR SELECT
  USING (created_by = auth.uid() OR is_template = true OR current_user_role() IN ('admin','manager'));
CREATE POLICY "sourcing_msg_insert" ON sourcing_messages FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- PROMPTS (all read; only admin writes)
CREATE POLICY "prompt_templates_select" ON prompt_templates FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);
CREATE POLICY "prompt_templates_write" ON prompt_templates FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "prompt_versions_select" ON prompt_versions FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "prompt_versions_write" ON prompt_versions FOR ALL
  USING (current_user_role() = 'admin');

-- AUDIT LOGS (only admin reads; nobody writes directly)
CREATE POLICY "audit_select" ON audit_logs FOR SELECT
  USING (current_user_role() = 'admin');

-- DASHBOARD METRICS
CREATE POLICY "metrics_select" ON dashboard_metrics FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "metrics_write" ON dashboard_metrics FOR ALL
  USING (current_user_role() IN ('admin','manager'));

-- ============================================================
-- SEED: Resource categories
-- ============================================================
INSERT INTO resource_categories (name, slug, icon, color, sort_order) VALUES
  ('Asistentes IA',         'ai-assistants',    'BrainCircuit',  '#6366f1', 1),
  ('Pautas y Rúbricas',     'pautas-rubricas',  'ClipboardList', '#8b5cf6', 2),
  ('Kick-off y Vacantes',   'kickoff-vacantes', 'Rocket',        '#a78bfa', 3),
  ('Ofertas y Compensación','ofertas-comp',     'DollarSign',    '#10b981', 4),
  ('Productividad y Métricas','prod-metricas',  'BarChart2',     '#f59e0b', 5),
  ('Tech Sourcing',         'tech-sourcing',    'Search',        '#3b82f6', 6),
  ('Capacitaciones',        'capacitaciones',   'GraduationCap', '#ec4899', 7);

-- ============================================================
-- SEED: Report templates
-- ============================================================
-- Note: created_by requires a real user UUID. Run after first admin signup.
-- INSERT INTO report_templates (role_type, display_name, sections, created_by) VALUES (...)
