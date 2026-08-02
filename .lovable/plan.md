# Editor access, cuisine filter, and a Journal

## 1. How you log in and manage the site (no build needed — just steps)

Your editing desk already exists:

1. Go to `/auth` on your site (it's intentionally unlinked and hidden from search engines).
2. Create an account with your email and password, then sign in.
3. On first sign-in you'll see a "Claim editor role" button. No editor exists yet, so the first account to click it becomes the site editor — and the button stops working for anyone afterwards. Click it.
4. You land on `/admin`, where you can add and edit recipes, review reader submissions, and bulk-import CSVs.

I'll also add a small discreet "Editor" link in the site footer so you don't have to remember the URL.

## 2. Cuisine filter

The cuisine chips already exist on the homepage, but they sit below the allergen block, so they're easy to miss. I'll restructure the filter area so all five filters (Skill, Cuisine, Spice, Meal, Avoid allergens) read as one clear panel: a compact label + chip row per filter, allergens last, plus an active-filter summary line with a "Clear all" control so you can always see what's applied.

## 3. Journal — your writing space

A new writing section, authored from the same admin desk.

Pages:
- `/journal` — index of published posts, newest first, filterable by topic tag, each with title, date, tag, excerpt and optional cover image.
- `/journal/<slug>` — the post page: cover image, title, date, reading time, and your body text rendered with proper headings, paragraphs, lists, quotes and links.
- Header/footer navigation gains a "Journal" link.

Post fields: title, slug, tag (Travel, Allergies, Alternatives, Essay), excerpt, cover image URL + alt, body, published date, status (draft/published).

Authoring: a new "Journal" tab in `/admin` with a list of posts and an editor form — write, save as draft, preview, publish, unpublish, delete. Body is written in Markdown (headings, bold, lists, links) so long pieces stay readable.

To seed it, I'll create three starter posts as **drafts** matching the topics you mentioned, with structure and headings in place for you to fill in with your own words:
- Ordering vegan in Venice, Milan and Verona
- Eating vegan in India — what's naturally plant-based and what to watch for
- Dairy allergy: what to avoid, and oat vs almond vs soy milk compared

## 4. About me

A `/about` page: who you are, why the site exists, how recipes are checked, and a link to the Journal. I'll write a first draft in the site's voice for you to edit later — text only, no dummy photo.

## Technical notes

- New `journal_posts` table (title, slug, tag, excerpt, body, cover_url, cover_alt, published_at, status) with the same access pattern as `recipes`: anyone can read published posts, editors manage everything, plus GRANTs and an `updated_at` trigger.
- Public reads via a server function using the publishable key (same shape as `listPublishedRecipes`); admin reads/writes go through `admin.functions.ts` guarded by the existing `has_role` check.
- Markdown rendered with `react-markdown` + `remark-gfm`, styled with the existing editorial type scale (no default prose theme).
- SEO per page: unique `head()` on `/journal`, `/journal/$slug` and `/about`, canonical links, `BlogPosting` JSON-LD on post pages, and journal URLs added to `sitemap.xml`.
- Homepage filter work stays in `src/routes/index.tsx` presentation only — no change to filtering logic or data.
