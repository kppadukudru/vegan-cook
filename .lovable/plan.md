# Fix the admin desk sign-in

## What's wrong

Two confirmed problems, and one to verify:

1. **No editor exists.** Your account (`krishnaprasadpadukudru@gmail.com`) exists in the backend, but the roles table is empty — nobody has the editor role. So even after a successful sign-in, `/admin` would only show "you are not an editor".
2. **The one-time setup route can't rescue this.** `/auth/setup` creates a brand-new account and only then grants the editor role. Because your email is already registered, it stops with "that email already has an account" and never grants the role — a dead end by construction.
3. **Sign-in itself has never succeeded** — the account shows no sign-in ever recorded, which matches "bounced to sign-in". This needs one verification step: either the password isn't what the app expects, or the sign-in succeeds and the protected route redirects before the session is stored.

## The fix

**Make your account the editor**
- Grant the editor role to your existing account directly in the database, so `/admin` recognises you the moment you sign in.
- Teach `/auth/setup` to handle the "account already exists" case: with a valid invite code and no editor yet, promote the existing account instead of failing. It stays locked once an editor exists.

**Make sign-in reliable**
- After sign-in, wait for the session to be confirmed before navigating to `/admin`, so you can't be bounced back by a not-yet-stored session.
- Surface the real reason a sign-in fails on the page instead of a silent bounce.
- Add a "set a new password" path you can use straight from the sign-in page if the current password isn't accepted, using the reset email that already works.

**Clean up the page flicker**
- The sign-in page currently logs a hydration mismatch when you land on it via the redirect from `/admin`. Render the protected-route placeholder consistently so the redirect lands cleanly.

## Verification

- Sign in at `/auth` with your email and confirm it lands on `/admin` with the Recipes, Submissions, Journal, Pages, Newsletter and Editors tabs visible.
- Confirm the Editors tab lists your account as an editor.
- Confirm a wrong password shows an inline error rather than a bounce.

## Technical notes

- Migration: insert `('<your user id>', 'admin')` into `public.user_roles`; the existing partial unique index keeps a single editor.
- `src/lib/setup.functions.ts`: on `already been registered`, look up the user via the Auth Admin API and call `claim_first_editor` with that id.
- `src/routes/auth.index.tsx`: await `getSession()`/`onAuthStateChange` post-sign-in before `navigate`, keep error text visible.
- `src/routes/_authenticated/route.tsx`: keep the `ssr: false` gate; align the pending placeholder so the client redirect to `/auth` doesn't mismatch.
