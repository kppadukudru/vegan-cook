import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "@/lib/admin-schemas";

const emailInput = z.object({ email: z.string().trim().email().max(200) });
const userIdInput = z.object({ userId: z.string().uuid() });

export interface EditorRow {
  userId: string;
  email: string;
  grantedAt: string;
}

/** Everyone who currently holds the editor role. */
export const adminListEditors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EditorRow[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("list_editors");
    if (error) throw new Error(error.message);
    return (data ?? []).map(
      (row: { user_id: string; email: string | null; granted_at: string }) => ({
        userId: row.user_id,
        email: row.email ?? "unknown",
        grantedAt: row.granted_at,
      }),
    );
  });

/** Promote an existing account (by email) to editor. */
export const adminGrantEditor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => emailInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: userId, error: lookupError } = await supabaseAdmin.rpc("user_id_for_email", {
      _email: data.email,
    });
    if (lookupError) throw new Error(lookupError.message);
    if (!userId) {
      return {
        ok: false as const,
        message:
          "No account with that email. Ask them to sign up at /auth first, then add them here.",
      };
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);

    return { ok: true as const, message: `${data.email} is now an editor.` };
  });

/** Remove the editor role from an account. You cannot remove your own. */
export const adminRevokeEditor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => userIdInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId) {
      return { ok: false as const, message: "You cannot remove your own editor access." };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    return { ok: true as const, message: "Editor access removed." };
  });
