# Daily recipe email — make the subscribe feature real

## Honest answer first

Half of it works. The subscribe form on the home page validates the address and saves it to the `subscribers` table (1 address is stored today). Nothing else exists: there is no email template, no send route, no daily schedule, and no unsubscribe flow. So no subscriber has ever received a recipe.

The good news: the sender domain `notify.vegancook.live` is verified, and the email queue infrastructure is already installed. Only the recipe-email layer is missing.

## What to build

1. **Daily recipe email template** — a branded Vegan Cook email: recipe title, blurb, image (when the recipe has one), time/servings/skill/cuisine/spice, ingredients, method steps, cookware, allergen notes, and a link to the recipe page on the site. Plus a footer with a one-click unsubscribe link.

2. **Send route** — an internal endpoint that picks the day's featured recipe (the same deterministic daily pick the home page uses, restricted to published recipes) and enqueues one email per active subscriber, using a per-day idempotency key so a re-run never double-sends.

3. **Daily schedule** — a scheduled job that calls the send route once a day at a fixed time. Confirm the send hour (default: 07:00 IST).

4. **Subscriber lifecycle** — add unsubscribe state and an unsubscribe timestamp to `subscribers`, skip unsubscribed and suppressed (bounced/complained) addresses, and add a public unsubscribe page that confirms removal.

5. **Confirmation email on signup** (recommended) — a short "you're subscribed" email so a new signup gets immediate proof it worked, instead of waiting up to 24 hours.

6. **Admin visibility** — a small panel in the admin desk showing subscriber count and the last few sends with their status, so delivery problems are visible without digging.

## Technical notes

- `subscribers` gains `unsubscribed_at` (nullable) and keeps RLS service-role-only; the unsubscribe page resolves a token rather than exposing emails.
- Template registered in the email template registry; send route enqueues through the existing queue so retries, rate limits, and suppression all apply.
- Idempotency key shaped `daily-recipe-<YYYY-MM-DD>-<email>`.
- Daily pick reuses the existing recipe-of-the-day helper so the email and the site always agree.
- Unsubscribe route lives on a public path that the app middleware passes through untouched.

## Open question

Confirm the daily send time (defaulting to 07:00 IST) and whether you want the signup confirmation email included.
