-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service role manages roles" ON public.user_roles
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Central recipe table
CREATE TABLE public.recipes (
  id text PRIMARY KEY,
  title text NOT NULL,
  blurb text NOT NULL,
  time_minutes integer NOT NULL,
  servings integer NOT NULL,
  skill public.recipe_skill NOT NULL,
  contains text[] NOT NULL DEFAULT '{}'::text[],
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  cookware text[] NOT NULL DEFAULT '{}'::text[],
  method jsonb NOT NULL DEFAULT '[]'::jsonb,
  allergen_notes text,
  author text NOT NULL DEFAULT 'Vegan Cook',
  published_at date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  source_submission_id uuid REFERENCES public.recipe_submissions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.recipes TO anon;
GRANT SELECT ON public.recipes TO authenticated;
GRANT ALL ON public.recipes TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published recipes" ON public.recipes
  FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can read all recipes" ON public.recipes
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Service role manages recipes" ON public.recipes
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX recipes_status_idx ON public.recipes (status);

-- Track review decisions on submissions
ALTER TABLE public.recipe_submissions
  ADD COLUMN reviewed_at timestamptz,
  ADD COLUMN published_recipe_id text REFERENCES public.recipes(id) ON DELETE SET NULL,
  ADD COLUMN review_notes text;