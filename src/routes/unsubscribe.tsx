import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const Route = createFileRoute("/unsubscribe")({
  head: () => ({
    meta: [
      { title: "Unsubscribe — Vegan Cook Weekly" },
      {
        name: "description",
        content:
          "Stop receiving the Vegan Cook weekly newsletter. One click, no questions, no hard feelings.",
      },
      { property: "og:title", content: "Unsubscribe — Vegan Cook Weekly" },
      {
        property: "og:description",
        content: "Stop receiving the Vegan Cook weekly newsletter.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UnsubscribePage,
});

type State =
  | "checking"
  | "ready"
  | "already"
  | "by-email"
  | "sending"
  | "done"
  | "error";

function UnsubscribePage() {
  const [state, setState] = useState<State>("checking");
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token");
    setToken(value);
    if (!value) {
      // No token in the link — fall back to unsubscribing by email address.
      setState("by-email");
      return;
    }
    void (async () => {
      try {
        const res = await fetch(`/email/unsubscribe?token=${encodeURIComponent(value)}`);
        const body = (await res.json()) as { valid?: boolean; reason?: string };
        if (body.valid) setState("ready");
        else if (body.reason === "already_unsubscribed") setState("already");
        else setState("by-email");
      } catch {
        setState("error");
      }
    })();
  }, []);

  const post = async (payload: Record<string, string>) => {
    setState("sending");
    try {
      const res = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { success?: boolean; reason?: string };
      if (body.success) setState("done");
      else if (body.reason === "already_unsubscribed") setState("already");
      else setState("error");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 md:px-8 py-20 max-w-[640px] mx-auto w-full space-y-6">
        <p className="text-[10px] uppercase tracking-[0.15em] text-mute">Vegan Cook weekly</p>
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight">Unsubscribe</h1>

        {state === "checking" && <p className="text-sm text-mute">Checking your link…</p>}

        {state === "ready" && (
          <div className="space-y-5 border border-steel p-8">
            <p className="text-sm text-mute leading-relaxed">
              Confirm below and we'll stop sending the weekly newsletter to this address. You can
              sign up again any time from the home page.
            </p>
            <button
              onClick={() => token && void post({ token })}
              className="bg-ink text-paper px-5 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors"
            >
              Confirm unsubscribe
            </button>
          </div>
        )}

        {state === "by-email" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void post({ email });
            }}
            className="space-y-5 border border-steel p-8"
          >
            <p className="text-sm text-mute leading-relaxed">
              Enter the email address you subscribed with and we'll stop sending the weekly
              newsletter to it.
            </p>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-steel bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none"
            />
            <button
              type="submit"
              className="bg-ink text-paper px-5 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors"
            >
              Unsubscribe this address
            </button>
          </form>
        )}

        {state === "sending" && <p className="text-sm text-mute">Removing you from the list…</p>}

        {state === "done" && (
          <div className="space-y-3 border border-steel p-8">
            <p className="text-sm">You're unsubscribed. No more emails from us.</p>
            <p className="text-sm text-mute leading-relaxed">
              The recipe collection stays open. The recipe of the day still rotates on the site.
            </p>
          </div>
        )}

        {state === "already" && (
          <p className="text-sm text-mute">
            This address is already unsubscribed. Nothing more to do.
          </p>
        )}

        {state === "error" && (
          <div className="space-y-4">
            <p className="text-sm text-destructive">
              Something went wrong. Please try again in a moment.
            </p>
            <button
              onClick={() => setState("by-email")}
              className="border border-steel px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-mute hover:border-ink hover:text-ink transition-colors"
            >
              Unsubscribe by email instead
            </button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
