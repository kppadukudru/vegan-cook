import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { adminListSitePages, adminSaveSitePage } from "@/lib/admin.functions";
import { Prose } from "@/components/Prose";
import type { SitePage } from "@/lib/site-pages";

const inputClass =
  "w-full border border-steel bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none";

const LABELS: Record<string, string> = { about: "About page" };

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] uppercase tracking-[0.15em] text-mute">{label}</span>
      {children}
      {hint && <span className="block text-xs text-mute">{hint}</span>}
    </label>
  );
}

export function PagesAdmin() {
  const list = useServerFn(adminListSitePages);
  const save = useServerFn(adminSaveSitePage);

  const [pages, setPages] = useState<SitePage[]>([]);
  const [form, setForm] = useState<SitePage | null>(null);
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState("");
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const rows = await list();
      setPages(rows);
      setForm((current) => current ?? rows[0] ?? null);
    } catch {
      setProblem("Could not load the page copy.");
    }
  }, [list]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSave = async () => {
    if (!form || busy) return;
    setBusy(true);
    setNotice("");
    setProblem("");
    try {
      const res = await save({ data: form });
      if (res.ok) {
        setNotice(res.message);
        await refresh();
      } else {
        setProblem(res.message);
      }
    } catch (e) {
      setProblem(e instanceof Error ? e.message : "Could not save that page.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-6">
      {notice && <p className="border border-leaf/40 bg-secondary px-4 py-3 text-sm">{notice}</p>}
      {problem && (
        <p className="border border-destructive/40 px-4 py-3 text-sm text-destructive">{problem}</p>
      )}

      {pages.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {pages.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setForm(p);
                setPreview(false);
              }}
              className={`border px-3 py-1.5 text-xs ${
                form?.id === p.id ? "border-ink" : "border-steel text-mute hover:text-ink"
              }`}
            >
              {LABELS[p.id] ?? p.id}
            </button>
          ))}
        </div>
      )}

      {!form && <p className="text-sm text-mute">No editable pages yet.</p>}

      {form && (
        <div className="space-y-5 border border-steel p-5 md:p-6">
          <p className="text-[10px] uppercase tracking-[0.15em] text-mute">
            Editing {LABELS[form.id] ?? form.id}: /{form.id}
          </p>

          <Field label="Headline">
            <input
              className={inputClass}
              value={form.heading}
              onChange={(e) => setForm({ ...form, heading: e.target.value })}
            />
          </Field>

          <Field
            label="Body"
            hint="Markdown: ## for section headings, blank line between paragraphs, - for lists."
          >
            <textarea
              className={`${inputClass} min-h-[420px] font-mono text-[13px] leading-relaxed`}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Search title" hint="Shown in Google and social previews.">
              <input
                className={inputClass}
                value={form.metaTitle}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
              />
            </Field>
            <Field label="Status">
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as "published" | "draft" })
                }
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
          </div>

          <Field label="Search description">
            <textarea
              className={`${inputClass} min-h-[80px]`}
              value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
            />
          </Field>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={busy}
              className="border border-ink bg-ink text-paper px-5 py-2.5 text-xs uppercase tracking-[0.15em] disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save page"}
            </button>
            <button
              type="button"
              onClick={() => setPreview((v) => !v)}
              className="border border-steel px-5 py-2.5 text-xs uppercase tracking-[0.15em] hover:border-ink"
            >
              {preview ? "Hide preview" : "Preview"}
            </button>
          </div>

          {preview && (
            <div className="border-t border-steel pt-6">
              <h2 className="font-serif text-2xl md:text-3xl tracking-tight max-w-[38ch] mb-6">
                {form.heading}
              </h2>
              <Prose markdown={form.body} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
