import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  adminGrantEditor,
  adminListEditors,
  adminRevokeEditor,
  type EditorRow,
} from "@/lib/editors.functions";

export function EditorsAdmin({ currentUserId }: { currentUserId: string | null }) {
  const list = useServerFn(adminListEditors);
  const grant = useServerFn(adminGrantEditor);
  const revoke = useServerFn(adminRevokeEditor);

  const [editors, setEditors] = useState<EditorRow[]>([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [problem, setProblem] = useState("");

  const refresh = useCallback(async () => {
    try {
      setEditors(await list());
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Could not load the editor list.");
    }
  }, [list]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    setProblem("");
    try {
      const result = await grant({ data: { email } });
      if (result.ok) {
        setNotice(result.message);
        setEmail("");
        await refresh();
      } else {
        setProblem(result.message);
      }
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Could not invite that editor.");
    } finally {
      setBusy(false);
    }
  };

  const onRevoke = async (userId: string) => {
    setBusy(true);
    setNotice("");
    setProblem("");
    try {
      const result = await revoke({ data: { userId } });
      if (result.ok) {
        setNotice(result.message);
        await refresh();
      } else {
        setProblem(result.message);
      }
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Could not remove that editor.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[70ch]">
      <div className="space-y-2">
        <h2 className="font-serif text-2xl tracking-tight">Editors</h2>
        <p className="text-sm text-mute leading-relaxed">
          Editors can change recipes, review submissions, write journal posts and edit page copy.
          Enter an email to invite someone. If they do not have an account yet, one is created for
          them and they receive a password-reset link.
        </p>
      </div>

      {notice && <p className="border border-leaf/40 bg-secondary px-4 py-3 text-sm">{notice}</p>}
      {problem && (
        <p className="border border-destructive/40 px-4 py-3 text-sm text-destructive">{problem}</p>
      )}

      <form onSubmit={onGrant} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          placeholder="person@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border border-steel bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none"
        />
        <button
          type="submit"
          disabled={busy}
          className="bg-ink text-paper px-5 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors disabled:opacity-50"
        >
          {busy ? "Working…" : "Invite editor"}
        </button>
      </form>

      <ul className="border-t border-steel">
        {editors.map((editor) => (
          <li
            key={editor.userId}
            className="flex items-center justify-between gap-4 border-b border-steel py-4"
          >
            <div className="space-y-1">
              <p className="text-sm">{editor.email}</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-mute">
                Editor since {new Date(editor.grantedAt).toISOString().slice(0, 10)}
                {editor.userId === currentUserId ? " · you" : ""}
              </p>
            </div>
            {editor.userId !== currentUserId && (
              <button
                disabled={busy}
                onClick={() => void onRevoke(editor.userId)}
                className="border border-steel px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-mute hover:border-destructive hover:text-destructive transition-colors disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </li>
        ))}
        {editors.length === 0 && (
          <li className="border-b border-steel py-4 text-sm text-mute">No editors listed.</li>
        )}
      </ul>
    </div>
  );
}
