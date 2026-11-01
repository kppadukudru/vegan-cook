# "Side" meal type and "Serve with" links

## 1. Side meal type

**Migration:** `ALTER TYPE public.meal_type ADD VALUE IF NOT EXISTS 'Side';` (additive, no existing rows touched).

**Definition of a Side recipe:** a recipe whose meal types include Side. A recipe tagged "Side, Lunch" still counts as Side and is left out of the main picks. Tell me if you'd prefer "Side only" to be the rule.

**Surfaces**
- One shared list (`ALL_MEAL_TYPES`, the `MealType` type, zod `mealTypeEnum`) gets `Side`. That one list drives the admin editor checkboxes, the CSV importer's matching, the reader submission form, the recipes page filter chips and URL parsing (`?meal=Side`), and the gluten-free page's meal chips. The zod `.max(5)` on mealTypes becomes `.max(ALL_MEAL_TYPES.length)` in admin and submission schemas, so a recipe can carry all six.
- Recipe cards and the detail page already join `mealTypes`, so Side shows up with no extra work. The JSON-LD `recipeCategory` picks it up too.
- Counts: every count on the site is already a live `.length` over loaded recipes, and none are hardcoded. I'll keep it that way.
- Recipe of the day: `pickRecipeOfTheDay` filters out Side recipes before it rotates. If every recipe is a Side, it falls back to the full list so the homepage never shows an empty slot.
- Newsletter: `pickWeeklyRecipes` filters out Side recipes the same way, before picking 5. The idempotency and claim logic stays untouched.
- The breakfast page is unaffected because it already filters on Breakfast.

## 2. "Serve with" links

**Data model (recommended): a `serve_with text[]` column on `recipes`**, default `'{}'`, NOT NULL. Also on `recipe_submissions`? No, readers won't set links.
Why an array over a join table:
- It's small (a handful of ids), only ever read with its parent recipe, and edited as one list in one form, so it's one column in the existing select and upsert.
- It inherits the existing RLS and grants (admin/service-role writes, public reads of published rows) with no new table, policies or grants to get wrong.
- The trade-off is that there's no foreign-key integrity. That's handled on read (unknown or draft ids are skipped) and on write (ids are validated against existing recipes). A join table becomes worth it only if links need their own data (order labels, notes) or heavy reverse queries at scale. Neither applies here.

Validation on save: trim, lowercase, dedupe, drop the recipe's own id, at most 8 entries, each ≤ 80 chars. Unknown ids are rejected with a clear error in the editor and reported per row in CSV.

**Both directions (recommended: yes, computed at read time, never stored twice).**
The detail page shows the union of:
- forward links: this recipe's `serve_with`
- reverse links: published recipes whose `serve_with` contains this id (`.contains('serve_with', [id])`)

So linking idli → sambar makes sambar show "Serve with: Steamed Idli" with nothing to keep in sync. Forward links come first in the editor's order, then reverse links by title. Optional: a GIN index on `serve_with` for the reverse lookup (cheap, additive).

**Detail page:** the public server function `getPublishedRecipe` also returns `serveWith: {id, title, imageUrl?}[]`. It's resolved with the existing publishable client and `status = 'published'`, so drafts and missing ids silently drop out. A small "Serve with" block sits after the method and links to `/recipes/$id`. It's hidden when the list is empty.

**Admin editor:** a searchable multi-select over all recipes the admin list already loads (drafts included, labelled "draft"). Typing filters by title, a click adds a chip, and × removes it. It's built from the existing shadcn Command/Popover primitives, so no new package. A read-only line beneath it shows "Also linked from: …" (the reverse links) so editors understand the two-way display.

**CSV importer:** a new optional `serve_with` column holding comma-separated recipe ids (e.g. `sambar, coconut-chutney`). Ids may point at existing recipes or at other rows in the same file. Anything else is flagged in the preview as an error for that row. The template and example row are updated.

## Security / constraints
- Writes still go only through `saveRecipe` / `adminImportRecipes`, behind `requireSupabaseAuth` + `assertAdmin`. RLS stays unchanged.
- Public reads stay on `status = 'published'`, including the reverse-link query.
- The vegan check, the existing recipe rows and the idempotency logic stay unchanged. No new services or packages.

## Things you may have missed
- **Existing accompaniments won't be tagged Side automatically.** Per your "don't change data" rule, sambar, chutneys, palya and rasam need tagging by you, in the editor or by re-importing a CSV. I can list the likely candidates by title for you to confirm.
- **Recipes page filters:** Side shows as a chip. Should "All" also hide Sides by default? I'd keep it showing everything.
- **Collection pages:** the gluten-free page will list Sides alongside mains. That's fine as-is, I think.
- **Sitemap and SEO:** no changes needed. The serve-with links add useful internal links.
- **Submissions:** readers can pick Side but can't set serve-with links. An editor adds those after approval.

## Tests (new, vitest)
- `pickRecipeOfTheDay` never returns a Side recipe when non-Sides exist, and falls back when only Sides exist.
- `pickWeeklyRecipes` returns 5 non-Side recipes.
- serve-with resolution drops draft and unknown ids, and includes reverse links.
- CSV parse accepts `Side` and parses `serve_with`, flagging unknown ids.

## Technical details: files touched
- Migration: enum value, `recipes.serve_with text[] not null default '{}'`, GIN index.
- `src/data/recipes.ts`: Side, `serveWith: string[]`, Side-aware `pickRecipeOfTheDay`, `isSide` helper.
- `src/lib/newsletter.ts`: filter in `pickWeeklyRecipes`.
- `src/lib/admin-schemas.ts`, `src/lib/submissions.functions.ts`: enum and max.
- `src/lib/recipes.server.ts`: column and mapping, plus a `resolveServeWith` helper.
- `src/lib/recipes.functions.ts`: `getPublishedRecipe` returns `serveWith`.
- `src/lib/admin.server.ts`: validate and write `serve_with` in `saveRecipe` and `importRecipes`.
- `src/lib/csv-import.ts`, `src/components/admin/CsvImport.tsx`: new column, template, preview errors.
- `src/routes/_authenticated/admin.tsx`, plus new `src/components/admin/RecipeMultiSelect.tsx`.
- `src/routes/recipes.$id.tsx`: "Serve with" section.
- Picked up automatically: `RecipeFilters.tsx`, `recipes.index.tsx`, `submit.tsx`, `gluten-free-vegan-recipes.tsx`, `RecipeCard.tsx`.
