# Add recipe metadata: cuisine, spice level, meal type, calories

## Why you can't add columns yourself

The Database panel is a read-only viewer — table structure is managed through versioned migrations so the app code and the schema never drift apart. Adding a column is a change I make for you (one approval click), not something editable in that grid.

## New fields on the recipe archive

- **Cuisine** — one per recipe, chosen from a fixed list: Indian, Middle Eastern, Japanese, Italian, Continental, Mexican, Thai, Chinese, Mediterranean, American, Other.
- **Spice level** — None, Mild, Medium, Spicy, Fiery.
- **Meal types** — multi-select (a dal is lunch *and* dinner): Breakfast, Lunch, Dinner, Snack, Dessert.
- **Calories per serving** — optional whole number.

All four are optional on existing recipes, so nothing breaks; I'll leave them blank rather than guessing values.

## Where they show up

1. **Admin editor** — new inputs in the recipe form (cuisine dropdown, spice dropdown, meal-type checkboxes, calories number field), saved with the rest.
2. **Recipe detail page** — added to the spec strip alongside Time / Skill / Serves, and folded into the recipe structured data (`recipeCuisine`, `recipeCategory`, `nutrition.calories`) so search engines pick it up.
3. **Homepage** — cuisine, spice and meal-type filters next to the existing skill and allergen filters; cards show cuisine and spice as small labels.
4. **Submission form** — readers pick cuisine, spice level, meal types and optional calories; those carry through to the published recipe when you approve a submission.

## Technical notes

- Migration: three new Postgres enums (`recipe_cuisine`, `spice_level`, `meal_type`), then `ALTER TABLE public.recipes` and `public.recipe_submissions` adding `cuisine`, `spice_level`, `meal_types` (array, default `{}`), `calories`. Existing grants and RLS policies already cover the tables, so no policy changes.
- `src/data/recipes.ts`: extend the `Recipe` type with `cuisine?`, `spiceLevel?`, `mealTypes`, `calories?` plus exported option lists.
- `src/lib/recipes.server.ts`: add columns to `RECIPE_COLUMNS` and map them in `rowToRecipe`.
- `src/lib/admin-schemas.ts`: extend `recipeInput` with the new validated fields; `src/lib/admin.server.ts` writes them in `saveRecipe` and copies them in `publishSubmission`.
- `src/lib/submissions.functions.ts` + `src/routes/submit.tsx`: new validated form fields.
- `src/routes/index.tsx`, `src/routes/recipes.$id.tsx`: filters, labels, spec cells, JSON-LD.
- Filtering stays client-side over the already-loaded published list, matching the current skill/allergen behaviour.
