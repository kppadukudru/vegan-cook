-- Replace helper-based admin read policies with direct, RLS-respecting lookups
DROP POLICY IF EXISTS "Admins can read all recipes" ON public.recipes;
CREATE POLICY "Admins can read all recipes"
ON public.recipes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

DROP POLICY IF EXISTS "Admins can read all journal posts" ON public.journal_posts;
CREATE POLICY "Admins can read all journal posts"
ON public.journal_posts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

-- Signed-in users no longer need (or get) EXECUTE on the SECURITY DEFINER helper
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;