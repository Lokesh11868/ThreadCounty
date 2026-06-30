-- ============================================================
-- Thread County – Supabase Functions & RPC
-- Run this AFTER schema.sql
-- ============================================================

-- ─────────────────────────────────────────────
-- increment_upload_usage
-- Safely increments uploads_used for a user.
-- Called after each successful upload.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_upload_usage(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.subscriptions
  SET
    uploads_used = uploads_used + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

-- Grant execute to authenticated users (they can only increment their own via security definer)
GRANT EXECUTE ON FUNCTION public.increment_upload_usage(UUID) TO authenticated;

-- ─────────────────────────────────────────────
-- get_platform_stats
-- Returns admin-level aggregate stats in a single call.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Check caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT json_build_object(
    'total_users',    (SELECT COUNT(*) FROM public.profiles),
    'total_uploads',  (SELECT COUNT(*) FROM public.uploads),
    'total_reports',  (SELECT COUNT(*) FROM public.reports),
    'pending_uploads',(SELECT COUNT(*) FROM public.uploads WHERE status IN ('pending', 'analyzing')),
    'new_messages',   (SELECT COUNT(*) FROM public.contact_messages WHERE status = 'new')
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO authenticated;
