import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "Editor Sign In — Vegan Cook" },
      {
        name: "description",
        content: "Sign in to the Vegan Cook editing desk to manage recipes and review submissions.",
      },
      { property: "og:title", content: "Editor Sign In — Vegan Cook" },
      { property: "og:description", content: "Editing desk for the Vegan Cook recipe table." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthSignInPage,
});

function AuthSignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate({ to: "/admin", replace: true });
  };

  const onForgotPassword = async () => {
    if (!email) {
      setError("Enter your email address first.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setBusy(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setNotice("Check your inbox for a password-reset link.");
  };

  return (
    <div className="bg-paper text-ink min-h-dvh antialiased">
      <header className="border-b border-steel px-6 md:px-8 py-5">
        <Link to="/" className="font-serif text-xl tracking-tight">
          Vegan Cook
        </Link>
      </header>

      <main className="max-w-md mx-auto px-6 py-20 space-y-8">
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.15em] text-mute">Editing desk</p>
          <h1 className="font-serif text-3xl tracking-tight">Sign in</h1>
          <p className="text-sm text-mute leading-relaxed">
            This page is only for editors. If you need access, ask an existing editor to invite you.
            Readers do not need an account.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <label className="block space-y-2">
            <span className="text-[10px] uppercase tracking-[0.15em] text-mute">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-steel bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[10px] uppercase tracking-[0.15em] text-mute">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-steel bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none"
            />
          </label>

          {error && <p className="text-xs text-destructive">{error}</p>}
          {notice && <p className="text-xs text-leaf">{notice}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-ink text-paper px-5 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors disabled:opacity-50"
          >
            {busy ? "Working…" : "Sign in"}
          </button>

          <button
            type="button"
            onClick={onForgotPassword}
            disabled={busy}
            className="w-full text-[10px] uppercase tracking-[0.15em] text-mute hover:text-ink transition-colors disabled:opacity-50"
          >
            Forgot password?
          </button>
        </form>
      </main>
    </div>
  );
}
