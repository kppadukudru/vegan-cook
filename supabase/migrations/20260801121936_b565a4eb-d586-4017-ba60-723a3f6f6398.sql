CREATE TYPE public.recipe_cuisine AS ENUM ('Indian','Middle Eastern','Japanese','Italian','Continental','Mexican','Thai','Chinese','Mediterranean','American','Other');
CREATE TYPE public.spice_level AS ENUM ('None','Mild','Medium','Spicy','Fiery');
CREATE TYPE public.meal_type AS ENUM ('Breakfast','Lunch','Dinner','Snack','Dessert');

ALTER TABLE public.recipes
  ADD COLUMN cuisine public.recipe_cuisine,
  ADD COLUMN spice_level public.spice_level,
  ADD COLUMN meal_types public.meal_type[] NOT NULL DEFAULT '{}',
  ADD COLUMN calories integer;

ALTER TABLE public.recipe_submissions
  ADD COLUMN cuisine public.recipe_cuisine,
  ADD COLUMN spice_level public.spice_level,
  ADD COLUMN meal_types public.meal_type[] NOT NULL DEFAULT '{}',
  ADD COLUMN calories integer;