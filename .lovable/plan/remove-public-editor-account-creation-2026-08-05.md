# Remove public editor account creation

The "Create an editor account" toggle on `/auth` is misleading: signing up there does not grant editor access. This plan removes public account creation and replaces it with an invitation-only editor flow.

## What we will change

1. **Make `/auth` sign-in only**
   - Remove the sign-up / sign-in toggle.
   - Keep the page as the editor sign-in surface.
   - Add a "Forgot password?" link so editors can reset their passwords.

2. **One-time first-editor bootstrap at `/auth/setup`**
   - A hidden route reachable only while no editor exists.
   - Requires the existing `FIRST_EDITOR_INVITE_CODE` secret.
   - Creates the account, signs the user in, and claims the first editor role in one flow.
   - After the first editor exists, the route redirects to `/auth`.

3. **Editor invitation flow in the admin desk**
   - Replace the current "Make editor" form with an "Invite editor" form.
   - If the email already has an account, grant the editor role and notify them.
   - If the email has no account, create it via the Supabase Auth admin API (`createUser` with `email_confirm: true` and a random temporary password), grant the editor role, and send an invitation email with a password-reset link.
   - Update the copy in `EditorsAdmin` so it no longer tells people to sign up at `/auth` first.

4. **Email template**
   - Add an `editor_invite` transactional email template explaining that the recipient has been invited as an editor and including a link to set their password.

5. **Password reset flow**
   - Add a `/auth/reset-password` route that handles Supabase recovery links and lets the user set a new password.
   - Update the sign-in form with a "Forgot password?" link that calls `resetPasswordForEmail`.

## Result

- No public account creation on `/auth`.
- Editors are created only by existing editors or through the one-time invite-code setup.
- Invited editors receive an email and can set their own password before signing in.
