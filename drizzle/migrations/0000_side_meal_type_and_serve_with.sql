ALTER TYPE public.meal_type ADD VALUE IF NOT EXISTS 'Side';
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS serve_with text[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS recipes_serve_with_gin ON public.recipes USING gin (serve_with);