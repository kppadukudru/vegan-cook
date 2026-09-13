import { render } from "@react-email/render";
import { TEMPLATES } from "@/lib/email-templates/registry";

function redactEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  return `${local[0]}***@${domain}`;
}

/** Send one registered template to a single recipient. */
export async function enqueueTemplateEmail(options: {
  templateName: string;
  recipientEmail: string;
  idempotencyKey?: string;
  templateData?: Record<string, unknown>;
}): Promise<{ ok: boolean; reason?: string }> {
  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
  const result = await sendTemplateEmail(options.templateName, options.recipientEmail, {
    idempotencyKey: options.idempotencyKey,
    templateData: options.templateData,
  });
  return result.sent
    ? { ok: true }
    : { ok: false, reason: "email_suppressed" };
}

/** Render the current (or given) weekly issue to HTML for manual sending. */
export async function renderWeeklyIssue(when: Date) {
  const React = await import("react");
  const { createPublicClient, rowToRecipe, RECIPE_COLUMNS } = await import(
    "@/lib/recipes.server"
  );
  const { pickWeeklyRecipes, weekKey, weekStart, SITE_URL } = await import("@/lib/newsletter");

  const { data, error } = await createPublicClient()
    .from("recipes")
    .select(RECIPE_COLUMNS)
    .eq("status", "published");
  if (error) throw new Error(error.message);

  const recipes = pickWeeklyRecipes((data ?? []).map(rowToRecipe), when, 5).map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    blurb: recipe.blurb,
    skill: recipe.skill,
    timeMinutes: recipe.timeMinutes,
    cuisine: recipe.cuisine ?? null,
    contains: recipe.contains,
  }));

  const start = weekStart(when);
  const weekOf = new Date(`${start}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });

  const templateData = { weekOf, siteUrl: SITE_URL, recipes };
  const entry = TEMPLATES["weekly-issue"]!;
  const element = React.createElement(entry.component, templateData);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject =
    typeof entry.subject === "function" ? entry.subject(templateData) : entry.subject;

  return { week: weekKey(when), weekOf, subject, html, text, recipes };
}

/** Active subscribers, using managed unsubscribe state as the source of truth. */
export async function listActiveSubscribers() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: subs, error } = await supabaseAdmin
    .from("subscribers")
    .select("email, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const all = subs ?? [];
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error('LOVABLE_API_KEY is not configured');
  const { getEmailUnsubscribe } = await import('@lovable.dev/email-js');
  const states = await Promise.all(
    all.map(async (row) => ({
      row,
      state: await getEmailUnsubscribe(
        { recipient: row.email, domain: 'notify.vegancook.live' },
        { apiKey },
      ),
    })),
  );
  const active = states.filter(({ state }) => state.subscribed);
  return {
    active: active.map(({ row }) => ({ email: row.email, createdAt: row.created_at })),
    unsubscribedCount: states.length - active.length,
  };
}

/**
 * Enqueue the weekly issue for every active subscriber.
 *
 * Idempotency: before enqueuing, a claim row is inserted into email_send_log
 * with (template_name='weekly-issue', recipient_email, week). A partial unique
 * index on (template_name, lower(recipient_email), week) where week is not null
 * makes that insert the atomic lock — a duplicate claim fails, and we skip that
 * subscriber. Re-running for the same week therefore sends nothing new.
 */
export async function enqueueWeeklyIssueToAll(when: Date = new Date()) {
  const issue = await renderWeeklyIssue(when);
  if (issue.recipes.length === 0) {
    return { ok: false as const, reason: "no_recipes" as const, sent: 0 };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { SITE_URL } = await import("@/lib/newsletter");
  const { active } = await listActiveSubscribers();

  const templateData = {
    weekOf: issue.weekOf,
    siteUrl: SITE_URL,
    recipes: issue.recipes,
  };

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const subscriber of active) {
    const email = subscriber.email.toLowerCase();

    const { error: claimError } = await supabaseAdmin.from("email_send_log").insert({
      message_id: `weekly-${issue.week}-${email}`,
      template_name: "weekly-issue",
      recipient_email: email,
      status: "pending",
      week: issue.week,
    });

    if (claimError) {
      // Unique violation = already claimed for this week.
      if (claimError.code === "23505") {
        skipped += 1;
      } else {
        console.error("Weekly claim failed", claimError.message, redactEmail(email));
        failed += 1;
      }
      continue;
    }

    try {
      const result = await enqueueTemplateEmail({
        templateName: "weekly-issue",
        recipientEmail: email,
        idempotencyKey: `weekly-${issue.week}-${email}`,
        templateData,
      });

      if (result.ok) {
        const { error: updateError } = await supabaseAdmin
          .from("email_send_log")
          .update({ status: "sent" })
          .eq("message_id", `weekly-${issue.week}-${email}`)
          .eq("week", issue.week);
        if (updateError) {
          console.error("Weekly send log update failed", updateError.message, redactEmail(email));
        }
        sent += 1;
      } else if (result.reason === "email_suppressed") {
        const { error: updateError } = await supabaseAdmin
          .from("email_send_log")
          .update({ status: "suppressed" })
          .eq("message_id", `weekly-${issue.week}-${email}`)
          .eq("week", issue.week);
        if (updateError) {
          console.error("Weekly send log update failed", updateError.message, redactEmail(email));
        }
        skipped += 1;
      } else {
        failed += 1;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const { error: updateError } = await supabaseAdmin
        .from("email_send_log")
        .update({ status: "failed", error_message: errorMessage.slice(0, 1000) })
        .eq("message_id", `weekly-${issue.week}-${email}`)
        .eq("week", issue.week);
      if (updateError) {
        console.error("Weekly send log update failed", updateError.message, redactEmail(email));
      }
      console.error(
        "Weekly send failed",
        errorMessage,
        redactEmail(email),
      );
      failed += 1;
    }
  }

  return { ok: true as const, week: issue.week, sent, skipped, failed };
}
