import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteChrome";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  dayIndex,
  formatDate,
  formatTime,
  pickRecipeOfTheDay,
  type Recipe,
} from "@/data/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import {
  EMPTY_FILTERS,
  RecipeFilters,
  filterRecipes,
  filtersToSearch,
  type RecipeFilterState,
} from "@/components/RecipeFilters";
import { listPublishedRecipes } from "@/lib/recipes.functions";

import { subscribeToWeekly } from "@/lib/newsletter.functions";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vegan Cook: A New Plant-Based Recipe Every Day" },
      {
        name: "description",
        content:
          "Vegan cooking for allergies and lifestyle choices alike. Filter by skill level and allergens, get five recipes in your inbox every week, and submit your own.",
      },
      { property: "og:title", content: "Vegan Cook: A New Plant-Based Recipe Every Day" },
      {
        property: "og:description",
        content: "Vegan food doesn't have to be boring, and it isn't just salad.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.vegancook.live/" },
      { property: "og:image", content: "https://www.vegancook.live/og-vegan-cook.jpg" },
      { name: "twitter:image", content: "https://www.vegancook.live/og-vegan-cook.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
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



/** How many recipes the home page previews before sending people to /recipes. */
const HOME_PREVIEW_COUNT = 6;

function Index() {
  const allRecipes = Route.useLoaderData() as Recipe[];
  const [filters, setFilters] = useState<RecipeFilterState>(EMPTY_FILTERS);

  const update = (patch: Partial<RecipeFilterState>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const filtered = useMemo(() => filterRecipes(allRecipes, filters), [allRecipes, filters]);
  const preview = filtered.slice(0, HOME_PREVIEW_COUNT);

  // Rotates once per day across the whole catalogue.
  const featured = useMemo(() => pickRecipeOfTheDay(allRecipes), [allRecipes]);

  const todayLabel = useMemo(
    () => formatDate(new Date(dayIndex() * 86_400_000).toISOString().slice(0, 10)),
    [],
  );


  return (
    <div className="bg-paper text-ink min-h-dvh antialiased selection:bg-ink selection:text-paper">
      <SiteHeader />

      {/* Mission statement — top of page */}
      <section className="border-b border-steel px-6 md:px-8 py-12 md:py-16 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <p className="lg:col-span-3 text-[10px] uppercase tracking-[0.15em] text-mute">
            What this is
          </p>
          <div className="lg:col-span-9 space-y-6">
            <h1 className="font-serif text-3xl md:text-5xl leading-[1.1] tracking-tight text-balance max-w-[38ch]">
              Cooking for people with different dietary needs, whether by allergy or by choice.
            </h1>
              <p className="text-mute text-base leading-relaxed max-w-[62ch] text-pretty">
                Vegan food does not have to be boring, and it is not just salad. Everything here is
                fully plant-based, written out properly, and tagged so you can screen out the
                allergens you need to avoid: sulphites, peanuts, soy, gluten and tree nuts. Whether
                you are plant-based yourself or cooking for someone who is, pick a skill level, pick
                what needs avoiding, and cook something worth putting on the table.
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
                <figure className="m-0">
                  <img
                    src={featured.imageUrl}
                    alt={featured.imageAlt || featured.title}
                    className="w-full aspect-[3/2] object-cover border border-steel"
                  />
                  {featured.imageCaption && featured.imageCaption.trim() !== "" && (
                    <figcaption className="mt-2 text-[10px] uppercase tracking-[0.15em] text-mute">
                      {featured.imageCaption}
                    </figcaption>
                  )}
                </figure>
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
              No recipes are published right now. Check back shortly, or send us yours.
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

          <div className="lg:col-span-9">
            <RecipeFilters value={filters} onChange={update} />
          </div>
        </section>

        {/* Collection preview */}
        <section className="px-6 md:px-8 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3">
            <h2 className="font-serif text-2xl tracking-tight">The collection</h2>
            <p className="text-xs text-mute mt-2 max-w-[30ch]">
              {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"} match your filters.
            </p>
          </div>

          <div className="lg:col-span-9 space-y-8">
            {filtered.length === 0 ? (
              <div className="border border-dashed border-steel p-12 text-center text-sm text-mute">
                Nothing matches those constraints. Try loosening a filter.
              </div>
            ) : (
              <>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-steel border border-steel">
                  {preview.map((r) => (
                    <RecipeCard key={r.id} recipe={r} />
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-mute tabular-nums">
                    Showing {preview.length} of {filtered.length}
                  </p>
                  {filtered.length > preview.length ? (
                    <Link
                      to="/recipes"
                      search={filtersToSearch(filters)}
                      className="bg-ink text-paper px-5 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors"
                    >
                      See all {filtered.length} matching recipes
                    </Link>
                  ) : (
                    <Link
                      to="/recipes"
                      className="text-[10px] uppercase tracking-[0.15em] text-mute underline hover:text-ink transition-colors"
                    >
                      Browse all {allRecipes.length} recipes
                    </Link>
                  )}
                </div>
              </>
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
              Five plant-based recipes every Sunday, enough to plan the week. No offers, no
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
              Ingredients, method, cookware and allergens. The form checks every line and will
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
        <span>Recipes for every day plant based cooking</span>
        <div className="flex gap-6 items-center">
          <span className="tabular-nums">{allRecipes.length} recipes in the collection</span>
          <Link to="/recipes" className="hover:text-ink transition-colors">
            Recipes
          </Link>
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
