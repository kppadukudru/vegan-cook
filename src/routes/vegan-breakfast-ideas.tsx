import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { listPublishedRecipes } from "@/lib/recipes.functions";
import { ALL_ALLERGENS, type Allergen, type Recipe } from "@/data/recipes";

const URL = "https://www.vegancook.live/vegan-breakfast-ideas";
const TITLE = "Vegan Breakfast Ideas — Allergy-Friendly, Tested Recipes";
const DESCRIPTION =
  "A working collection of vegan breakfast ideas, from ten-minute toast to fermented dosa, each one filterable by gluten, soy, peanut, tree nut and sulphite.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "What is a good vegan breakfast if you are in a hurry?",
    a: "Smashed avocado toast and vanilla chia pudding both come together in about ten minutes, and the chia pudding can be soaked the night before so it is ready when you wake up.",
  },
  {
    q: "Which vegan breakfasts are gluten-free?",
    a: "Dosa, idli and the chia recipes are naturally gluten-free. They are built on rice, lentils, chia and fruit rather than wheat. Use the allergen filter on this page to see the current list.",
  },
  {
    q: "Can you eat a vegan breakfast with a soy allergy?",
    a: "Yes. Soy shows up mainly in tofu scrambles and soy milk, both of which are easy to swap. Oat or coconut milk works in every drink and batter on this page, and none of these recipes depend on tofu.",
  },
  {
    q: "How do you get protein into a vegan breakfast?",
    a: "Lentil and rice batters such as idli and dosa, chia seeds, nut butters and legume-based fillings all carry real protein. Pairing a grain with a pulse in the same meal is the simplest habit to build.",
  },
];

