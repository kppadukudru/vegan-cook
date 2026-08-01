# Optional recipe images

Right now the recipe table has no image field at all, so no recipe can carry a photo. Adding one is easy and fully optional — every existing recipe keeps working with no image.

## What you'd get

- An optional photo per recipe. Blank is fine; pages fall back to the current text-only layout.
- In the admin editor: upload an image file (or paste a URL), see a preview, remove it again.
- Optional short alt text field for accessibility/SEO.
- CSV import: an optional `image_url` column, ignored when empty.
- Where it shows: Recipe of the Day hero on the homepage, recipe cards in the collection grid, and the top of the recipe detail page.
- SEO bonus: the image is added to the recipe's structured data and to its social preview tags (og:image / twitter:image) when present.
- Reader submissions stay text-only for now (no public uploads), unless you want that too.

## Technical notes

- Migration: add `image_url text null` and `image_alt text null` to `public.recipes` (and the same optional pair on `recipe_submissions` only if reader uploads are wanted later). No backfill, no NOT NULL.
- Storage: create a public `recipe-images` bucket; policies allow public read, writes restricted to the admin role. Admin uploads go through an authenticated server function that verifies the admin role before uploading, then stores the resulting public URL in `image_url`.
- Types/mapping: extend `Recipe` in `src/data/recipes.ts` with optional `imageUrl` / `imageAlt`; add both columns to `RECIPE_COLUMNS` and `rowToRecipe` in `src/lib/recipes.server.ts`; add optional fields to `recipeInput` in `src/lib/admin-schemas.ts` and persist in `src/lib/admin.server.ts`.
- UI: image block in `src/routes/_authenticated/admin.tsx`; conditional `<img>` (lazy-loaded, fixed aspect ratio) in `src/routes/index.tsx` hero + cards and `src/routes/recipes.$id.tsx`; add `image` to the existing Recipe JSON-LD and leaf `head()` OG tags.
- CSV: add `image_url` to optional columns in `src/lib/csv-import.ts` and the template.
