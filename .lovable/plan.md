# Weekly newsletter — 5 recipes to plan the week

## Where things stand

The subscribe form works only halfway: it validates the address and saves it to the `subscribers` table (1 address stored today). There is no template, no send job, and no unsubscribe flow, so nobody has ever received anything. The sender domain `notify.vegancook.live` is verified.

One constraint worth stating plainly: Lovable's built-in email is for one-to-one app emails — confirmations, receipts, password resets. It is not built for a newsletter sent to a whole list, and using it that way hurts deliverability. So the weekly issue goes out through a newsletter service; Lovable handles the site, the signups, the list, and composing the issue.

You said you don't have a newsletter service. Brevo has a free tier (a few hundred sends a day, no card) and connects to this app directly, so that's the recommendation. Nothing about the site work below depends on it — you can start with the manual path and connect Brevo whenever you're ready.

## 1. Site copy: weekly, not daily

- Home page subscribe block: headline and copy become a weekly plan — five recipes each week, enough to plan meals ahead.
- Replace "One email a day. Unsubscribe whenever." with weekly wording plus the send day.
- Update the post-signup success message to promise weekly, not daily.
- Sweep footer, about copy, and page metadata for any "every day"/"daily" newsletter phrasing.
- The recipe-of-the-day feature on the home page stays as-is — that's a site feature, separate from the email.

## 2. Signups that behave correctly

- `subscribers` gains `unsubscribed_at` and `source`, so removals are recorded rather than deleted.
- Signup sends one immediate confirmation email ("you're on the weekly list, first issue lands <day>"). That one is a genuine app email and uses the verified domain and existing queue.
- Public unsubscribe page that works from any newsletter footer link and marks the subscriber unsubscribed.
- Admin desk gets a Subscribers panel: count, recent signups, unsubscribes, and a CSV export — so the list is portable to any service.

## 3. Composing the weekly issue

The app picks and composes the issue either way:

- Five published recipes per ISO week, chosen deterministically, no repeats until the catalogue cycles, mixed across skill level and cuisine.
- New admin page shows the upcoming issue: the five recipes, an editable subject line, a swap control for any recipe you don't want, and the finished email rendered in Vegan Cook styling.
- A **Copy HTML** button, so you can paste the issue straight into whatever mail tool you use.

## 4. Sending it

**Start manual:** each week you open the admin page, review the five, copy, and send from your mail tool. Zero setup, works immediately.

**Then connect Brevo when ready:** signups sync to a Brevo list automatically, and the admin page gains a "Send this issue" button that pushes the composed email to your list. Brevo handles delivery, unsubscribes, and open stats. Needs a free Brevo account and its API key.

## Technical notes

- Copy changes confined to `src/routes/index.tsx`, `src/components/SiteChrome.tsx`, and route metadata.
- `newsletter.functions.ts` gains the confirmation send and weekly wording.
- Weekly picker sits beside the existing recipe-of-the-day helper so both share the catalogue query.
- Issue HTML is rendered server-side from a React Email template so the manual paste and the Brevo send are byte-identical.
- Unsubscribe route on a public path passed through by app middleware; Brevo key stored as a project secret if you connect it.

## Open question

What send day suits you — default Sunday morning IST, so the week is plannable? And should I include the Brevo hookup now, or ship the manual flow first?
