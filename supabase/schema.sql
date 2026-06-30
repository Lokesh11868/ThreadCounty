-- ============================================================
-- Thread County – Supabase Database Schema
-- Run this in the Supabase SQL editor (Project → SQL Editor → New Query)
-- ============================================================

-- ─────────────────────────────────────────────
-- 0. Extensions
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. UTILITY FUNCTIONS
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ─────────────────────────────────────────────
-- 2. PROFILES
-- Extends auth.users with application-specific fields
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_banned     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: Users read & update their own; admins read all
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (
    public.is_admin()
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (
    public.is_admin()
  );

-- ─────────────────────────────────────────────
-- 2. SUBSCRIPTIONS
-- One subscription record per user
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan                  TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'student', 'professional', 'enterprise')),
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  uploads_used          INTEGER NOT NULL DEFAULT 0,
  uploads_limit         INTEGER NOT NULL DEFAULT 5,
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  expires_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_select_admin" ON public.subscriptions
  FOR SELECT USING (
    public.is_admin()
  );

CREATE POLICY "subscriptions_all_admin" ON public.subscriptions
  FOR ALL USING (
    public.is_admin()
  );

-- ─────────────────────────────────────────────
-- 3. UPLOADS
-- Fabric image upload records
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uploads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url        TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  file_size       BIGINT,
  file_type       TEXT,
  thumbnail_url   TEXT,
  storage_path    TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_status  ON public.uploads(status);
CREATE INDEX IF NOT EXISTS idx_uploads_created ON public.uploads(created_at DESC);

ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uploads_select_own" ON public.uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "uploads_insert_own" ON public.uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "uploads_update_own" ON public.uploads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "uploads_delete_own" ON public.uploads
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "uploads_all_admin" ON public.uploads
  FOR ALL USING (
    public.is_admin()
  );

-- ─────────────────────────────────────────────
-- 4. REPORTS
-- AI-generated fabric analysis reports
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_id           UUID NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url           TEXT,
  thread_density      NUMERIC,
  warp_count          NUMERIC,
  weft_count          NUMERIC,
  fabric_type         TEXT,
  weave_pattern       TEXT,
  confidence_score    NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
  quality_grade       TEXT CHECK (quality_grade IN ('A+', 'A', 'B+', 'B', 'C', 'D')),
  ai_suggestions      TEXT,
  detailed_analysis   TEXT,
  ocr_text            TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id   ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_upload_id ON public.reports(upload_id);
CREATE INDEX IF NOT EXISTS idx_reports_created   ON public.reports(created_at DESC);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select_own" ON public.reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reports_insert_own" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reports_delete_own" ON public.reports
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "reports_all_admin" ON public.reports
  FOR ALL USING (
    public.is_admin()
  );

-- ─────────────────────────────────────────────
-- 5. CONTACT_MESSAGES
-- Public contact form submissions
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status  ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON public.contact_messages(created_at DESC);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can submit a contact message
CREATE POLICY "contact_messages_insert_public" ON public.contact_messages
  FOR INSERT WITH CHECK (TRUE);

-- Authenticated users can read their own messages
CREATE POLICY "contact_messages_select_own" ON public.contact_messages
  FOR SELECT USING (auth.uid() = user_id);

-- Admins have full access
CREATE POLICY "contact_messages_all_admin" ON public.contact_messages
  FOR ALL USING (
    public.is_admin()
  );

-- ─────────────────────────────────────────────
-- 6. NOTIFICATIONS
-- Per-user notification records
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  link        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_own" ON public.notifications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "notifications_insert_admin" ON public.notifications
  FOR INSERT WITH CHECK (
    public.is_admin()
  );

-- ─────────────────────────────────────────────
-- 7. FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────────

-- Auto-update updated_at on any table row change
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_uploads_updated_at
  BEFORE UPDATE ON public.uploads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile + free subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  );

  -- Create free subscription
  INSERT INTO public.subscriptions (user_id, plan, status, uploads_used, uploads_limit)
  VALUES (NEW.id, 'free', 'active', 0, 5);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- 8. STORAGE BUCKETS
-- Run separately in Supabase dashboard > Storage
-- or via Supabase CLI
-- ─────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('fabric-uploads', 'fabric-uploads', TRUE);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', TRUE);

-- Storage RLS for fabric-uploads bucket
-- CREATE POLICY "fabric_upload_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fabric-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "fabric_upload_select" ON storage.objects FOR SELECT USING (bucket_id = 'fabric-uploads');
-- CREATE POLICY "fabric_upload_delete" ON storage.objects FOR DELETE USING (bucket_id = 'fabric-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage RLS for avatars bucket
-- CREATE POLICY "avatar_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "avatar_select" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "avatar_update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- ============================================================
-- Thread County – Blog & Community Forum Schema Additions
-- Please execute this in your Supabase SQL Editor.
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. BLOG POSTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  content         TEXT NOT NULL,
  thumbnail_url   TEXT,
  published       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published blogs
CREATE POLICY "blog_posts_select_public" ON public.blog_posts
  FOR SELECT USING (published = TRUE OR public.is_admin());

-- Only admins can insert/update/delete blogs
CREATE POLICY "blog_posts_insert_admin" ON public.blog_posts
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "blog_posts_update_admin" ON public.blog_posts
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "blog_posts_delete_admin" ON public.blog_posts
  FOR DELETE USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 2. FORUM TOPICS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.forum_topics (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'general',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;

-- Anyone logged in can read topics
CREATE POLICY "forum_topics_select_auth" ON public.forum_topics
  FOR SELECT USING (auth.role() = 'authenticated');

-- Anyone logged in can insert topics
CREATE POLICY "forum_topics_insert_auth" ON public.forum_topics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Author or Admin can update/delete
CREATE POLICY "forum_topics_update_auth" ON public.forum_topics
  FOR UPDATE USING (auth.uid() = author_id OR public.is_admin());
CREATE POLICY "forum_topics_delete_auth" ON public.forum_topics
  FOR DELETE USING (auth.uid() = author_id OR public.is_admin());


-- ─────────────────────────────────────────────
-- 3. FORUM REPLIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id        UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- Anyone logged in can read replies
CREATE POLICY "forum_replies_select_auth" ON public.forum_replies
  FOR SELECT USING (auth.role() = 'authenticated');

-- Anyone logged in can insert replies
CREATE POLICY "forum_replies_insert_auth" ON public.forum_replies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Author or Admin can update/delete
CREATE POLICY "forum_replies_update_auth" ON public.forum_replies
  FOR UPDATE USING (auth.uid() = author_id OR public.is_admin());
CREATE POLICY "forum_replies_delete_auth" ON public.forum_replies
  FOR DELETE USING (auth.uid() = author_id OR public.is_admin());
