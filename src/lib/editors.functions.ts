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

/** Invite an editor by email. Creates a confirmed account if one does not exist. */
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

    let targetUserId: string;
    let createdAccount = false;

    if (userId) {
      targetUserId = userId;
    } else {
      const tempPassword = crypto.randomUUID();
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: tempPassword,
        email_confirm: true,
      });
      if (createError) throw new Error(createError.message);
      if (!newUser.user) throw new Error("Could not create the account.");
      targetUserId = newUser.user.id;
      createdAccount = true;
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: targetUserId, role: "admin" }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);

    const siteUrl = process.env['SITE_URL'] ?? "https://vegancook.live";
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: data.email,
      options: { redirectTo: `${siteUrl}/auth/reset-password` },
    });

    if (linkError) {
      console.error("Failed to generate recovery link for editor invite", linkError);
    }

    const resetUrl = linkError ? undefined : linkData.properties.action_link;

    const { enqueueTemplateEmail } = await import("@/lib/newsletter.server");
    await enqueueTemplateEmail({
      templateName: "editor-invite",
      recipientEmail: data.email,
      idempotencyKey: `editor-invite-${targetUserId}`,
      templateData: {
        resetUrl,
        invitedByEmail:
          typeof context.claims?.email === "string" ? context.claims.email : "an existing editor",
      },
    });

    return {
      ok: true as const,
      message: createdAccount
        ? `Invitation sent to ${data.email}. They can set a password from the email.`
        : `${data.email} is now an editor and has been notified.`,
    };
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
