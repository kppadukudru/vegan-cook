# Vegan Cook — rebrand, daily email, and recipe submissions

## 1. Rebrand to Vegan Cook

- Replace every "Novera" reference (header, footer, detail page, page titles, meta/OG tags) with "Vegan Cook".
- New top-of-page intro block above the Recipe of the Day, with copy along the lines of: this site is for people cooking around dietary needs — allergies or a vegan lifestyle. Vegan isn't boring, and it isn't just salads.
- Tone the design toward that audience: warmer accents alongside the editorial layout, food-first framing, and headings that lead with flavour rather than gallery-speak.

## 2. Remove stale and hollow content

- Delete the Sign In button and the dead nav links (Techniques, Provisions) — nav keeps only real destinations.
- Remove the "Vol. 01 — Issue 04" footer line.
- Every recipe gets a real published date and author byline ("By Vegan Cook" for house recipes, the submitter's name for accepted submissions), shown on cards and detail pages.
- Drop the shared AI hero image. Recipes render a clean typographic card/header instead of a generic photo, so nothing implies a photo that isn't real. Real photos can be added per recipe later.

## 3. Recipe of the Day rotation

- Keep the deterministic per-day pick so the featured recipe changes daily and is stable within a day.
- Rotate across the full catalogue (not the filtered subset) so the feature doesn't jump while someone is using the filters, and show the date it's featured for.
- Note the catalogue size on the page so growth toward a year of recipes is visible.

## 4. New recipes

Add, with full ingredients, method, cookware, allergen data, author, and date:
lentil dal with rice, dosa, idli, hummus with pita, vegan pasta with a vegan sauce, vegan pancakes.

## 5. Subscribe — a vegan recipe every day by email

- Backend enabled (Lovable Cloud) with a `subscribers` table: email, confirm state, timestamps, unsubscribe token.
- Subscribe form validates the address, stores it, and shows honest confirmation copy.
- Email infrastructure set up plus a branded daily-recipe template and an unsubscribe page.
- A scheduled daily job picks that day's recipe and sends it to confirmed subscribers.
- **You'll need to connect a domain you own** before mail can actually leave — I'll open the email setup step at the right moment and tell you exactly what to do. Until it's verified, signups are stored and the daily job holds.

## 6. Submit your own recipe

- New section/page replacing the removed sign-in slot, with a full form: title, blurb, difficulty, servings, time, ingredients (repeatable rows), method steps, cookware, allergens, and submitter name/email.
- Non-vegan guard: ingredient rows are checked against a maintained list of animal-derived terms (meat, fish, dairy, egg, honey, gelatin, whey, casein, ghee, lard, and common aliases). Any hit blocks submission and names the offending ingredient. Validation runs on the client for instant feedback and again on the server so it can't be bypassed.
- Submissions save with status `pending` for your review — nothing appears publicly until approved. Approved ones publish with the submitter as author.

## Technical notes

- Fix the current CSS build error: web fonts move from an `@import` in `src/styles.css` to a `<link>` in the root route head.
- Recipe data stays in `src/data/recipes.ts` for now, extended with `author` and `publishedAt`; submissions live in the database. Migrating the whole catalogue to the database is a good follow-up once volume grows.
- Server-side work uses server functions; the submit endpoint validates with Zod and re-runs the vegan check server-side.
- Tables get row-level security: public read only for approved rows, inserts allowed for submissions, admin-only reads for pending ones and subscriber emails.
