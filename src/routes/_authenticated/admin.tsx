import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ALL_ALLERGENS,
  ALL_CUISINES,
  ALL_MEAL_TYPES,
  ALL_SKILLS,
  ALL_SPICE_LEVELS,
  formatDate,
  type Allergen,
  type Cuisine,
  type MealType,
  type Recipe,
  type Skill,
  type SpiceLevel,
} from "@/data/recipes";
import {
  ingredientsToText,
  listToText,
  methodToText,
  slugify,
} from "@/lib/recipe-format";
import {
  adminDeleteRecipe,
  adminListRecipes,
  adminListSubmissions,
  adminPublishAllDrafts,
  adminPublishSubmission,
  adminRejectSubmission,
  adminSaveRecipe,
  adminSetRecipeStatus,
  getAdminStatus,

} from "@/lib/admin.functions";
import { CsvImport } from "@/components/admin/CsvImport";
import { JournalAdmin } from "@/components/admin/JournalAdmin";
import { NewsletterAdmin } from "@/components/admin/NewsletterAdmin";
import { PagesAdmin } from "@/components/admin/PagesAdmin";
import { EditorsAdmin } from "@/components/admin/EditorsAdmin";



export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Recipe Desk — Vegan Cook" },
      {
        name: "description",
        content: "Manage the Vegan Cook recipe table and review reader submissions.",
      },
      { property: "og:title", content: "Recipe Desk — Vegan Cook" },
      { property: "og:description", content: "Central recipe table and submission review queue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

interface FormState {
  id: string;
  originalId: string;
  title: string;
  blurb: string;
  timeMinutes: string;
  servings: string;
  skill: Skill;
  contains: Allergen[];
  ingredientsText: string;
  cookwareText: string;
  methodText: string;
  allergenNotes: string;
  author: string;
  publishedAt: string;
  status: "published" | "draft";
  cuisine: Cuisine | "";
  spiceLevel: SpiceLevel | "";
  mealTypes: MealType[];
  calories: string;
  imageUrl: string;
  imageAlt: string;
  imageCaption: string;
}

const emptyForm = (): FormState => ({
  id: "",
  originalId: "",
  title: "",
  blurb: "",
  timeMinutes: "30",
  servings: "4",
  skill: "Beginner",
  contains: [],
  ingredientsText: "",
  cookwareText: "",
  methodText: "",
  allergenNotes: "",
  author: "Vegan Cook",
  publishedAt: new Date().toISOString().slice(0, 10),
  status: "published",
  cuisine: "",
  spiceLevel: "",
  mealTypes: [],
  calories: "",
  imageUrl: "",
  imageAlt: "",
  imageCaption: "",
});

const formFromRecipe = (r: Recipe): FormState => ({
  id: r.id,
  originalId: r.id,
  title: r.title,
  blurb: r.blurb,
  timeMinutes: String(r.timeMinutes),
  servings: String(r.servings),
  skill: r.skill,
  contains: r.contains,
  ingredientsText: ingredientsToText(r.ingredients),
  cookwareText: listToText(r.cookware),
  methodText: methodToText(r.method),
  allergenNotes: r.allergenNotes ?? "",
  author: r.author,
  publishedAt: r.publishedAt,
  status: r.status ?? "published",
  cuisine: r.cuisine ?? "",
  spiceLevel: r.spiceLevel ?? "",
  mealTypes: r.mealTypes ?? [],
  calories: r.calories != null ? String(r.calories) : "",
  imageUrl: r.imageUrl ?? "",
  imageAlt: r.imageAlt ?? "",
  imageCaption: r.imageCaption ?? "",
});


type Submission = Awaited<ReturnType<typeof adminListSubmissions>>[number];

function AdminPage() {
  const navigate = useNavigate();
  const status = useServerFn(getAdminStatus);

  const listRecipes = useServerFn(adminListRecipes);
  const listSubmissions = useServerFn(adminListSubmissions);
  const saveRecipe = useServerFn(adminSaveRecipe);
  const removeRecipe = useServerFn(adminDeleteRecipe);
  const setRecipeStatus = useServerFn(adminSetRecipeStatus);
  const publishAllDrafts = useServerFn(adminPublishAllDrafts);

  const publishSubmission = useServerFn(adminPublishSubmission);
  const rejectSubmission = useServerFn(adminRejectSubmission);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<"recipes" | "submissions" | "import" | "journal" | "pages" | "newsletter" | "editors">("recipes");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [notice, setNotice] = useState("");
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const [r, s] = await Promise.all([listRecipes(), listSubmissions()]);
    setRecipes(r);
    setSubmissions(s);
  }, [listRecipes, listSubmissions]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await status();
        if (cancelled) return;
        setIsAdmin(result.isAdmin);
        setUserId(result.userId);
        if (result.isAdmin) await refresh();
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, refresh]);

  const pending = useMemo(
    () => submissions.filter((s) => s.status === "pending"),
    [submissions],
  );
  const reviewed = useMemo(
    () => submissions.filter((s) => s.status !== "pending"),
    [submissions],
  );
  const draftCount = useMemo(
    () => recipes.filter((r) => r.status === "draft").length,
    [recipes],
  );


  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const runAction = async (fn: () => Promise<{ ok: boolean; message: string }>) => {
    setBusy(true);
    setNotice("");
    setProblem("");
    try {
      const result = await fn();
      if (result.ok) {
        setNotice(result.message);
        await refresh();
      } else {
        setProblem(result.message);
      }
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const payload = {
      id: form.id.trim() || slugify(form.title),
      title: form.title,
      blurb: form.blurb,
      timeMinutes: Number(form.timeMinutes),
      servings: Number(form.servings),
      skill: form.skill,
      contains: form.contains,
      ingredientsText: form.ingredientsText,
      cookwareText: form.cookwareText,
      methodText: form.methodText,
      allergenNotes: form.allergenNotes,
      author: form.author,
      publishedAt: form.publishedAt,
      status: form.status,
      cuisine: form.cuisine || null,
      spiceLevel: form.spiceLevel || null,
      mealTypes: form.mealTypes,
      calories: form.calories.trim() === "" ? null : Number(form.calories),
      imageUrl: form.imageUrl.trim(),
      imageAlt: form.imageAlt.trim(),
      imageCaption: form.imageCaption.trim(),
    };
    await runAction(async () => {
      const result = await saveRecipe({ data: payload });
      if (result.ok) setForm(null);
      return result;
    });
  };

  if (isAdmin === null) {
    return (
      <Shell onSignOut={signOut}>
        <p className="text-sm text-mute">Checking your access…</p>
      </Shell>
    );
  }

  if (!isAdmin) {
    return (
      <Shell onSignOut={signOut}>
        <div className="space-y-5 max-w-lg">
          <h1 className="font-serif text-3xl tracking-tight">Not an editor</h1>
          <p className="text-sm text-mute leading-relaxed">
            You are signed in, but this account does not hold the editor role, so it cannot change
            the recipe table. Ask an existing editor to invite you from the Editors tab in the admin
            desk.
          </p>
          <Link
            to="/"
            className="inline-block border border-steel px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-mute hover:border-ink hover:text-ink transition-colors"
          >
            Back to the site
          </Link>
        </div>
      </Shell>
    );
  }


  return (
    <Shell onSignOut={signOut}>
      <div className="space-y-10">
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.15em] text-mute">Recipe desk</p>
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight">
            One table, every recipe on the site.
          </h1>
          <p className="text-sm text-mute leading-relaxed max-w-[62ch]">
            Edits here are live immediately. Reader submissions are converted into the same format
            as editorial recipes when you publish them, so nothing looks out of place.
          </p>
        </div>

        <div className="flex gap-2 border-b border-steel">
          <TabButton active={tab === "recipes"} onClick={() => setTab("recipes")}>
            Recipes ({recipes.length})
          </TabButton>
          <TabButton active={tab === "submissions"} onClick={() => setTab("submissions")}>
            Submissions ({pending.length} pending)
          </TabButton>
          <TabButton active={tab === "import"} onClick={() => setTab("import")}>
            Import CSV
          </TabButton>
          <TabButton active={tab === "journal"} onClick={() => setTab("journal")}>
            Journal
          </TabButton>
          <TabButton active={tab === "newsletter"} onClick={() => setTab("newsletter")}>
            Newsletter
          </TabButton>
          <TabButton active={tab === "pages"} onClick={() => setTab("pages")}>
            Pages
          </TabButton>
          <TabButton active={tab === "editors"} onClick={() => setTab("editors")}>
            Editors
          </TabButton>
        </div>

        {notice && (
          <p className="border border-leaf/40 bg-secondary px-4 py-3 text-sm">{notice}</p>
        )}
        {problem && (
          <p className="border border-destructive/40 px-4 py-3 text-sm text-destructive">
            {problem}
          </p>
        )}

        {tab === "recipes" && (
          <section className="space-y-6">
            {!form && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setForm(emptyForm())}
                  className="bg-ink text-paper px-5 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors"
                >
                  New recipe
                </button>
                {draftCount > 0 && (
                  <button
                    disabled={busy}
                    onClick={() => void runAction(() => publishAllDrafts())}
                    className="border border-ink px-5 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
                  >
                    Publish all {draftCount} drafts
                  </button>
                )}
              </div>
            )}


            {form && (
              <RecipeForm
                form={form}
                setForm={setForm}
                onSubmit={onSave}
                onCancel={() => setForm(null)}
                busy={busy}
              />
            )}

            <ul className="border border-steel divide-y divide-steel">
              {recipes.map((r) => (
                <li key={r.id} className="p-4 flex flex-wrap items-center gap-4 justify-between">
                  <div className="min-w-[240px]">
                    <p className="font-serif text-lg leading-tight">{r.title}</p>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-mute mt-1">
                      {r.skill} / {formatDate(r.publishedAt)} /{" "}
                      <span className={r.status === "draft" ? "text-destructive" : "text-leaf"}>
                        {r.status}
                      </span>{" "}
                      / {r.id}
                    </p>
                  </div>
                  <div className="flex gap-2 text-[10px] uppercase tracking-[0.15em]">
                    <button
                      disabled={busy}
                      onClick={() =>
                        void runAction(() =>
                          setRecipeStatus({
                            data: { id: r.id, status: r.status === "draft" ? "published" : "draft" },
                          }),
                        )
                      }
                      className={
                        r.status === "draft"
                          ? "bg-leaf text-paper px-3 py-2 hover:bg-ink transition-colors disabled:opacity-50"
                          : "border border-steel px-3 py-2 text-mute hover:border-ink hover:text-ink transition-colors disabled:opacity-50"
                      }
                    >
                      {r.status === "draft" ? "Publish" : "Unpublish"}
                    </button>
                    <button
                      onClick={() => {
                        setForm(formFromRecipe(r));
                        window.scrollTo({ top: 0 });
                      }}

                      className="border border-ink px-3 py-2 hover:bg-ink hover:text-paper transition-colors"
                    >
                      Edit
                    </button>
                    <Link
                      to="/recipes/$id"
                      params={{ id: r.id }}
                      className="border border-steel px-3 py-2 text-mute hover:border-ink hover:text-ink transition-colors"
                    >
                      View
                    </Link>
                    <button
                      disabled={busy}
                      onClick={() => {
                        if (!window.confirm(`Delete "${r.title}"? This cannot be undone.`)) return;
                        void runAction(() => removeRecipe({ data: { id: r.id } }));
                      }}
                      className="border border-steel px-3 py-2 text-mute hover:border-destructive hover:text-destructive transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === "submissions" && (
          <section className="space-y-10">
            <div className="space-y-4">
              <h2 className="font-serif text-2xl tracking-tight">Waiting for review</h2>
              {pending.length === 0 ? (
                <p className="border border-dashed border-steel p-8 text-center text-sm text-mute">
                  Nothing in the queue.
                </p>
              ) : (
                <ul className="space-y-4">
                  {pending.map((s) => (
                    <SubmissionCard
                      key={s.id}
                      submission={s}
                      busy={busy}
                      onPublish={() =>
                        runAction(() => publishSubmission({ data: { id: s.id, asDraft: false } }))
                      }
                      onDraft={() =>
                        runAction(() => publishSubmission({ data: { id: s.id, asDraft: true } }))
                      }
                      onReject={(notes) =>
                        runAction(() => rejectSubmission({ data: { id: s.id, notes } }))
                      }
                    />
                  ))}
                </ul>
              )}
            </div>

            {reviewed.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-serif text-2xl tracking-tight">Already reviewed</h2>
                <ul className="border border-steel divide-y divide-steel">
                  {reviewed.map((s) => (
                    <li key={s.id} className="p-4 flex flex-wrap gap-3 justify-between">
                      <span className="text-sm">{s.title}</span>
                      <span className="text-[10px] uppercase tracking-[0.15em] text-mute">
                        {s.status}
                        {s.published_recipe_id ? ` / ${s.published_recipe_id}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {tab === "import" && <CsvImport onImported={refresh} />}

        {tab === "journal" && <JournalAdmin />}

        {tab === "newsletter" && <NewsletterAdmin />}

        {tab === "pages" && <PagesAdmin />}

        {tab === "editors" && <EditorsAdmin currentUserId={userId} />}
      </div>
    </Shell>
  );
}

function Shell({
  children,
  onSignOut,
}: {
  children: React.ReactNode;
  onSignOut: () => void;
}) {
  return (
    <div className="bg-paper text-ink min-h-dvh antialiased">
      <header className="border-b border-steel px-6 md:px-8 py-5 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl tracking-tight">
          Vegan Cook
        </Link>
        <button
          onClick={onSignOut}
          className="text-[10px] uppercase tracking-[0.15em] text-mute hover:text-ink transition-colors"
        >
          Sign out
        </button>
      </header>
      <main className="max-w-[1100px] mx-auto px-6 md:px-8 py-12">{children}</main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-[10px] uppercase tracking-[0.15em] border-b-2 -mb-px transition-colors ${
        active ? "border-ink text-ink" : "border-transparent text-mute hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

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

const inputClass =
  "w-full border border-steel bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none";

function RecipeForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  busy,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm({ ...form, [key]: value });

  return (
    <form onSubmit={onSubmit} className="border border-steel p-6 space-y-6">
      <h2 className="font-serif text-2xl tracking-tight">
        {form.originalId ? `Editing ${form.originalId}` : "New recipe"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Title">
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Address (slug)" hint="Leave blank to generate from the title.">
          <input
            value={form.id}
            onChange={(e) => set("id", e.target.value)}
            placeholder={slugify(form.title)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Short description">
        <textarea
          required
          rows={3}
          value={form.blurb}
          onChange={(e) => set("blurb", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Field label="Minutes">
          <input
            type="number"
            min={1}
            required
            value={form.timeMinutes}
            onChange={(e) => set("timeMinutes", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Serves">
          <input
            type="number"
            min={1}
            required
            value={form.servings}
            onChange={(e) => set("servings", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Skill">
          <select
            value={form.skill}
            onChange={(e) => set("skill", e.target.value as Skill)}
            className={inputClass}
          >
            {ALL_SKILLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as "published" | "draft")}
            className={inputClass}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </Field>
      </div>

      <Field label="Contains these allergens">
        <div className="flex flex-wrap gap-2 pt-1">
          {ALL_ALLERGENS.map((a) => {
            const active = form.contains.includes(a);
            return (
              <button
                key={a}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  set(
                    "contains",
                    active ? form.contains.filter((x) => x !== a) : [...form.contains, a],
                  )
                }
                className={`px-3 py-2 text-xs transition-colors ${
                  active
                    ? "border border-ink bg-ink text-paper"
                    : "border border-steel text-mute hover:border-ink hover:text-ink"
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Field label="Cuisine">
          <select
            value={form.cuisine}
            onChange={(e) => set("cuisine", e.target.value as Cuisine | "")}
            className={inputClass}
          >
            <option value="">Not specified</option>
            {ALL_CUISINES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Spice level">
          <select
            value={form.spiceLevel}
            onChange={(e) => set("spiceLevel", e.target.value as SpiceLevel | "")}
            className={inputClass}
          >
            <option value="">Not specified</option>
            {ALL_SPICE_LEVELS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Calories per serving" hint="Optional.">
          <input
            type="number"
            min={0}
            max={10000}
            value={form.calories}
            onChange={(e) => set("calories", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Meal types">
        <div className="flex flex-wrap gap-2 pt-1">
          {ALL_MEAL_TYPES.map((m) => {
            const active = form.mealTypes.includes(m);
            return (
              <button
                key={m}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  set(
                    "mealTypes",
                    active ? form.mealTypes.filter((x) => x !== m) : [...form.mealTypes, m],
                  )
                }
                className={`px-3 py-2 text-xs transition-colors ${
                  active
                    ? "border border-ink bg-ink text-paper"
                    : "border border-steel text-mute hover:border-ink hover:text-ink"
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field
          label="Photo link"
          hint="Optional. Paste an https:// image address — leave blank for a text-only recipe."
        >
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="https://…"
            className={inputClass}
          />
        </Field>
        <Field label="Photo description" hint="Optional. Describes the photo for screen readers.">
          <input
            value={form.imageAlt}
            onChange={(e) => set("imageAlt", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      {form.imageUrl.trim() !== "" && (
        <img
          src={form.imageUrl.trim()}
          alt={form.imageAlt || form.title}
          className="w-full max-w-sm aspect-[4/3] object-cover border border-steel"
        />
      )}




      <Field
        label="Ingredients"
        hint='One per line. Either "250 g plain flour" or "250 g | plain flour".'
      >
        <textarea
          required
          rows={8}
          value={form.ingredientsText}
          onChange={(e) => set("ingredientsText", e.target.value)}
          className={`${inputClass} font-mono text-xs`}
        />
      </Field>

      <Field label="Cookware" hint="One per line.">
        <textarea
          rows={4}
          value={form.cookwareText}
          onChange={(e) => set("cookwareText", e.target.value)}
          className={`${inputClass} font-mono text-xs`}
        />
      </Field>

      <Field
        label="Method"
        hint='One step per paragraph. Start a step with "Title: " to give it a heading.'
      >
        <textarea
          required
          rows={10}
          value={form.methodText}
          onChange={(e) => set("methodText", e.target.value)}
          className={`${inputClass} font-mono text-xs`}
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Field label="Author credit">
          <input
            required
            value={form.author}
            onChange={(e) => set("author", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Publish date">
          <input
            type="date"
            required
            value={form.publishedAt}
            onChange={(e) => set("publishedAt", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Allergen notes" hint="Substitutions and warnings shown on the recipe page.">
        <textarea
          rows={3}
          value={form.allergenNotes}
          onChange={(e) => set("allergenNotes", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="bg-ink text-paper px-5 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save recipe"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-steel px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-mute hover:border-ink hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function SubmissionCard({
  submission,
  busy,
  onPublish,
  onDraft,
  onReject,
}: {
  submission: Submission;
  busy: boolean;
  onPublish: () => void;
  onDraft: () => void;
  onReject: (notes: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");

  return (
    <li className="border border-steel p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl leading-tight">{submission.title}</h3>
          <p className="text-[10px] uppercase tracking-[0.15em] text-mute mt-1">
            {submission.author_name} / {submission.skill} / {submission.time_minutes} min / serves{" "}
            {submission.servings}
          </p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-[10px] uppercase tracking-[0.15em] underline text-mute hover:text-ink"
        >
          {open ? "Hide detail" : "Read it"}
        </button>
      </div>

      <p className="text-sm text-mute leading-relaxed">{submission.blurb}</p>

      {open && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-steel pt-4 text-xs">
          <div className="space-y-2">
            <p className="uppercase tracking-[0.15em] text-mute">Ingredients</p>
            <pre className="whitespace-pre-wrap font-sans leading-relaxed">
              {submission.ingredients}
            </pre>
          </div>
          <div className="space-y-2">
            <p className="uppercase tracking-[0.15em] text-mute">Cookware</p>
            <pre className="whitespace-pre-wrap font-sans leading-relaxed">
              {submission.cookware}
            </pre>
          </div>
          <div className="space-y-2">
            <p className="uppercase tracking-[0.15em] text-mute">Method</p>
            <pre className="whitespace-pre-wrap font-sans leading-relaxed">{submission.method}</pre>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.15em]">
        <button
          disabled={busy}
          onClick={onPublish}
          className="bg-ink text-paper px-4 py-2.5 hover:bg-leaf transition-colors disabled:opacity-50"
        >
          Publish now
        </button>
        <button
          disabled={busy}
          onClick={onDraft}
          className="border border-ink px-4 py-2.5 hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
        >
          Convert to draft
        </button>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Reason (optional)"
          className="border border-steel px-3 py-2 text-xs normal-case tracking-normal flex-1 min-w-[180px]"
        />
        <button
          disabled={busy}
          onClick={() => onReject(notes)}
          className="border border-steel px-4 py-2.5 text-mute hover:border-destructive hover:text-destructive transition-colors disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </li>
  );
}