export const Route = createFileRoute("/vegan-breakfast-ideas")({
  loader: () => listPublishedRecipes(),
  head: ({ loaderData }) => {
    const breakfasts = ((loaderData as Recipe[] | undefined) ?? []).filter((r) =>
      r.mealTypes.includes("Breakfast"),
    );
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:type", content: "website" },
        { property: "og:url", content: URL },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: URL }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Vegan breakfast ideas",
            description: DESCRIPTION,
            itemListElement: breakfasts.map((r, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: r.title,
              url: `https://www.vegancook.live/recipes/${r.id}`,
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  errorComponent: () => (
    <div className="bg-paper text-ink min-h-dvh grid place-items-center px-6">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="font-serif text-3xl tracking-tight">Breakfast is briefly off the menu</h1>
        <p className="text-sm text-mute">We couldn't load the collection just now. Please refresh.</p>
      </div>
    </div>
  ),
  component: BreakfastCollection,
});

function BreakfastCollection() {
  const all = Route.useLoaderData() as Recipe[];
  const [avoid, setAvoid] = useState<Allergen[]>([]);

  const breakfasts = useMemo(
    () => all.filter((r) => r.mealTypes.includes("Breakfast")),
    [all],
  );

  const shown = useMemo(
    () => breakfasts.filter((r) => !avoid.some((a) => r.contains.includes(a))),
    [breakfasts, avoid],
  );

  const toggle = (a: Allergen) =>
    setAvoid((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const quick = breakfasts.filter((r) => r.timeMinutes <= 15);

  return (
    <div className="bg-paper text-ink min-h-dvh antialiased">
      <SiteHeader />

      <section className="border-b border-steel px-6 md:px-8 py-12 md:py-16 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <p className="lg:col-span-3 text-[10px] uppercase tracking-[0.15em] text-mute">
            Collection — Breakfast
          </p>
          <div className="lg:col-span-9 space-y-6">
            <h1 className="font-serif text-3xl md:text-5xl leading-[1.1] tracking-tight text-balance max-w-[38ch]">
              Vegan breakfast ideas that hold up on a weekday morning.
            </h1>
            <p className="text-mute text-base leading-relaxed max-w-[62ch] text-pretty">
              {breakfasts.length} tested plant-based breakfasts from this catalogue. There is toast you can
              make before the kettle boils, fermented South Indian batters worth planning ahead for,
              and overnight puddings that are waiting for you. Every one lists exactly what it
              contains, so if you are avoiding gluten, soy, peanuts, tree nuts or sulphites you can
              filter the list down to what is safe for you rather than reading the small print on
              each recipe.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <aside className="lg:col-span-3 space-y-8">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.15em] text-mute border-b border-steel pb-2 block w-full">
              Avoid ingredients
            </span>
            <div className="flex flex-wrap gap-2">
              {ALL_ALLERGENS.map((a) => (
                <button
                  key={a}
                  onClick={() => toggle(a)}
                  aria-pressed={avoid.includes(a)}
                  className={`px-4 py-2 text-xs transition-colors ${
                    avoid.includes(a)
                      ? "border border-ink bg-ink text-paper"
                      : "border border-steel text-mute hover:border-ink hover:text-ink"
                  }`}
                >
                  No {a.toLowerCase()}
                </button>
              ))}
            </div>
            <p className="text-xs text-mute">
              Showing {shown.length} of {breakfasts.length}
            </p>
          </div>

          {quick.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.15em] text-mute border-b border-steel pb-2 block w-full">
                Under 15 minutes
              </span>
              <ul className="space-y-2 text-xs text-mute">
                {quick.map((r) => (
                  <li key={r.id}>
                    <Link
                      to="/recipes/$id"
                      params={{ id: r.id }}
                      className="hover:text-ink transition-colors"
                    >
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div className="lg:col-span-9 space-y-16">
          {shown.length === 0 ? (
            <div className="border border-dashed border-steel p-12 text-center text-sm text-mute">
              Nothing in the breakfast collection avoids all of those at once yet. Try removing a
              filter, or{" "}
              <Link to="/submit" className="underline hover:text-ink">
                submit a recipe
              </Link>{" "}
              that does.
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-steel border border-steel">
              {shown.map((r) => (
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
                    <div className="flex items-center justify-between gap-4 text-[9px] uppercase tracking-[0.1em] text-mute">
                      <span>{r.skill}</span>
                      <span className="tabular-nums">{r.timeMinutes} min</span>
                    </div>
                    <h2 className="font-serif text-xl leading-tight tracking-tight text-balance group-hover:text-leaf transition-colors">
                      {r.title}
                    </h2>
                    <p className="text-xs text-mute leading-relaxed line-clamp-4">{r.blurb}</p>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-mute mt-auto pt-4 border-t border-steel">
                      {r.contains.length === 0
                        ? "Free from all five allergens"
                        : `Contains ${r.contains.join(", ").toLowerCase()}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <section className="space-y-6 max-w-[68ch]">
            <h2 className="font-serif text-2xl md:text-3xl tracking-tight">
              How to build a vegan breakfast you'll actually repeat
            </h2>
            <div className="space-y-4 text-sm text-mute leading-relaxed">
              <p>
                <strong className="text-ink font-medium">Pick a base that keeps.</strong> Cooked
                grains, a jar of soaked chia, or a fermenting rice-and-lentil batter all sit in the
                fridge and turn into breakfast in minutes. Most of the ten-minute recipes here are
                really assembly jobs on top of something you prepared once.
              </p>
              <p>
                <strong className="text-ink font-medium">Add a pulse or a seed.</strong> This is
                what stops a plant-based breakfast falling apart by eleven. Lentils in idli and
                dosa, chia and nut butters on toast, chickpea flour in a savoury pancake. A grain
                plus a pulse is the whole trick.
              </p>
              <p>
                <strong className="text-ink font-medium">Swap milk, don't skip it.</strong> Oat milk
                is the closest match for batters and coffee, coconut milk carries fruit and spice
                well, and almond is thin but useful. If you are avoiding tree nuts, oat and rice milks
                keep every recipe on this page open to you.
              </p>
              <p>
                <strong className="text-ink font-medium">Know your labels.</strong> Sulphites hide in
                dried fruit, soy in bread and spreads, gluten in semolina as well as wheat flour.
                Every recipe here spells out what it contains, and the filter above does the reading
                for you.
              </p>
            </div>
          </section>

          <section className="space-y-6 max-w-[68ch]">
            <h2 className="font-serif text-2xl md:text-3xl tracking-tight">
              Vegan breakfast questions
            </h2>
            <dl className="divide-y divide-steel border-t border-steel">
              {FAQ.map((f) => (
                <div key={f.q} className="py-5 space-y-2">
                  <dt className="text-sm font-medium text-ink">{f.q}</dt>
                  <dd className="text-sm text-mute leading-relaxed">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="border border-steel p-8 space-y-3">
            <h2 className="font-serif text-2xl tracking-tight">
              Five recipes for the week, every Sunday
            </h2>
            <p className="text-sm text-mute leading-relaxed max-w-[58ch]">
              The weekly newsletter plans your week for you, breakfasts included and allergens always
              listed.
            </p>
            <Link
              to="/"
              hash="weekly"
              className="inline-block bg-ink text-paper px-4 py-2 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors"
            >
              Get the weekly newsletter
            </Link>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
