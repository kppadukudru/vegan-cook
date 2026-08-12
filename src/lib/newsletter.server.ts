import * as React from "react";
import { render } from "@react-email/render";
import { TEMPLATES } from "@/lib/email-templates/registry";

const SITE_NAME = "Vegan Cook";
const SENDER_DOMAIN = "notify.vegancook.live";
const FROM_DOMAIN = "vegancook.live";

function redactEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  return `${local[0]}***@${domain}`;
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Render one registered template and enqueue it for a single recipient. */
export async function enqueueTemplateEmail(options: {
  templateName: string;
  recipientEmail: string;
  idempotencyKey?: string;
  templateData?: Record<string, unknown>;
}): Promise<{ ok: boolean; reason?: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const template = TEMPLATES[options.templateName];
  if (!template) {
    console.error("Unknown email template", options.templateName);
    return { ok: false, reason: "unknown_template" };
  }

  const email = options.recipientEmail.toLowerCase();
  const messageId = crypto.randomUUID();
  const templateData = options.templateData ?? {};

  const { data: suppressed, error: suppressionError } = await supabaseAdmin
    .from("suppressed_emails")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (suppressionError) {
    console.error("Suppression check failed — refusing to send");
    return { ok: false, reason: "suppression_check_failed" };
  }
  if (suppressed) {
    return { ok: false, reason: "email_suppressed" };
  }

  const { data: existingToken } = await supabaseAdmin
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", email)
    .maybeSingle();

  let unsubscribeToken = existingToken?.token;
  if (existingToken?.used_at) return { ok: false, reason: "email_suppressed" };
  if (!unsubscribeToken) {
    unsubscribeToken = generateToken();
    await supabaseAdmin
      .from("email_unsubscribe_tokens")
      .upsert({ token: unsubscribeToken, email }, { onConflict: "email", ignoreDuplicates: true });
    const { data: stored } = await supabaseAdmin
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", email)
      .maybeSingle();
    if (!stored) return { ok: false, reason: "token_failed" };
    unsubscribeToken = stored.token;
  }

  const { SITE_URL: siteUrl } = await import("@/lib/newsletter");
  const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${unsubscribeToken}`;
  const element = React.createElement(template.component, { unsubscribeUrl, ...templateData });
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject =
    typeof template.subject === "function" ? template.subject(templateData) : template.subject;

  await supabaseAdmin.from("email_send_log").insert({
    message_id: messageId,
    template_name: options.templateName,
    recipient_email: email,
    status: "pending",
  });

  const { error: enqueueError } = await supabaseAdmin.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: email,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: "transactional",
      label: options.templateName,
      idempotency_key: options.idempotencyKey ?? messageId,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });

  if (enqueueError) {
    console.error("Failed to enqueue email", enqueueError.message, redactEmail(email));
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: options.templateName,
      recipient_email: email,
      status: "failed",
      error_message: "Failed to enqueue email",
    });
    return { ok: false, reason: "enqueue_failed" };
  }

  return { ok: true };
}

/** Render the current (or given) weekly issue to HTML for manual sending. */
export async function renderWeeklyIssue(when: Date) {
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

/** Active subscribers = signed up and not suppressed/unsubscribed. */
export async function listActiveSubscribers() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: subs, error }, { data: suppressed }] = await Promise.all([
    supabaseAdmin.from("subscribers").select("email, created_at").order("created_at", {
      ascending: false,
    }),
    supabaseAdmin.from("suppressed_emails").select("email"),
  ]);
  if (error) throw new Error(error.message);

  const blocked = new Set((suppressed ?? []).map((row) => row.email.toLowerCase()));
  const all = subs ?? [];
  return {
    active: all
      .filter((row) => !blocked.has(row.email.toLowerCase()))
      .map((row) => ({ email: row.email, createdAt: row.created_at })),
    unsubscribedCount: all.filter((row) => blocked.has(row.email.toLowerCase())).length,
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

    const result = await enqueueTemplateEmail({
      templateName: "weekly-issue",
      recipientEmail: email,
      idempotencyKey: `weekly-${issue.week}-${email}`,
      templateData,
    });

    if (result.ok) {
      sent += 1;
    } else if (result.reason === "email_suppressed") {
      skipped += 1;
    } else {
      failed += 1;
    }
  }

  return { ok: true as const, week: issue.week, sent, skipped, failed };
}
