import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(255),
});

export const subscribeToWeekly = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => subscribeSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("subscribers")
      .upsert({ email: data.email }, { onConflict: "email" });

    if (error) {
      console.error("subscribeToWeekly failed:", error.message);
      return { ok: false as const, message: "Could not save your email. Please try again." };
    }

    // Confirmation email — one message to the address that just signed up.
    try {
      const { enqueueTemplateEmail } = await import("@/lib/newsletter.server");
      await enqueueTemplateEmail({
        templateName: "newsletter-welcome",
        recipientEmail: data.email,
        idempotencyKey: `newsletter-welcome-${data.email}`,
        templateData: { siteUrl: "https://vegancook.live" },
      });
    } catch (err) {
      console.error("newsletter welcome email failed:", err);
    }

    return {
      ok: true as const,
      message:
        "You're on the list. Five plant-based recipes will land in your inbox every Sunday — check your inbox for a confirmation.",
    };
  });
