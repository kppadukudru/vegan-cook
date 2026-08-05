import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { setupFirstEditor } from "@/lib/setup.functions";

export const Route = createFileRoute("/auth/setup")({
  head: () => ({
    meta: [
      { title: "Editor Setup — Vegan Cook" },
      {
        name: "description",
        content: "First-time editor setup for Vegan Cook.",
      },
      { property: "og:title", content: "Editor Setup — Vegan Cook" },
      { property: "og:description", content: "First-time editor setup for Vegan Cook." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/.test(password)) {
      setBusy(false);
      setError("Use at least 10 characters with letters, numbers and at least one symbol.");
      return;
    }

    try {
      const result = await setupFirstEditor({
        data: { email: email.toLowerCase(), password, inviteCode },
      });
      if (result.ok) {
        setNotice(result.message);
        setTimeout(() => {
          navigate({ to: "/auth", replace: true });
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the editor account.");
    } finally {
      setBusy(false);
    }
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
          <p className="text-[10px] uppercase tracking-[0.15em] text-mute">First-time setup</p>
          <h1 className="font-serif text-3xl tracking-tight">Create the editor account</h1>
          <p className="text-sm text-mute leading-relaxed">
            This page only works while no editor exists. After the first editor is created, new
            editors must be invited from the admin desk.
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-steel bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none"
            />
            <span className="block text-xs text-mute">
              At least 10 characters, mixing letters, numbers and a symbol.
            </span>
          </label>

          <label className="block space-y-2">
            <span className="text-[10px] uppercase tracking-[0.15em] text-mute">Invite code</span>
            <input
              type="text"
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
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
            {busy ? "Creating…" : "Create editor account"}
          </button>

          <Link
            to="/auth"
            className="block w-full text-center text-[10px] uppercase tracking-[0.15em] text-mute hover:text-ink transition-colors"
          >
            Already have an account? Sign in
          </Link>
        </form>
      </main>
    </div>
  );
}
