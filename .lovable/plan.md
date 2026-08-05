# Add an invite code to the first editor claim

## Problem

Anyone can create an account at `/auth` and then reach `/admin`. While only the very first account can claim the editor role, that "first claim" window is still a race: if someone else signs up before the site owner does, they become the editor. The footer also advertises the `/auth` page as "Editor," making it easy to find.

## What we will do

1. **Store a secret invite code**
   - Add a project secret named `FIRST_EDITOR_INVITE_CODE` via the secure secrets form. You will choose the value so you can enter it when claiming the role.

2. **Require the code to claim the first editor role**
   - Update `src/lib/bootstrap.functions.ts` so `claimFirstEditorRole` accepts an `inviteCode` string, validates it, and compares it to `process.env['FIRST_EDITOR_INVITE_CODE']`. Only if it matches do we call the existing `claim_first_editor` database function.
   - The database-level advisory lock and re-check still prevent any remaining race.

3. **Add the invite-code field to the claim UI**
   - In `src/routes/_authenticated/admin.tsx`, add an invite-code input to the "Not an editor yet" state and pass the value into `claimRole`. Show a clear error if the code is wrong.

4. **Make the editor entry point less discoverable**
   - Rename the footer link from "Editor" to "Editor sign-in" in `src/components/SiteChrome.tsx` so it reads as an admin path rather than a feature.

## Outcome

Signing up at `/auth` still works for recipe submissions, but becoming the first editor now requires both the invite code and winning the single-admin race. After the first editor exists, additional editors are added only by existing editors from the admin desk.
