import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { RecipeCard } from "@/components/RecipeCard";
import { listPublishedRecipes } from "@/lib/recipes.functions";
import { ALL_MEAL_TYPES, type MealType, type Recipe } from "@/data/recipes";

const URL = "https://www.vegancook.live/gluten-free-vegan-recipes";
const TITLE = "Gluten-Free Vegan Recipes — Tested and Allergen-Tagged";
const DESCRIPTION =
  "Every gluten-free vegan recipe in the Vegan Cook collection, each one tagged with exactly what it contains so you can cook without reading the small print twice.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "How do you know these vegan recipes are gluten-free?",
    a: "Every recipe in this catalogue is tagged with the allergens it contains, ingredient by ingredient, when it is written up. This page shows only the recipes with no gluten tag, so nothing here relies on wheat, barley, rye, spelt or semolina.",
  },
  {
    q: "Which cuisines are easiest to cook gluten-free and vegan?",
    a: "South Indian cooking is the strongest starting point: dosa, idli and most dals are built on rice and lentils rather than wheat. Middle Eastern mezze, Mexican corn-based dishes and Thai rice-noodle cooking are close behind.",
  },
  {
    q: "What replaces wheat flour in gluten-free vegan baking?",
    a: "There is no single swap. Rice flour gives structure, chickpea flour adds protein and browning, and a little tapioca or potato starch supplies the stretch gluten normally provides. Recipes here specify the flour they need rather than assuming a blend.",
  },
  {
    q: "Do I still need to check labels?",
    a: "Yes, on packaged goods. Soy sauce, stock cubes, oats and spice blends are the usual culprits. Buy tamari instead of soy sauce and certified gluten-free oats, and check anything pre-mixed.",
  },
  {
    q: "Can a recipe be gluten-free and also free of soy or nuts?",
    a: "Many are. Use the meal filter on this page to narrow the list, then open a recipe to see its full allergen line, or use the allergen filters on the main recipes page to screen out several at once.",
  },
];

export const Route = createFileRoute("/gluten-free-vegan-recipes")({
  loader: () => listPublishedRecipes(),
  head: ({ loaderData }) => {
    const items = ((loaderData as Recipe[] | undefined) ?? []).filter(
      (r) => !r.contains.includes("Gluten"),
    );
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:type", content: "website" },
        { property: "og:url", content: URL },
        { property: "og:image", content: "https://www.vegancook.live/og-vegan-cook.jpg" },
        { name: "twitter:image", content: "https://www.vegancook.live/og-vegan-cook.jpg" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: URL }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Gluten-free vegan recipes",
            description: DESCRIPTION,
            itemListElement: items.slice(0, 100).map((r, i) => ({
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
        <h1 className="font-serif text-3xl tracking-tight">This collection is briefly closed</h1>
        <p className="text-sm text-mute">We couldn't load the recipes just now. Please refresh.</p>
      </div>
    </div>
  ),
  component: GlutenFreeCollection,
});

function GlutenFreeCollection() {
  const all = Route.useLoaderData() as Recipe[];
  const [meal, setMeal] = useState<MealType | "All">("All");

  const glutenFree = useMemo(() => all.filter((r) => !r.contains.includes("Gluten")), [all]);

  const shown = useMemo(
    () => (meal === "All" ? glutenFree : glutenFree.filter((r) => r.mealTypes.includes(meal))),
    [glutenFree, meal],
  );

  const noOtherAllergens = glutenFree.filter((r) => r.contains.length === 0);

  return (
    <div className="bg-paper text-ink min-h-dvh antialiased">
      <SiteHeader />

      <section className="border-b border-steel px-6 md:px-8 py-12 md:py-16 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <p className="lg:col-span-3 text-[10px] uppercase tracking-[0.15em] text-mute">
            Collection — Gluten-free
          </p>
          <div className="lg:col-span-9 space-y-6">
            <h1 className="font-serif text-3xl md:text-5xl leading-[1.1] tracking-tight text-balance max-w-[38ch]">
              Gluten-free vegan recipes, tagged so you don't have to guess.
            </h1>
            <p className="text-mute text-base leading-relaxed max-w-[62ch] text-pretty">
              {glutenFree.length} of the {all.length} recipes in this catalogue contain no gluten at
              all. Every recipe here is tagged with the allergens it does contain, checked line by
              line when it is written up, so you can see at a glance whether a dish is safe rather
              than reading a method twice to hunt for hidden wheat. {noOtherAllergens.length} of
              them are free from all five of the allergens we track.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <aside className="lg:col-span-3 space-y-8">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.15em] text-mute border-b border-steel pb-2 block w-full">
              Meal
            </span>
            <div className="flex flex-wrap gap-2">
              {(["All", ...ALL_MEAL_TYPES] as const).map((m) => (
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
            <p className="text-xs text-mute">
              Showing {shown.length} of {glutenFree.length}
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.15em] text-mute border-b border-steel pb-2 block w-full">
              Need more filters?
            </span>
            <Link
              to="/recipes"
              search={{ avoid: "Gluten" }}
              className="block text-xs text-mute hover:text-ink transition-colors"
            >
              Open the full archive with gluten already excluded →
            </Link>
          </div>
        </aside>

        <div className="lg:col-span-9 space-y-16">
          {shown.length === 0 ? (
            <div className="border border-dashed border-steel p-12 text-center text-sm text-mute">
              Nothing gluten-free in that meal yet. Try another, or{" "}
              <Link to="/submit" className="underline hover:text-ink">
                submit a recipe
              </Link>{" "}
              that fits.
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-steel border border-steel">
              {shown.map((r) => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </ul>
          )}

          <section className="space-y-6 max-w-[68ch]">
            <h2 className="font-serif text-2xl md:text-3xl tracking-tight">
              How the allergen tagging works
            </h2>
            <div className="space-y-4 text-sm text-mute leading-relaxed">
              <p>
                <strong className="text-ink font-medium">Five allergens, tracked per recipe.</strong>{" "}
                Gluten, soy, peanut, tree nut and sulphite are recorded against every recipe as it
                is written, based on its actual ingredient list rather than the category it belongs
                to.
              </p>
              <p>
                <strong className="text-ink font-medium">Absence is the claim.</strong> A recipe
                appears on this page only when gluten is not in its tag list, so you are filtering
                on what was checked, not on a dish name that sounds safe.
              </p>
              <p>
                <strong className="text-ink font-medium">Packaged goods are still yours to
                check.</strong> Swap soy sauce for tamari, buy certified gluten-free oats, and read
                stock cubes and spice blends. Those are the three places gluten usually sneaks back
                into an otherwise safe plate.
              </p>
              <p>
                <strong className="text-ink font-medium">Start where wheat was never central.</strong>{" "}
                Rice-and-lentil batters, dals, corn dishes and rice-noodle bowls are gluten-free by
                construction, which makes them far more reliable than a substituted bake.
              </p>
            </div>
          </section>

          <section className="space-y-6 max-w-[68ch]">
            <h2 className="font-serif text-2xl md:text-3xl tracking-tight">
              Gluten-free vegan questions
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
              The weekly newsletter plans your week for you, with allergens listed on every recipe.
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

      <SiteFooter note="Vegan Cook — gluten-free collection" />
    </div>
  );
}
