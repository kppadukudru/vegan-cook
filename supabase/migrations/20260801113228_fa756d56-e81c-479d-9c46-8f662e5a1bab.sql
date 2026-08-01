CREATE TABLE public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.subscribers TO service_role;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.submission_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.recipe_skill AS ENUM ('Beginner', 'Intermediate', 'Expert');

CREATE TABLE public.recipe_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  email TEXT NOT NULL,
  skill public.recipe_skill NOT NULL,
  time_minutes INTEGER NOT NULL,
  servings INTEGER NOT NULL,
  blurb TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  cookware TEXT NOT NULL,
  method TEXT NOT NULL,
  allergens TEXT[] NOT NULL DEFAULT '{}',
  allergen_notes TEXT,
  status public.submission_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.recipe_submissions TO service_role;
ALTER TABLE public.recipe_submissions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipe_submissions_updated_at
BEFORE UPDATE ON public.recipe_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();