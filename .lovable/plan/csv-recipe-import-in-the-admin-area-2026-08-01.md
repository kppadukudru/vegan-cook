# CSV recipe import in the admin area

Yes — I'll add a CSV importer to the admin page so you can bulk-load recipes instead of typing them one at a time.

## How it will work

1. A new **Import CSV** tab sits beside Recipes and Submissions.
2. You upload a `.csv` file (or paste CSV text).
3. A **Download template** link gives you a ready-made CSV with the correct column headers and one example row.
4. The importer shows a preview table: how many rows parsed, which rows have problems (missing title, bad numbers, unknown cuisine/spice/meal type), and which rows contain non-vegan ingredients — those are blocked, same rule as reader submissions.
5. Rows that reuse an existing recipe address are flagged as "will update" rather than silently duplicating.
6. Press **Import**. Everything lands as **drafts** by default, so nothing goes live until you publish it from the Recipes tab. A checkbox lets you publish straight away when you want.
7. You get a per-row result summary (imported / updated / skipped with reason).

## CSV columns

Required: `title`, `blurb`, `time_minutes`, `servings`, `skill`, `ingredients`, `method`

Optional: `id`, `cookware`, `contains`, `allergen_notes`, `author`, `published_at`, `cuisine`, `spice_level`, `meal_types`, `calories`, `status`

- `ingredients` and `method` accept the same free text the editor accepts; use `\n` or a `;` between lines and it gets parsed into the site's standard format.
- `contains` and `meal_types` are comma-separated inside the cell (e.g. `Breakfast, Lunch`).
- Missing `skill` defaults to Beginner; missing `published_at` defaults to today; missing `author` defaults to Vegan Cook.

## Technical notes

- Parse client-side with a small CSV parser (`papaparse`) to build the preview; no file ever uploads to storage.
- New server function `adminImportRecipes` in `src/lib/admin.functions.ts`, admin-gated with `requireSupabaseAuth` + `assertAdmin`, taking an array of rows (cap ~500 per import).
- Validation reuses `recipeInput` from `src/lib/admin-schemas.ts`, the parsers in `src/lib/recipe-format.ts` (`parseIngredients`, `parseMethod`, `parseList`, `normalizeAllergens`, `slugify`), and `findNonVeganTerms` from `src/lib/vegan-check.ts`.
- New `importRecipes` helper in `src/lib/admin.server.ts` upserting into `recipes` on `id`, defaulting `status` to `draft`, returning a per-row result array.
- UI lives in a new `src/components/admin/CsvImport.tsx` wired into the tab switcher in `src/routes/_authenticated/admin.tsx`; no schema changes needed — the metadata columns already exist.
