import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileNav } from "@/components/MobileNav";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  ALL_ALLERGENS,
  ALL_CUISINES,
  ALL_MEAL_TYPES,
  ALL_SPICE_LEVELS,
  dayIndex,
  formatDate,
  formatTime,
  pickRecipeOfTheDay,
  type Allergen,
  type Cuisine,
  type MealType,
  type Recipe,
  type Skill,
  type SpiceLevel,
} from "@/data/recipes";
import { listPublishedRecipes } from "@/lib/recipes.functions";
import { subscribeToWeekly } from "@/lib/newsletter.functions";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vegan Cook — A New Plant-Based Recipe Every Day" },
      {
        name: "description",
        content:
          "Vegan cooking for allergies and lifestyle choices alike. Filter by skill level and allergens, get five recipes in your inbox every week, and submit your own.",
      },
      { property: "og:title", content: "Vegan Cook — A New Plant-Based Recipe Every Day" },
      {
        property: "og:description",
        content: "Vegan food doesn't have to be boring, and it isn't just salad.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.vegancook.live/" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://www.vegancook.live/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Vegan Cook",
          url: "https://www.vegancook.live/",
          description:
            "Vegan cooking for allergies and lifestyle choices alike. Filter by skill level and allergens, get five recipes in your inbox every week, and submit your own.",
          publisher: {
            "@type": "Organization",
            name: "Vegan Cook",
            url: "https://www.vegancook.live/",
          },
        }),
      },
    ],
  }),
  loader: () => listPublishedRecipes(),
  errorComponent: () => (
    <div className="bg-paper text-ink min-h-dvh grid place-items-center px-6">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="font-serif text-3xl tracking-tight">The kitchen is briefly closed</h1>
        <p className="text-sm text-mute">
          We couldn't load the recipe collection just now. Please refresh in a moment.
        </p>
      </div>
    </div>
  ),
  component: Index,
});



const SKILLS: Skill[] = ["Beginner", "Intermediate", "Expert"];

