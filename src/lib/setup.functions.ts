import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const setupInput = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(10).max(128),
  inviteCode: z.string().trim().min(1),
});

/**
 * One-time public setup: create the first editor account. Requires the
 * configured invite code and fails once any editor already exists.
 */
export const setupFirstEditor = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => setupInput.parse(data))
  .handler(async ({ data }) => {
    const expected = process.env['FIRST_EDITOR_INVITE_CODE'];
    if (!expected || data.inviteCode !== expected) {
      return { ok: false as const, message: "That invite code is not valid." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    if (existing) {
      return {
        ok: false as const,
        message: "An editor already exists for this site. Ask them to invite you from the admin desk.",
      };
    }

    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    let userId = userData?.user?.id ?? null;
    let created = true;

    if (createError) {
      const alreadyExists =
        createError.message.toLowerCase().includes("already been registered") ||
        createError.message.toLowerCase().includes("already exists");
      if (!alreadyExists) throw new Error(createError.message);

      // The account exists but no editor exists yet: promote it and reset the
      // password so the invite code holder can sign in.
      created = false;
      const { data: existingId, error: idError } = await supabaseAdmin.rpc("user_id_for_email", {
        _email: data.email,
      });
      if (idError) throw new Error(idError.message);
      if (!existingId) {
        return { ok: false as const, message: "Could not find that account." };
      }
      userId = existingId as string;

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: data.password,
        email_confirm: true,
      });
      if (updateError) throw new Error(updateError.message);
    }

    if (!userId) {
      return { ok: false as const, message: "Could not create the account." };
    }

    const { error: claimError } = await supabaseAdmin.rpc("claim_first_editor", {
      _user_id: userId,
    });
    if (claimError) throw new Error(claimError.message);

    return {
      ok: true as const,
      message: created
        ? "Editor account created. Sign in with your email and password."
        : "Existing account promoted to editor and password updated. Sign in now.",
    };

  });
