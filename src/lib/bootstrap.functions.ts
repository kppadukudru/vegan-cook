import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const claimInput = z.object({
  inviteCode: z.string().trim().min(1, "Invite code is required."),
});

/**
 * One-time bootstrap: the very first signed-in account can claim the editor
 * role, but only with the configured invite code. Once any editor exists this
 * becomes a no-op, so it cannot be used to escalate later. Further editors
 * are added by an existing editor from the admin desk.
 */
export const claimFirstEditorRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => claimInput.parse(data))
  .handler(async ({ data, context }) => {
    const expected = process.env['FIRST_EDITOR_INVITE_CODE'];
    if (!expected || data.inviteCode !== expected) {
      return { ok: false as const, message: "That invite code is not valid." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // claim_first_editor takes an advisory lock and re-checks inside the
    // transaction, so concurrent callers race in the database, not in JS.
    const { data: claimed, error } = await supabaseAdmin.rpc("claim_first_editor", {
      _user_id: context.userId,
    });

    if (error) throw new Error(error.message);

    if (claimed === true) {
      return { ok: true as const, message: "You are now the editor for this site." };
    }
    return {
      ok: false as const,
      message:
        "An editor already exists for this site. Ask them to add you from the Editors tab in the admin desk.",
    };
  });
