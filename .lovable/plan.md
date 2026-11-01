# Untitled method steps and the semicolon split

## Cause of problem 2

The CSV importer. In `src/lib/csv-import.ts`, `textBlock()` turns every `;` into a line break (`.replace(/\s*;\s*/g, "\n")`). It does this for ingredients, cookware **and method**. `parseMethod` then makes each line its own step. So "Dry tofu; crisps it in..." became two steps, and the second got the generated title "Step 2". The editor and reader submissions do not touch semicolons; only the CSV path does.

## Fix for problem 2

- In `csv-import.ts`, split method text only on real line breaks (actual newlines or a literal `\n`), never on `;`. Ingredients and cookware keep the `;` shortcut, since a `;` inside one ingredient line is rare and the template already documents it.
- Update the CSV template/help wording so it says method steps go one per line (or separated by `\n`), not by `;`.
- `parseMethod` itself already splits only on line breaks, so punctuation inside a line (`;` `,` `.` `:`) cannot split a step anywhere else.

## Fix for problem 1

- **`parseMethod`** (`src/lib/recipe-format.ts`): untitled lines get `title: ""` instead of `Step n`. "Title: body" detection stays as is.
- **`methodToText`**: write untitled steps as just the body (no `: ` prefix). Titled steps stay `Title: body`.
- **Round trip check**: the editor saves through `parseMethod`, which treats each line as a step. An untitled body comes back as an untitled step, so no text is lost. One edge case: an untitled body that starts with something like `Tip: ...` would come back titled "Tip". To prevent that, `methodToText` will escape that case by writing a leading `: ` marker is not ideal; instead, `parseMethod` will treat a line starting with `: ` as an explicitly untitled body, and `methodToText` adds that marker only when an untitled body would otherwise look like `Title: body`. Normal untitled steps look clean.
- **Recipe page** (`src/routes/recipes.$id.tsx`): render the step `h3` only when `title.trim()` is not empty. Without a title, the body sits at the top of the cell, level with the step number.
- **JSON-LD**: include `name` only when the title is not empty.

## Other places that use step titles (checked)

- Weekly newsletter (`weekly-issue.tsx`, `newsletter.server.ts`): uses only recipe titles, not step titles. Nothing to change.
- Vegan-check calls split the raw method text, not the step titles. Unchanged.
- Admin editor (`_authenticated/admin.tsx`) only uses `methodToText`; covered above.
- Reader submissions store raw text; parsing happens at publish via `parseMethod`. Covered.

## What changes for existing data

Nothing. Recipes already saved with "Step 1"-style titles keep them; they will only disappear if you edit and re-save (or I can strip them later in a separate, explicit step if you want). I will not touch vegetable-stir-fry.

## Files touched

- `src/lib/csv-import.ts`
- `src/lib/recipe-format.ts`
- `src/routes/recipes.$id.tsx`
- A small test file for `parseMethod`/`methodToText` (no semicolon split, empty titles, round trip without text loss). This needs vitest added as a dev tool; say if you would rather skip it.

## Things you may have missed

- Old "Step n" titles already in the database stay visible until re-saved.
- Multi-line paragraphs inside one step still become separate steps (both in the editor and CSV), because a line break is the step separator. That is existing behaviour and unchanged.
