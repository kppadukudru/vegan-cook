import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(255),
});

export const subscribeToDaily = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => subscribeSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("subscribers")
      .upsert({ email: data.email }, { onConflict: "email" });

    if (error) {
      console.error("subscribeToDaily failed:", error.message);
      return { ok: false as const, message: "Could not save your email. Please try again." };
    }

    return {
      ok: true as const,
      message: "You're on the list. A new plant-based recipe will land in your inbox each day.",
    };
  });
