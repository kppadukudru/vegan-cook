import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ALL_ALLERGENS, type Allergen, type Skill } from "@/data/recipes";
import { describeNonVeganHits, findNonVeganTerms } from "@/lib/vegan-check";
import { submitRecipe } from "@/lib/submissions.functions";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit a Recipe — Vegan Cook" },
      {
        name: "description",
        content:
          "Share your own plant-based recipe. Ingredients, method, cookware and allergen details — reviewed before it joins the collection.",
      },
      { property: "og:title", content: "Submit a Recipe — Vegan Cook" },
      {
        property: "og:description",
        content: "Send in your own fully plant-based recipe for review.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubmitPage,
});

const SKILLS: Skill[] = ["Beginner", "Intermediate", "Expert"];

const initialForm = {
  title: "",
  authorName: "",
  email: "",
  skill: "Beginner" as Skill,
  timeMinutes: "30",
  servings: "4",
  blurb: "",
  ingredients: "",
  cookware: "",
  method: "",
  allergenNotes: "",
};

function SubmitPage() {
  const submit = useServerFn(submitRecipe);
  const [form, setForm] = useState(initialForm);
  const [allergens, setAllergens] = useState<Set<Allergen>>(new Set());
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = <K extends keyof typeof initialForm>(key: K, value: (typeof initialForm)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleAllergen = (a: Allergen) =>
    setAllergens((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;

    // Instant client-side vegan guard (re-checked on the server).
    const hits = findNonVeganTerms([
      ...form.ingredients.split("\n"),
      ...form.method.split("\n"),
      form.title,
    ]);
    if (hits.length > 0) {
      setState("error");
      setMessage(describeNonVeganHits(hits));
      return;
    }

    setState("sending");
    setMessage("");
    try {
      const res = await submit({
        data: {
          ...form,
          timeMinutes: Number(form.timeMinutes),
          servings: Number(form.servings),
          allergens: [...allergens],
        },
      });
      if (res.ok) {
        setState("done");
        setMessage(res.message);
        setForm(initialForm);
        setAllergens(new Set());
      } else {
        setState("error");
        setMessage(res.message);
      }
    } catch {
      setState("error");
      setMessage("Something went wrong. Check the fields and try again.");
    }
  };

  return (
    <div className="bg-paper text-ink min-h-dvh antialiased selection:bg-ink selection:text-paper">
      <header className="border-b border-steel px-6 md:px-8 py-5 flex items-center justify-between uppercase text-[10px] tracking-[0.15em] font-medium">
        <div className="flex gap-8 md:gap-12 items-center">
          <Link to="/" className="font-serif text-xl tracking-tight normal-case">
            Vegan Cook
          </Link>
          <nav className="hidden md:flex gap-8 text-mute">
            <Link to="/" className="hover:text-ink transition-colors">
              Recipes
            </Link>
          </nav>
        </div>
        <Link to="/" className="text-mute hover:text-ink transition-colors flex items-center gap-2">
          <span aria-hidden>←</span> Back
        </Link>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-6">
          <h1 className="font-serif text-4xl md:text-5xl leading-[1.05] tracking-tight text-balance">
            Submit your own recipe
          </h1>
          <p className="text-mute text-sm leading-relaxed text-pretty">
            Write it the way you'd want to read it: real quantities, real steps, and an honest
            allergen list. Every submission is reviewed by hand before it's published.
          </p>
          <div className="border-l-2 border-leaf pl-5 py-1 space-y-2">
            <p className="text-[10px] uppercase tracking-[0.15em] text-mute">Plant-based only</p>
            <p className="text-sm leading-relaxed">
              The form scans your ingredients and method for animal products — dairy, eggs, meat,
              fish, honey and gelatine included — and won't accept the recipe until they're gone.
              Plant-based versions like oat milk, vegan butter or aquafaba are fine.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="lg:col-span-8 space-y-10">
          <Field label="Recipe title">
            <input
              required
              maxLength={160}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Smoky butter bean stew"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Your name">
              <input
                required
                maxLength={80}
                value={form.authorName}
                onChange={(e) => set("authorName", e.target.value)}
                placeholder="How we should credit you"
                className={inputClass}
              />
            </Field>
            <Field label="Your email">
              <input
                required
                type="email"
                maxLength={255}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Skill level">
              <select
                value={form.skill}
                onChange={(e) => set("skill", e.target.value as Skill)}
                className={inputClass}
              >
                {SKILLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Total time (minutes)">
              <input
                required
                type="number"
                min={1}
                max={2880}
                value={form.timeMinutes}
                onChange={(e) => set("timeMinutes", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Servings">
              <input
                required
                type="number"
                min={1}
                max={50}
                value={form.servings}
                onChange={(e) => set("servings", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Short description" hint="A couple of sentences on what it tastes like.">
            <textarea
              required
              rows={3}
              maxLength={600}
              value={form.blurb}
              onChange={(e) => set("blurb", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Ingredients" hint="One per line, quantity first.">
            <textarea
              required
              rows={8}
              maxLength={4000}
              value={form.ingredients}
              onChange={(e) => set("ingredients", e.target.value)}
              placeholder={"400 g tinned butter beans, drained\n2 tbsp olive oil\n1 tsp smoked paprika"}
              className={inputClass}
            />
          </Field>

          <Field label="Cookware" hint="One per line.">
            <textarea
              required
              rows={4}
              maxLength={2000}
              value={form.cookware}
              onChange={(e) => set("cookware", e.target.value)}
              placeholder={"Heavy saucepan\nWooden spoon"}
              className={inputClass}
            />
          </Field>

          <Field label="Method" hint="One step per line, in order.">
            <textarea
              required
              rows={10}
              maxLength={8000}
              value={form.method}
              onChange={(e) => set("method", e.target.value)}
              placeholder={"Warm the oil and soften the onion.\nAdd the beans and stock, simmer 20 minutes."}
              className={inputClass}
            />
          </Field>

          <fieldset className="space-y-4">
            <legend className="text-[10px] uppercase tracking-[0.15em] text-mute border-b border-steel pb-2 block w-full">
              Allergens this recipe contains
            </legend>
            <div className="flex flex-wrap gap-2">
              {ALL_ALLERGENS.map((a) => {
                const active = allergens.has(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAllergen(a)}
                    aria-pressed={active}
                    className={`px-4 py-2 text-xs flex items-center gap-2 transition-colors ${
                      active
                        ? "border border-ink bg-ink text-paper"
                        : "border border-steel text-mute hover:border-ink hover:text-ink"
                    }`}
                  >
                    <span
                      className={`block size-1.5 ${active ? "bg-paper" : "border border-mute"}`}
                    />
                    {a}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field label="Allergen or swap notes" hint="Optional. Substitutions, packaging warnings.">
            <textarea
              rows={3}
              maxLength={1000}
              value={form.allergenNotes}
              onChange={(e) => set("allergenNotes", e.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="flex flex-col gap-4 border-t border-steel pt-8">
            <button
              type="submit"
              disabled={state === "sending"}
              className="self-start bg-ink text-paper px-6 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors disabled:opacity-60"
            >
              {state === "sending" ? "Sending…" : "Submit for review"}
            </button>
            {message && (
              <p
                role="status"
                className={`text-sm leading-relaxed max-w-[68ch] ${
                  state === "error" ? "text-destructive" : "text-leaf"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </form>
      </main>

      <footer className="border-t border-steel px-6 md:px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[10px] uppercase tracking-[0.15em] text-mute">
        <span>Vegan Cook — plant-based cooking, every day.</span>
        <Link to="/" className="hover:text-ink transition-colors">
          ← All recipes
        </Link>
      </footer>
    </div>
  );
}

const inputClass =
  "w-full border border-steel bg-paper px-4 py-3 text-sm outline-none focus:border-ink transition-colors";

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
    <label className="block space-y-3">
      <span className="text-[10px] uppercase tracking-[0.15em] text-mute border-b border-steel pb-2 flex items-baseline justify-between gap-4">
        <span>{label}</span>
        {hint && <span className="normal-case tracking-normal text-[11px]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
