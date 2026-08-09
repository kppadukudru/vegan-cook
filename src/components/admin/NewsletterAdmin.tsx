import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { adminListSubscribers, adminWeeklyIssue } from "@/lib/newsletter-admin.functions";

type Issue = Awaited<ReturnType<typeof adminWeeklyIssue>>;
type Subscribers = Awaited<ReturnType<typeof adminListSubscribers>>;

const buttonClass =
  "border border-ink px-4 py-2 text-[10px] uppercase tracking-[0.15em] hover:bg-ink hover:text-paper transition-colors disabled:opacity-50";

export function NewsletterAdmin() {
  const loadIssue = useServerFn(adminWeeklyIssue);
  const loadSubscribers = useServerFn(adminListSubscribers);

  const [offset, setOffset] = useState(0);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [subs, setSubs] = useState<Subscribers | null>(null);
  const [notice, setNotice] = useState("");
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(
    async (nextOffset: number) => {
      setBusy(true);
      setProblem("");
      try {
        const [nextIssue, nextSubs] = await Promise.all([
          loadIssue({ data: { offset: nextOffset } }),
          loadSubscribers(),
        ]);
        setIssue(nextIssue);
        setSubs(nextSubs);
      } catch {
        setProblem("Could not build this week's issue.");
      } finally {
        setBusy(false);
      }
    },
    [loadIssue, loadSubscribers],
  );

  useEffect(() => {
    void refresh(offset);
  }, [refresh, offset]);

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} copied to your clipboard.`);
    } catch {
      setProblem("Your browser blocked the clipboard. Select the text and copy manually.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="border border-steel p-6 space-y-3">
        <h2 className="font-serif text-xl tracking-tight">Weekly newsletter</h2>
        <p className="text-sm text-mute leading-relaxed max-w-[70ch]">
          Every subscriber gets a confirmation email automatically when they sign up. The weekly
          issue below is built for you: five recipes, no repeats until the whole collection has
          been through. Copy the HTML (or the plain text) into your mail tool and send it to the
          subscriber list.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <button className={buttonClass} onClick={() => setOffset(0)} disabled={busy}>
            This week
          </button>
          <button className={buttonClass} onClick={() => setOffset(1)} disabled={busy}>
            Next week
          </button>
          <span className="text-xs text-mute">
            {busy ? "Building…" : issue ? `Issue ${issue.week} — week of ${issue.weekOf}` : ""}
          </span>
        </div>
        {notice && <p className="text-xs text-leaf">{notice}</p>}
        {problem && <p className="text-xs text-destructive">{problem}</p>}
      </div>

      <div className="border border-steel p-6 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-[10px] uppercase tracking-[0.15em] text-mute">Subscribers</h3>
          <span className="text-xs text-mute tabular-nums">
            {subs ? `${subs.active.length} active · ${subs.unsubscribedCount} unsubscribed` : "—"}
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            className={buttonClass}
            disabled={!subs || subs.active.length === 0}
            onClick={() => copy(subs!.active.map((s) => s.email).join(", "), "Email addresses")}
          >
            Copy addresses
          </button>
          <button
            className={buttonClass}
            disabled={!subs || subs.active.length === 0}
            onClick={() =>
              copy(
                ["email,subscribed_at", ...subs!.active.map((s) => `${s.email},${s.createdAt}`)].join(
                  "\n",
                ),
                "Subscriber CSV",
              )
            }
          >
            Copy CSV
          </button>
        </div>
        {subs && subs.active.length > 0 && (
          <ul className="text-xs text-mute space-y-1 max-h-48 overflow-auto">
            {subs.active.map((s) => (
              <li key={s.email} className="tabular-nums">
                {s.email}
              </li>
            ))}
          </ul>
        )}
      </div>

      {issue && (
        <div className="border border-steel p-6 space-y-5">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-mute">Subject line</h3>
            <p className="text-sm mt-1">{issue.subject}</p>
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-mute">
              This issue's recipes
            </h3>
            <ol className="mt-2 space-y-1 text-sm">
              {issue.recipes.map((recipe, index) => (
                <li key={recipe.id}>
                  {String(index + 1).padStart(2, "0")} — {recipe.title}{" "}
                  <span className="text-mute text-xs">
                    ({recipe.skill}, {recipe.timeMinutes} min)
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className={buttonClass} onClick={() => copy(issue.subject, "Subject line")}>
              Copy subject
            </button>
            <button className={buttonClass} onClick={() => copy(issue.html, "Issue HTML")}>
              Copy HTML
            </button>
            <button className={buttonClass} onClick={() => copy(issue.text, "Plain text version")}>
              Copy plain text
            </button>
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-mute mb-2">Preview</h3>
            <iframe
              title="Weekly issue preview"
              srcDoc={issue.html}
              className="w-full h-[520px] border border-steel bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
