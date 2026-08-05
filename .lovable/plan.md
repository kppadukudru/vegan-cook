# Trim the home page collection, add a full Recipes page

## Problem

The home page renders every published recipe (44 today) in one grid. That is a long scroll now and gets worse as the catalogue grows. There is currently no `/recipes` listing page — only `/recipes/{id}` detail pages — and the header "Recipes" link is just an anchor to the home grid.

## What changes

**Home page (`/`)**
- Keep "Recipe of the day" and the filter panel as they are.
- The collection section shows only the first 6 matching recipes.
- Below the grid: a line like "Showing 6 of 44" plus a "See the whole collection" button linking to `/recipes`, carrying the current filters through as URL search params so the bigger page opens pre-filtered.
- If filters narrow results to 6 or fewer, the button becomes a quieter "Browse all 44 recipes" link instead of a truncation notice.

**New Recipes page (`/recipes`)**
- Full filterable archive: the same skill / cuisine / meal / spice / allergen controls, reusing the same recipe card markup and site header/footer.
- Reads filters from the URL on load so the home-page handoff works, and updates the URL as filters change.
- Paginated in batches of 24 with a "Load more" button, so the page stays manageable at any catalogue size.
- Its own SEO head: unique title, description, og/twitter tags, canonical to `https://www.vegancook.live/recipes`, and ItemList structured data.

**Wiring**
- Header and mobile nav "Recipes" links point to `/recipes` instead of the `#archive` anchor.
- Footer gets a "Recipes" link.
- `/recipes` added to the sitemap.

## Technical notes

- New route file `src/routes/recipes.index.tsx` (sits alongside the existing `src/routes/recipes.$id.tsx`; no layout route needed), loading via the existing `listPublishedRecipes` server function.
- Extract the recipe card into `src/components/RecipeCard.tsx` and the filter controls into `src/components/RecipeFilters.tsx` so the home page and the new page share one implementation instead of duplicating the grid markup.
- Filter state on `/recipes` uses TanStack Router `validateSearch` with a Zod schema (skill, cuisine, meal, spice, avoid[]), keeping filters shareable and SSR-safe.
- No database or server-function changes; this is presentation only.
