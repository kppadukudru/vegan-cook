# Vegan Cook

A plant-based recipe website with rigorous, per-recipe allergen labelling,
built for people who cook vegan for any reason: an allergy, an ethical or
environmental choice, or cooking for someone they love who is vegan.

**Live site:** https://vegancook.live

## What it does

- **A recipe for every day.** The landing page features a rotating recipe of
  the day, drawn from the full catalogue.
- **Filter by what you can eat.** Every recipe is tagged by cooking skill
  (Beginner, Intermediate, Expert), cuisine, meal type, and spice level, and
  declares which of five tracked allergens it contains: sulphite, peanut, soy,
  gluten, and tree nuts. You can screen the collection down to exactly what is
  safe for you.
- **Recipes written to actually cook from.** Each recipe carries structured
  ingredients, step-by-step method with technique notes, required cookware,
  and honest allergen notes for edge cases like shared equipment.
- **A journal.** Longer essays on eating plant-based: reading labels with a
  dairy allergy, which cooking oil suits which dish, which rice for which
  dish, the honest nutritional trade-offs of a vegan diet, and travel notes.
- **Community submissions.** Visitors can submit their own recipes, which are
  screened and reviewed by an editor before being published.
- **A weekly newsletter.** Subscribers receive a weekly issue of recipes,
  sent through an automated, idempotent email pipeline.

## How it's built

- **Framework:** TanStack Start (React + TypeScript), server-rendered.
- **Database & auth:** Supabase (Postgres), with