function Index() {
  const allRecipes = Route.useLoaderData() as Recipe[];
  const [skill, setSkill] = useState<Skill | "All">("All");
  const [avoid, setAvoid] = useState<Set<Allergen>>(new Set());
  const [cuisine, setCuisine] = useState<Cuisine | "All">("All");
  const [spice, setSpice] = useState<SpiceLevel | "All">("All");
  const [meal, setMeal] = useState<MealType | "All">("All");

  const filtered = useMemo(() => {
    return allRecipes.filter((r) => {
      if (skill !== "All" && r.skill !== skill) return false;
      if (cuisine !== "All" && r.cuisine !== cuisine) return false;
      if (spice !== "All" && r.spiceLevel !== spice) return false;
      if (meal !== "All" && !r.mealTypes.includes(meal)) return false;
      for (const a of avoid) if (r.contains.includes(a)) return false;
      return true;
    });
  }, [allRecipes, skill, avoid, cuisine, spice, meal]);


  // Rotates once per day across the whole catalogue.
  const featured = useMemo(() => pickRecipeOfTheDay(allRecipes), [allRecipes]);

  const todayLabel = useMemo(
    () => formatDate(new Date(dayIndex() * 86_400_000).toISOString().slice(0, 10)),
    [],
  );

  const toggleAllergen = (a: Allergen) => {
    setAvoid((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  };

  return (
    <div className="bg-paper text-ink min-h-dvh antialiased selection:bg-ink selection:text-paper">
      <header className="border-b border-steel px-6 md:px-8 py-5 flex items-center justify-between uppercase text-[10px] tracking-[0.15em] font-medium">
        <div className="flex gap-8 md:gap-12 items-center">
          <MobileNav />
          <span className="font-serif text-xl tracking-tight normal-case">Vegan Cook</span>
          <nav className="hidden md:flex gap-8 text-mute">
            <a href="#archive" className="hover:text-ink transition-colors">
              Recipes
            </a>
            <Link to="/vegan-breakfast-ideas" className="hover:text-ink transition-colors">
              Breakfast
            </Link>
            <Link to="/journal" className="hover:text-ink transition-colors">
              Journal
            </Link>
            <Link to="/about" className="hover:text-ink transition-colors">
              About
            </Link>
            <Link to="/submit" className="hover:text-ink transition-colors">
              Submit a recipe
            </Link>
            <a href="#weekly" className="hover:text-ink transition-colors">
              Weekly newsletter
            </a>
          </nav>
        </div>
        <a
          href="#weekly"
          className="bg-ink text-paper px-4 py-2 hover:bg-leaf transition-colors"
        >
          Get the weekly newsletter
        </a>
      </header>

      {/* Mission statement — top of page */}
      <section className="border-b border-steel px-6 md:px-8 py-12 md:py-16 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <p className="lg:col-span-3 text-[10px] uppercase tracking-[0.15em] text-mute">
            What this is
          </p>
          <div className="lg:col-span-9 space-y-6">
            <h1 className="font-serif text-3xl md:text-5xl leading-[1.1] tracking-tight text-balance max-w-[38ch]">
              Cooking for people with different dietary needs — by allergy, or by choice.
            </h1>
            <p className="text-mute text-base leading-relaxed max-w-[62ch] text-pretty">
              Vegan food does not have to be boring, and it is not just salad. Everything here is
              fully plant-based, written out properly, and tagged so you can screen out the
              allergens you need to avoid — sulphites, peanuts, soy, gluten, tree nuts. Pick a
              skill level, pick what you can eat, and cook something you actually want to eat.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-[1440px] mx-auto">
        {/* Recipe of the day */}
        {featured ? (
          <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-steel">
            <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-steel p-8 lg:p-12 space-y-10">
              <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.15em] text-mute">
                <span className="inline-block size-1.5 bg-leaf" />
                <span>Recipe of the day</span>
                <span className="text-steel">/</span>
                <span className="tabular-nums">{todayLabel}</span>
              </div>

              <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] tracking-tight text-balance">
                {featured.title}
              </h2>

              <p className="text-mute max-w-[52ch] text-base leading-relaxed text-pretty">
                {featured.blurb}
              </p>

              {featured.imageUrl && (
                <img
                  src={featured.imageUrl}
                  alt={featured.imageAlt || featured.title}
                  className="w-full aspect-[3/2] object-cover border border-steel"
                />
              )}

              <Link
                to="/recipes/$id"
                params={{ id: featured.id }}
                className="inline-block bg-ink text-paper px-5 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors"
              >
                Read the full recipe
              </Link>
            </div>

            <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between gap-8">
              <div className="grid grid-cols-2 gap-px bg-steel border border-steel">
                <Cell label="Time" value={formatTime(featured.timeMinutes)} />
                <Cell label="Skill" value={featured.skill} />
                <Cell label="Serves" value={String(featured.servings)} />
                <Cell label="Cuisine" value={featured.cuisine ?? "—"} />
                <Cell label="Spice" value={featured.spiceLevel ?? "—"} />
                <Cell
                  label="Calories"
                  value={featured.calories != null ? `${featured.calories} / serving` : "—"}
                />
                <Cell
                  label="Contains"
                  value={
                    featured.contains.length === 0 ? "None declared" : featured.contains.join(", ")
                  }
                />

              </div>
              <p className="text-xs text-mute leading-relaxed">
                A different recipe is featured every day, drawn in rotation from the whole
                collection. Today's is {featured.skill.toLowerCase()} level and takes about{" "}
                {formatTime(featured.timeMinutes)}.
              </p>
            </div>
          </section>
        ) : (
          <section className="border-b border-steel p-8 lg:p-12 space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.15em] text-mute">
              <span className="inline-block size-1.5 bg-leaf" />
              <span>Recipe of the day</span>
              <span className="text-steel">/</span>
              <span className="tabular-nums">{todayLabel}</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl tracking-tight">
              The collection is being restocked.
            </h2>
            <p className="text-sm text-mute max-w-[52ch] leading-relaxed">
              No recipes are published right now. Check back shortly — or send us yours.
            </p>
          </section>
        )}


        {/* Filters */}
        <section
          id="archive"
          className="px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 scroll-mt-8"
        >
          <div className="lg:col-span-3">
            <h2 className="font-serif text-2xl tracking-tight">Find something to cook</h2>
            <p className="text-xs text-mute mt-2 max-w-[30ch]">
              Filter by how confident you feel in the kitchen, and by what you need to avoid.
            </p>
          </div>

          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4 order-1">
              <span className="text-[10px] uppercase tracking-[0.15em] text-mute border-b border-steel pb-2 block w-full">
                Cooking skill
              </span>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={skill === "All"} onClick={() => setSkill("All")}>
                  All
                </FilterChip>
                {SKILLS.map((s) => (
                  <FilterChip key={s} active={skill === s} onClick={() => setSkill(s)}>
                    {s}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="space-y-4 order-5">
              <span className="text-[10px] uppercase tracking-[0.15em] text-mute border-b border-steel pb-2 block w-full">
                Avoid these allergens
              </span>
              <div className="flex flex-wrap gap-2">
                {ALL_ALLERGENS.map((a) => {
                  const active = avoid.has(a);
                  return (
                    <button
                      key={a}
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
            </div>

            <div className="space-y-4 order-2">
              <span className="text-[10px] uppercase tracking-[0.15em] text-mute border-b border-steel pb-2 block w-full">
                Cuisine
              </span>
              <div className="flex flex-wrap gap-2">
                {(["All", ...ALL_CUISINES] as (Cuisine | "All")[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCuisine(c)}
                    aria-pressed={cuisine === c}
                    className={`px-4 py-2 text-xs transition-colors ${
                      cuisine === c
                        ? "border border-ink bg-ink text-paper"
                        : "border border-steel text-mute hover:border-ink hover:text-ink"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 order-4">
              <span className="text-[10px] uppercase tracking-[0.15em] text-mute border-b border-steel pb-2 block w-full">
                Spice level
              </span>
              <div className="flex flex-wrap gap-2">
                {(["All", ...ALL_SPICE_LEVELS] as (SpiceLevel | "All")[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpice(s)}
                    aria-pressed={spice === s}
                    className={`px-4 py-2 text-xs transition-colors ${
                      spice === s
                        ? "border border-ink bg-ink text-paper"
                        : "border border-steel text-mute hover:border-ink hover:text-ink"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 order-3">
              <span className="text-[10px] uppercase tracking-[0.15em] text-mute border-b border-steel pb-2 block w-full">
                Meal
              </span>
              <div className="flex flex-wrap gap-2">
                {(["All", ...ALL_MEAL_TYPES] as (MealType | "All")[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMeal(m)}
                    aria-pressed={meal === m}
                    className={`px-4 py-2 text-xs transition-colors ${
                      meal === m
                        ? "border border-ink bg-ink text-paper"
                        : "border border-steel text-mute hover:border-ink hover:text-ink"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </section>

        {/* Collection */}
        <section className="px-6 md:px-8 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3">
            <h2 className="font-serif text-2xl tracking-tight">The collection</h2>
            <p className="text-xs text-mute mt-2 max-w-[30ch]">
              {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"} match your filters.
            </p>
          </div>

          <div className="lg:col-span-9">
            {filtered.length === 0 ? (
              <div className="border border-dashed border-steel p-12 text-center text-sm text-mute">
                Nothing matches those constraints. Try loosening a filter.
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-steel border border-steel">
                {filtered.map((r) => (
                  <li key={r.id} className="bg-paper">
                    <Link
                      to="/recipes/$id"
                      params={{ id: r.id }}
                      className="p-6 h-full flex flex-col gap-4 group hover:bg-secondary transition-colors"
                    >
                      {r.imageUrl && (
                        <img
                          src={r.imageUrl}
                          alt={r.imageAlt || r.title}
                          loading="lazy"
                          className="w-full aspect-[3/2] object-cover border border-steel"
                        />
                      )}
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-serif text-xl leading-tight tracking-tight text-balance group-hover:text-leaf transition-colors">
                          {r.title}
                        </h3>
                        <span className="text-[9px] uppercase tracking-[0.1em] text-mute shrink-0 mt-1">
                          {r.skill}
                        </span>
                      </div>
                      <p className="text-xs text-mute leading-relaxed line-clamp-3">{r.blurb}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] uppercase tracking-[0.1em] text-mute">
                        {r.cuisine && <span>{r.cuisine}</span>}
                        {r.spiceLevel && <span>{r.spiceLevel} spice</span>}
                        {r.mealTypes.length > 0 && <span>{r.mealTypes.join(" / ")}</span>}
                        {r.calories != null && <span className="tabular-nums">{r.calories} kcal</span>}
                      </div>
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-mute mt-auto pt-4 border-t border-steel">
                        <span className="tabular-nums">{formatTime(r.timeMinutes)}</span>
                        <span>
                          {r.contains.length === 0
                            ? "No declared allergens"
                            : `Contains ${r.contains.join(", ")}`}
                        </span>
                      </div>

                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Weekly newsletter */}
        <section
          id="weekly"
          className="border-t border-steel px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 scroll-mt-8"
        >
          <div className="lg:col-span-3">
            <h2 className="font-serif text-2xl tracking-tight">The weekly newsletter</h2>
            <p className="text-xs text-mute mt-2 max-w-[30ch]">
              Five plant-based recipes every Sunday — enough to plan the week. No offers, no
              digests.
            </p>
          </div>
          <div className="lg:col-span-9">
            <SubscribeForm />
          </div>
        </section>

        {/* Submit CTA */}
        <section className="border-t border-steel px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3">
            <h2 className="font-serif text-2xl tracking-tight">Submit your own recipe</h2>
            <p className="text-xs text-mute mt-2 max-w-[30ch]">
              Cooked something worth sharing? Send it in and we'll review it before it joins the
              collection.
            </p>
          </div>
          <div className="lg:col-span-9 flex flex-col md:flex-row md:items-end justify-between gap-6 border border-steel p-8">
            <p className="text-sm text-mute max-w-[52ch] leading-relaxed">
              Ingredients, method, cookware and allergens — the form checks every line and will
              reject anything that isn't fully plant-based.
            </p>
            <Link
              to="/submit"
              className="shrink-0 bg-ink text-paper px-5 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors"
            >
              Open the form
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-steel px-6 md:px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[10px] uppercase tracking-[0.15em] text-mute">
        <span>Vegan Cook — plant-based cooking, every day.</span>
        <div className="flex gap-6 items-center">
          <span className="tabular-nums">{allRecipes.length} recipes in the collection</span>
          <Link to="/journal" className="hover:text-ink transition-colors">
            Journal
          </Link>
          <Link to="/about" className="hover:text-ink transition-colors">
            About
          </Link>
          <Link to="/auth" className="hover:text-ink transition-colors">
            Editor
          </Link>
        </div>
      </footer>
    </div>
  );
}

function SubscribeForm() {
  const subscribe = useServerFn(subscribeToWeekly);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setMessage("");
    try {
      const res = await subscribe({ data: { email } });
      if (res.ok) {
        setState("done");
        setEmail("");
      } else {
        setState("error");
      }
      setMessage(res.message);
    } catch {
      setState("error");
      setMessage("Something went wrong. Please check the address and try again.");
    }
  };

  return (
    <div className="border border-steel p-8 space-y-4">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-px bg-steel">
        <label htmlFor="weekly-email" className="sr-only">
          Email address
        </label>
        <input
          id="weekly-email"
          type="email"
          required
          maxLength={255}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 bg-paper px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-ink"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="bg-ink text-paper px-6 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors disabled:opacity-60"
        >
          {state === "sending" ? "Signing up…" : "Send me the weekly newsletter"}
        </button>
      </form>
      {message && (
        <p
          role="status"
          className={`text-xs leading-relaxed ${state === "error" ? "text-destructive" : "text-leaf"}`}
        >
          {message}
        </p>
      )}
      <p className="text-[10px] uppercase tracking-[0.15em] text-mute">
        One email a week, five recipes. Unsubscribe whenever.
      </p>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper p-5 flex flex-col gap-1">
      <span className="text-[9px] uppercase tracking-[0.1em] text-mute">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function FilterChip({
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
      aria-pressed={active}
      className={`px-4 py-2 text-xs transition-colors ${
        active
          ? "border border-ink bg-ink text-paper"
          : "border border-steel text-mute hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
