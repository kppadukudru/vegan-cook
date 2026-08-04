import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "@/lib/admin-schemas";

const weekInput = z.object({
  /** Which issue to build: 0 = this week, 1 = next week, -1 = last week. */
  offset: z.number().int().min(-52).max(52).default(0),
});

/** The five recipes, subject line and ready-to-paste HTML for one weekly issue. */
export const adminWeeklyIssue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => weekInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { renderWeeklyIssue } = await import("@/lib/newsletter.server");
    const when = new Date();
    when.setUTCDate(when.getUTCDate() + data.offset * 7);
    return renderWeeklyIssue(when);
  });

/** Subscriber list for the issue send, minus anyone who unsubscribed or bounced. */
export const adminListSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { listActiveSubscribers } = await import("@/lib/newsletter.server");
    return listActiveSubscribers();
  });
