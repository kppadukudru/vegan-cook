CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      -- Signed-in callers may only probe their own roles; privileged
      -- server-side callers (service_role / postgres) are unrestricted.
      AND (
        current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'authenticated'
        OR _user_id = auth.uid()
      )
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;