-- ============================================================
-- PlacementPrep.co.uk — Supabase Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS PROFILE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users_profile (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name       TEXT,
  university      TEXT,
  degree          TEXT,
  graduation_year INTEGER,
  target_roles    TEXT[],
  target_sectors  TEXT[],
  skills          TEXT[],
  linkedin_url    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CV VERSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cv_versions (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  version_name TEXT NOT NULL,
  file_url     TEXT,
  notes        TEXT,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.applications (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name     TEXT NOT NULL,
  role_title       TEXT NOT NULL,
  sector           TEXT,
  location         TEXT,
  application_date DATE,
  deadline         DATE,
  status           TEXT NOT NULL DEFAULT 'Saved' CHECK (
    status IN (
      'Saved', 'Applied', 'Online Assessment', 'Interview',
      'Assessment Centre', 'Offer', 'Rejected', 'Withdrawn', 'Ghosted'
    )
  ),
  source           TEXT,
  cv_version_id    UUID REFERENCES public.cv_versions(id) ON DELETE SET NULL,
  job_url          TEXT,
  salary_range     TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- APPLICATION EVENTS (timeline / stage history)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.application_events (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type     TEXT NOT NULL CHECK (
    event_type IN (
      'Saved', 'Applied', 'Online Assessment', 'Interview',
      'Assessment Centre', 'Offer', 'Rejected', 'Withdrawn', 'Ghosted',
      'Note Added', 'Deadline Set'
    )
  ),
  event_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI INSIGHTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  summary      TEXT,
  strengths    TEXT[],
  weaknesses   TEXT[],
  next_steps   TEXT[],
  raw_data     JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_profile_updated_at
  BEFORE UPDATE ON public.users_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.users_profile      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_versions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights        ENABLE ROW LEVEL SECURITY;

-- users_profile policies
CREATE POLICY "Users can view own profile"
  ON public.users_profile FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile"
  ON public.users_profile FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile"
  ON public.users_profile FOR UPDATE USING (auth.uid() = user_id);

-- cv_versions policies
CREATE POLICY "Users can manage own CV versions"
  ON public.cv_versions FOR ALL USING (auth.uid() = user_id);

-- applications policies
CREATE POLICY "Users can manage own applications"
  ON public.applications FOR ALL USING (auth.uid() = user_id);

-- application_events policies
CREATE POLICY "Users can manage own application events"
  ON public.application_events FOR ALL USING (auth.uid() = user_id);

-- ai_insights policies
CREATE POLICY "Users can manage own insights"
  ON public.ai_insights FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profile (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status  ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_application_events_application_id ON public.application_events(application_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id  ON public.ai_insights(user_id);
