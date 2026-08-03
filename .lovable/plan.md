# Weekly newsletter — 5 recipes to plan the week

## Where things stand

The subscribe form works only halfway: it validates the address and saves it to the `subscribers` table (1 address stored today). There is no template, no send job, and no unsubscribe flow, so nobody has ever received anything. The sender domain `notify.vegancook.live` is verified.

One important constraint: Lovable's built-in email is for one-to-one app emails (confirmations, receipts, password resets). It is not built for list newsletters sent to every subscriber — that needs a dedicated newsletter service, otherwise sender reputation and deliverability suffer. So the weekly send itself goes through a newsletter provider; Lovable handles the signup, the list, and the honest copy.

## 1. Site copy: weekly, not daily

- Home page subscribe block: headline and supporting copy become a weekly plan — five recipes each week, enough to plan meals ahead.
- Replace "One email a day. Unsubscribe whenever." with weekly wording plus the send day.
- Update the success message after signup so it promises weekly, not daily.
- Sweep the rest of the site (footer, about/meta copy, page descriptions) for any "every day"/"daily" newsletter phrasing and change it.
- Keep the recipe-of-the-day feature on the home page as-is — that's a site feature, separate from the email.

## 2. Signup that behaves correctly

- `subscribers` gains `unsubscribed_at` and a `source` field, so removals are recorded rather than deleted and the list stays auditable.
- Signup sends one immediate confirmation email ("you're on the weekly list, first issue lands <day>") — that one is a legitimate app email and uses the existing verified domain and queue.
- Public unsubscribe page that works from any newsletter footer link and marks the subscriber as unsubscribed.
- Admin desk gets a small Subscribers panel: count, recent signups, unsubscribes, and a CSV export.

## 3. The weekly send

Two options — pick one:

- **Provider-driven (recommended):** connect a newsletter service (Buttondown, Beehiiv, Mailchimp — whichever you prefer). Signups sync to it automatically, and each week you send the issue from there. Best deliverability, built-in list management and analytics.
- **Draft-only in Lovable:** each week the app assembles the five-recipe issue (title, blurb, time, cuisine, spice, link) as ready-to-paste HTML on an admin page. You paste it into whatever mail tool you use. No provider setup, more manual work each week.

Either way, the weekly picking logic lives in the app: five published recipes per week, deterministic per ISO week, no repeats until the catalogue cycles, and a mix of skill levels and cuisines so a week isn't five identical dishes.

## Technical notes

- Copy changes are confined to `src/routes/index.tsx`, `src/components/SiteChrome.tsx`, and page metadata.
- `newsletter.functions.ts` gains the confirmation-email send and returns weekly-worded messages.
- Weekly selection helper sits next to the existing recipe-of-the-day helper so both share the catalogue query.
- Unsubscribe route lives on a public path passed through by app middleware.
- If you choose provider sync, subscriber sync happens server-side with the provider key stored as a secret.

## Open question

Which weekly path do you want — connect a newsletter provider (and which one), or the paste-ready draft in the admin desk? And what send day suits you (default: Sunday morning IST, so the week is plannable)?
