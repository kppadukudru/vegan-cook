import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * One-time bootstrap: the very first signed-in account can claim the editor
 * role. Once any editor exists this becomes a no-op, so it cannot be used to
 * escalate later.
 */
export const claimFirstEditorRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // A partial unique index on user_roles (role = 'admin') makes this insert the
    // single source of truth: concurrent callers race on the DB, not on a count.
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });

    if (error) {
      // 23505 = unique_violation → an editor already exists (or this user already claimed).
      if (error.code === "23505") {
        return { ok: false, message: "An editor already exists for this site." };
      }
      throw new Error(error.message);
    }

    return { ok: true, message: "You are now the editor for this site." };
  });

