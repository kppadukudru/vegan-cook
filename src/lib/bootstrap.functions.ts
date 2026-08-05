import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * One-time bootstrap: the very first signed-in account can claim the editor
 * role. Once any editor exists this becomes a no-op, so it cannot be used to
 * escalate later. Further editors are added by an existing editor from the
 * admin desk.
 */
export const claimFirstEditorRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // claim_first_editor takes an advisory lock and re-checks inside the
    // transaction, so concurrent callers race in the database, not in JS.
    const { data, error } = await supabaseAdmin.rpc("claim_first_editor", {
      _user_id: context.userId,
    });

    if (error) throw new Error(error.message);

    if (data === true) {
      return { ok: true, message: "You are now the editor for this site." };
    }
    return {
      ok: false,
      message:
        "An editor already exists for this site. Ask them to add you from the Editors tab in the admin desk.",
    };
  });
