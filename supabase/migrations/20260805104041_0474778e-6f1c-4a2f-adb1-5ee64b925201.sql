DROP INDEX IF EXISTS public.user_roles_single_admin_idx;

CREATE OR REPLACE FUNCTION public.claim_first_editor(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(7700000000000002);
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_first_editor(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_first_editor(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.claim_first_editor(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_first_editor(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.user_id_for_email(_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM auth.users WHERE lower(email) = lower(trim(_email)) LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.user_id_for_email(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.user_id_for_email(text) FROM anon;
REVOKE ALL ON FUNCTION public.user_id_for_email(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.user_id_for_email(text) TO service_role;

CREATE OR REPLACE FUNCTION public.list_editors()
RETURNS TABLE(user_id uuid, email text, granted_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.user_id, u.email::text, ur.created_at
  FROM public.user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  WHERE ur.role = 'admin'
  ORDER BY ur.created_at ASC;
$$;

REVOKE ALL ON FUNCTION public.list_editors() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_editors() FROM anon;
REVOKE ALL ON FUNCTION public.list_editors() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.list_editors() TO service_role;