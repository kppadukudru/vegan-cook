ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS image_alt text;

ALTER TABLE public.recipe_submissions
  ADD COLUMN IF NOT EXISTS image_url text;