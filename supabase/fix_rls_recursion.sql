-- Create an RLS-bypassing function to check for admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Drop the old recursive policies
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "subscriptions_select_admin" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_all_admin" ON public.subscriptions;
DROP POLICY IF EXISTS "uploads_all_admin" ON public.uploads;
DROP POLICY IF EXISTS "reports_all_admin" ON public.reports;
DROP POLICY IF EXISTS "contact_messages_all_admin" ON public.contact_messages;
DROP POLICY IF EXISTS "notifications_insert_admin" ON public.notifications;

-- Recreate policies using the new function to avoid infinite recursion
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "subscriptions_select_admin" ON public.subscriptions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "subscriptions_all_admin" ON public.subscriptions
  FOR ALL USING (public.is_admin());

CREATE POLICY "uploads_all_admin" ON public.uploads
  FOR ALL USING (public.is_admin());

CREATE POLICY "reports_all_admin" ON public.reports
  FOR ALL USING (public.is_admin());

CREATE POLICY "contact_messages_all_admin" ON public.contact_messages
  FOR ALL USING (public.is_admin());

CREATE POLICY "notifications_insert_own" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_insert_admin" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());
