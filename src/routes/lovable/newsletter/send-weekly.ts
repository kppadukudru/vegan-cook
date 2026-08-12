import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lovable/newsletter/send-weekly")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
        if (!supabaseServiceKey) {
          console.error("Missing required environment variables");
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        // Same auth check as the queue processor: pg_cron sends the service role
        // key as a Bearer token.
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.slice("Bearer ".length).trim();
        if (token !== supabaseServiceKey) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        const { enqueueWeeklyIssueToAll } = await import("@/lib/newsletter.server");
        const summary = await enqueueWeeklyIssueToAll(new Date());
        return Response.json(summary);
      },
    },
  },
});
