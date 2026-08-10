import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password | Vegan Cook" },
      {
        name: "description",
        content: "Set a new password for your Vegan Cook editor account.",
      },
      { property: "og:title", content: "Reset Password | Vegan Cook" },
      { property: "og:description", content: "Set a new password for your Vegan Cook editor account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase recovery links put the tokens in the URL hash. We need to parse
    // the hash and set the session so updateUser can change the password.
    const hash = window.location.hash;
    if (!hash || !hash.includes("type=recovery")) return;

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (type === "recovery" && accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/.test(password)) {
      setBusy(false);
      setError("Use at least 10 characters with letters, numbers and at least one symbol.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
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
          <p className="text-[10px] uppercase tracking-[0.15em] text-mute">Editor account</p>
          <h1 className="font-serif text-3xl tracking-tight">Set a new password</h1>
        </div>

        {done ? (
          <div className="space-y-5">
            <p className="text-sm text-mute leading-relaxed">
              Your password has been updated. You can now sign in with the new password.
            </p>
            <Link
              to="/auth"
              className="inline-block bg-ink text-paper px-5 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <label className="block space-y-2">
              <span className="text-[10px] uppercase tracking-[0.15em] text-mute">New password</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-steel bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none"
              />
              <span className="block text-xs text-mute">
                At least 10 characters, mixing letters, numbers and a symbol.
              </span>
            </label>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-ink text-paper px-5 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save new password"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
