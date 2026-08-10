import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { RecipeCard } from "@/components/RecipeCard";
import {
  EMPTY_FILTERS,
  RecipeFilters,
  filterRecipes,
  type RecipeFilterState,
} from "@/components/RecipeFilters";
import {
  ALL_ALLERGENS,
  ALL_CUISINES,
  ALL_MEAL_TYPES,
  ALL_SPICE_LEVELS,
  type Allergen,
  type Cuisine,
  type MealType,
  type Recipe,
  type Skill,
  type SpiceLevel,
} from "@/data/recipes";
import { listPublishedRecipes } from "@/lib/recipes.functions";

const URL = "https://www.vegancook.live/recipes";
const TITLE = "All Vegan Recipes: Filter by Skill, Cuisine and Allergens";
const DESCRIPTION =
  "The full Vegan Cook collection. Filter every tested plant-based recipe by cooking skill, cuisine, meal, spice level and the allergens you need to avoid.";

const PAGE_SIZE = 24;

interface RecipesSearch {
  skill?: string;
  cuisine?: string;
  spice?: string;
  meal?: string;
  avoid?: string;
}

const str = (v: unknown) => (typeof v === "string" && v.length > 0 ? v.slice(0, 40) : undefined);

export const Route = createFileRoute("/recipes/")({
  validateSearch: (search: Record<string, unknown>): RecipesSearch => ({
    ...(str(search.skill) ? { skill: str(search.skill)! } : {}),
    ...(str(search.cuisine) ? { cuisine: str(search.cuisine)! } : {}),
    ...(str(search.spice) ? { spice: str(search.spice)! } : {}),
    ...(str(search.meal) ? { meal: str(search.meal)! } : {}),
    ...(str(search.avoid) ? { avoid: str(search.avoid)!.slice(0, 120) } : {}),
  }),
  loader: () => listPublishedRecipes(),
  head: ({ loaderData }) => {
    const recipes = (loaderData as Recipe[] | undefined) ?? [];
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
            name: "All vegan recipes",
            description: DESCRIPTION,
            itemListElement: recipes.slice(0, 100).map((r, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: r.title,
              url: `https://www.vegancook.live/recipes/${r.id}`,
            })),
          }),
        },
      ],
    };
  },
  errorComponent: () => (
    <div className="bg-paper text-ink min-h-dvh grid place-items-center px-6">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="font-serif text-3xl tracking-tight">The kitchen is briefly closed</h1>
        <p className="text-sm text-mute">
          We couldn't load the collection just now. Please refresh in a moment.
        </p>
      </div>
    </div>
  ),
  component: RecipesArchive,
});

function oneOf<T extends string>(list: readonly T[], value: string | undefined): T | "All" {
  return value && (list as readonly string[]).includes(value) ? (value as T) : "All";
}

function RecipesArchive() {
  const all = Route.useLoaderData() as Recipe[];
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filters: RecipeFilterState = useMemo(
    () => ({
      skill: oneOf<Skill>(["Beginner", "Intermediate", "Expert"], search.skill),
      cuisine: oneOf<Cuisine>(ALL_CUISINES, search.cuisine),
      spice: oneOf<SpiceLevel>(ALL_SPICE_LEVELS, search.spice),
      meal: oneOf<MealType>(ALL_MEAL_TYPES, search.meal),
      avoid: (search.avoid ?? "")
        .split(",")
        .filter((a: string): a is Allergen => (ALL_ALLERGENS as string[]).includes(a)),
    }),
    [search],
  );

  const shown = useMemo(() => filterRecipes(all, filters), [all, filters]);

  const update = (patch: Partial<RecipeFilterState>) => {
    const next = { ...filters, ...patch };
    setVisible(PAGE_SIZE);
    void navigate({
      search: {
        ...(next.skill !== "All" ? { skill: next.skill } : {}),
        ...(next.cuisine !== "All" ? { cuisine: next.cuisine } : {}),
        ...(next.spice !== "All" ? { spice: next.spice } : {}),
        ...(next.meal !== "All" ? { meal: next.meal } : {}),
        ...(next.avoid.length > 0 ? { avoid: next.avoid.join(",") } : {}),
      },
      replace: true,
    });
  };

  const hasFilters =
    filters.skill !== "All" ||
    filters.cuisine !== "All" ||
    filters.spice !== "All" ||
    filters.meal !== "All" ||
    filters.avoid.length > 0;

  return (
    <div className="bg-paper text-ink min-h-dvh antialiased selection:bg-ink selection:text-paper">
      <SiteHeader />

      <section className="border-b border-steel px-6 md:px-8 py-12 md:py-16 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <p className="lg:col-span-3 text-[10px] uppercase tracking-[0.15em] text-mute">
            The collection
          </p>
          <div className="lg:col-span-9 space-y-6">
            <h1 className="font-serif text-3xl md:text-5xl leading-[1.1] tracking-tight text-balance max-w-[38ch]">
              Every vegan recipe in the collection, in one place.
            </h1>
            <p className="text-mute text-base leading-relaxed max-w-[62ch] text-pretty">
              {all.length} tested plant-based recipes, each one written out properly and tagged with
              exactly what it contains. Narrow the list by how confident you feel in the kitchen, by
              cuisine, meal or spice level, and screen out the allergens you need to avoid.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-[1440px] mx-auto">
        <section className="px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3 space-y-3">
            <h2 className="font-serif text-2xl tracking-tight">Narrow it down</h2>
            <p className="text-xs text-mute max-w-[30ch]">
              {shown.length} of {all.length} recipes match.
            </p>
            {hasFilters && (
              <button
                onClick={() => update(EMPTY_FILTERS)}
                className="text-[10px] uppercase tracking-[0.15em] text-mute underline hover:text-ink transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
          <div className="lg:col-span-9">
            <RecipeFilters value={filters} onChange={update} />
          </div>
        </section>

        <section className="px-6 md:px-8 pb-24 space-y-8">
          {shown.length === 0 ? (
            <div className="border border-dashed border-steel p-12 text-center text-sm text-mute">
              Nothing matches those constraints. Try loosening a filter, or{" "}
              <Link to="/submit" className="underline hover:text-ink">
                submit a recipe
              </Link>{" "}
              that does.
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-steel border border-steel">
                {shown.slice(0, visible).map((r) => (
                  <RecipeCard key={r.id} recipe={r} />
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <p className="text-[10px] uppercase tracking-[0.15em] text-mute tabular-nums">
                  Showing {Math.min(visible, shown.length)} of {shown.length}
                </p>
                {visible < shown.length && (
                  <button
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="bg-ink text-paper px-5 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors"
                  >
                    Load more recipes
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
