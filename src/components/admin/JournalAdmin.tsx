import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { adminDeletePost, adminListPosts, adminSavePost } from "@/lib/admin.functions";
import { ALL_JOURNAL_TAGS, formatPostDate, type JournalPost, type JournalTag } from "@/lib/journal";
import { Prose } from "@/components/Prose";

const inputClass =
  "w-full border border-steel bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none";

interface PostForm {
  id: string;
  title: string;
  tag: JournalTag;
  excerpt: string;
  body: string;
  coverUrl: string;
  coverAlt: string;
  author: string;
  publishedAt: string;
  status: "published" | "draft";
}

const emptyPost = (): PostForm => ({
  id: "",
  title: "",
  tag: "Essay",
  excerpt: "",
  body: "",
  coverUrl: "",
  coverAlt: "",
  author: "Vegan Cook",
  publishedAt: new Date().toISOString().slice(0, 10),
  status: "draft",
});

const formFromPost = (p: JournalPost): PostForm => ({
  id: p.id,
  title: p.title,
  tag: p.tag,
  excerpt: p.excerpt,
  body: p.body,
  coverUrl: p.coverUrl ?? "",
  coverAlt: p.coverAlt ?? "",
  author: p.author,
  publishedAt: p.publishedAt,
  status: p.status,
});

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

export function JournalAdmin() {
  const list = useServerFn(adminListPosts);
  const save = useServerFn(adminSavePost);
  const remove = useServerFn(adminDeletePost);

  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [form, setForm] = useState<PostForm | null>(null);
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState("");
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setPosts(await list());
    } catch {
      setProblem("Could not load the journal posts.");
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
      const res = await save({ data: { ...form, id: form.id || undefined } });
      if (res.ok) {
        setNotice(res.message);
        setForm(null);
        setPreview(false);
        await refresh();
      } else {
        setProblem(res.message);
      }
    } catch (e) {
      setProblem(e instanceof Error ? e.message : "Could not save that post.");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: string, title: string) => {
    if (busy) return;
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await remove({ data: { id } });
      if (res.ok) {
        setNotice(res.message);
        await refresh();
      } else setProblem(res.message);
    } catch {
      setProblem("Could not delete that post.");
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

      {!form && (
        <button
          onClick={() => setForm(emptyPost())}
          className="bg-ink text-paper px-5 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors"
        >
          New post
        </button>
      )}

      {form && (
        <div className="border border-steel p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-2xl tracking-tight">
              {form.id ? "Edit post" : "New post"}
            </h2>
            <button
              onClick={() => setPreview((p) => !p)}
              className="text-[10px] uppercase tracking-[0.15em] text-mute hover:text-ink transition-colors"
            >
              {preview ? "Back to editing" : "Preview"}
            </button>
          </div>

          {preview ? (
            <div className="space-y-6">
              <h3 className="font-serif text-3xl tracking-tight">{form.title || "Untitled"}</h3>
              {form.excerpt && <p className="text-mute text-sm">{form.excerpt}</p>}
              <Prose markdown={form.body || "_Nothing written yet._"} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Title">
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </Field>
              <Field
                label="Address (slug)"
                hint={
                  form.id
                    ? "Changing this creates a new post at the new address."
                    : "Leave blank to build it from the title."
                }
              >
                <input
                  className={inputClass}
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="ordering-vegan-in-venice"
                />
              </Field>
              <Field label="Topic">
                <select
                  className={inputClass}
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value as JournalTag })}
                >
                  {ALL_JOURNAL_TAGS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as "published" | "draft" })
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>
              <Field label="Author">
                <input
                  className={inputClass}
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                />
              </Field>
              <Field label="Date">
                <input
                  type="date"
                  className={inputClass}
                  value={form.publishedAt}
                  onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                />
              </Field>
              <Field label="Cover image link" hint="Optional. Must start with https://">
                <input
                  className={inputClass}
                  value={form.coverUrl}
                  onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                />
              </Field>
              <Field label="Cover image description">
                <input
                  className={inputClass}
                  value={form.coverAlt}
                  onChange={(e) => setForm({ ...form, coverAlt: e.target.value })}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Standfirst" hint="One or two sentences shown on cards and in search.">
                  <textarea
                    rows={3}
                    className={inputClass}
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field
                  label="Body"
                  hint="Markdown: ## for headings, - for lists, **bold**, > for pull quotes."
                >
                  <textarea
                    rows={22}
                    className={`${inputClass} font-mono text-[13px] leading-relaxed`}
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onSave}
              disabled={busy}
              className="bg-ink text-paper px-5 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save post"}
            </button>
            <button
              onClick={() => {
                setForm(null);
                setPreview(false);
              }}
              className="border border-steel px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-mute hover:text-ink hover:border-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <p className="border border-dashed border-steel p-8 text-center text-sm text-mute">
          No posts yet.
        </p>
      ) : (
        <ul className="divide-y divide-steel border border-steel">
          {posts.map((p) => (
            <li key={p.id} className="p-4 flex flex-wrap items-center gap-4 justify-between">
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-mute">
                  {p.tag} / {formatPostDate(p.publishedAt)} /{" "}
                  <span className={p.status === "published" ? "text-leaf" : ""}>{p.status}</span> /{" "}
                  {p.id}
                </p>
              </div>
              <div className="flex gap-4 text-[10px] uppercase tracking-[0.15em]">
                <button
                  onClick={() => {
                    setForm(formFromPost(p));
                    setPreview(false);
                  }}
                  className="text-mute hover:text-ink transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(p.id, p.title)}
                  className="text-mute hover:text-destructive transition-colors"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
