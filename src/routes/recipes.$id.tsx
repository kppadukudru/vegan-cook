import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ALL_ALLERGENS, getRecipeById, type Recipe } from "@/data/recipes";

export const Route = createFileRoute("/recipes/$id")({
  loader: ({ params }) => {
    const recipe = getRecipeById(params.id);
    if (!recipe) throw notFound();
    return { recipe };
  },
  head: ({ loaderData }) => {
    const recipe = loaderData?.recipe;
    if (!recipe) {
      return { meta: [{ title: "Recipe not found — Novera" }] };
    }
    return {
      meta: [
        { title: `${recipe.title} — Novera` },
        { name: "description", content: recipe.blurb },
        { property: "og:title", content: `${recipe.title} — Novera` },
        { property: "og:description", content: recipe.blurb },
        { property: "og:image", content: recipe.image },
        { name: "twitter:image", content: recipe.image },
      ],
    };
  },
  notFoundComponent: NotFoundRecipe,
  errorComponent: ({ error, reset }) => (
    <div className="bg-paper text-ink min-h-dvh flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <p className="text-[10px] uppercase tracking-[0.15em] text-mute">Error</p>
        <h1 className="font-serif text-3xl">{error.message}</h1>
        <button
          onClick={reset}
          className="bg-ink text-paper px-4 py-2 text-xs uppercase tracking-[0.15em]"
        >
          Try again
        </button>
      </div>
    </div>
  ),
  component: RecipePage,
});

function NotFoundRecipe() {
  return (
    <div className="bg-paper text-ink min-h-dvh flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <p className="text-[10px] uppercase tracking-[0.15em] text-mute">404</p>
        <h1 className="font-serif text-3xl">This recipe is not in the archive.</h1>
        <Link
          to="/"
          className="inline-block bg-ink text-paper px-4 py-2 text-xs uppercase tracking-[0.15em]"
        >
          Back to archive
        </Link>
      </div>
    </div>
  );
}

function RecipePage() {
  const { recipe } = Route.useLoaderData() as { recipe: Recipe };

  const hours = Math.floor(recipe.timeMinutes / 60);
  const mins = recipe.timeMinutes % 60;
  const timeLabel =
    hours > 0
      ? `${hours}.${Math.round((mins / 60) * 10)} Hours`
      : `${mins} Min`;

  const free = ALL_ALLERGENS.filter((a) => !recipe.contains.includes(a));

  return (
    <div className="bg-paper text-ink min-h-dvh antialiased selection:bg-ink selection:text-paper">
      <header className="border-b border-steel px-6 md:px-8 py-5 flex items-center justify-between uppercase text-[10px] tracking-[0.15em] font-medium">
        <div className="flex gap-12 items-center">
          <Link to="/" className="font-serif text-xl tracking-tight capitalize normal-case">
            Novera
          </Link>
          <nav className="hidden md:flex gap-8 text-mute">
            <Link to="/" className="hover:text-ink transition-colors">
              Archive
            </Link>
          </nav>
        </div>
        <Link
          to="/"
          className="text-mute hover:text-ink transition-colors flex items-center gap-2"
        >
          <span aria-hidden>←</span> Back
        </Link>
      </header>

      <main className="max-w-[1440px] mx-auto">
        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-steel">
          <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-steel p-8 lg:p-12 lg:pr-16">
            <div className="space-y-10 lg:space-y-12 mt-4 lg:mt-8">
              <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.15em] text-mute">
                <span className="inline-block size-1.5 bg-ink" />
                <span>Recipe — {recipe.skill}</span>
              </div>

              <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] tracking-tight text-balance">
                {recipe.title}.
              </h1>

              <p className="text-mute max-w-[45ch] text-sm leading-relaxed text-pretty">
                {recipe.blurb}
              </p>
            </div>

            <div className="mt-12 lg:mt-16 grid grid-cols-3 gap-px bg-steel border border-steel">
              <SpecCell label="Time Req." value={timeLabel} />
              <SpecCell label="Servings" value={String(recipe.servings)} />
              <SpecCell label="Skill" value={recipe.skill} />
            </div>
          </div>

          <div className="lg:col-span-7 bg-steel relative p-6 md:p-8 min-h-[60vh] lg:min-h-0">
            <img
              src={recipe.image}
              alt={recipe.title}
              width={1024}
              height={1024}
              className="w-full h-full object-cover"
              style={{ outline: "1px solid rgba(0,0,0,0.05)", outlineOffset: -1 }}
            />
          </div>
        </section>

        {/* Ingredients + Cookware */}
        <section className="px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-steel">
          <div className="lg:col-span-3">
            <h2 className="font-serif text-2xl tracking-tight">Ingredients</h2>
            <p className="text-xs text-mute mt-2">Serves {recipe.servings}.</p>
          </div>
          <div className="lg:col-span-5">
            <ul className="divide-y divide-steel border-y border-steel">
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[140px_1fr] gap-6 py-3 text-sm"
                >
                  <span className="text-[10px] uppercase tracking-[0.15em] text-mute pt-1 tabular-nums">
                    {ing.qty}
                  </span>
                  <span>{ing.item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-4">
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-mute border-b border-steel pb-2 mb-4">
              Cookware
            </h3>
            <ul className="space-y-2 text-sm">
              {recipe.cookware.map((c) => (
                <li key={c} className="flex items-center gap-3">
                  <span className="inline-block size-1 bg-ink" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Method */}
        <section className="px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-steel">
          <div className="lg:col-span-3">
            <h2 className="font-serif text-2xl tracking-tight">Method</h2>
            <p className="text-xs text-mute mt-2 max-w-[30ch]">
              Read each step end-to-end before starting.
            </p>
          </div>
          <ol className="lg:col-span-9 space-y-px bg-steel border border-steel">
            {recipe.method.map((step, i) => (
              <li
                key={i}
                className="bg-paper p-6 md:p-8 grid grid-cols-1 md:grid-cols-[80px_1fr] gap-6"
              >
                <span className="font-serif text-4xl text-mute tabular-nums leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="space-y-3">
                  <h3 className="font-serif text-xl leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-mute leading-relaxed text-pretty">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Allergen profile */}
        <section className="px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3">
            <h2 className="font-serif text-2xl tracking-tight">
              Allergen Profile
            </h2>
            <p className="text-xs text-mute mt-2 max-w-[30ch]">
              Cross-contamination risk depends on your kitchen — check all packaging.
            </p>
          </div>
          <div className="lg:col-span-9 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-steel border border-steel">
              <div className="bg-paper p-6 space-y-3">
                <span className="text-[10px] uppercase tracking-[0.15em] text-mute">
                  Free From
                </span>
                <div className="flex flex-wrap gap-2">
                  {free.length === 0 ? (
                    <span className="text-sm text-mute">—</span>
                  ) : (
                    free.map((a) => (
                      <span
                        key={a}
                        className="px-3 py-1 text-xs border border-steel text-mute"
                      >
                        {a}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div className="bg-paper p-6 space-y-3">
                <span className="text-[10px] uppercase tracking-[0.15em] text-mute">
                  Contains
                </span>
                <div className="flex flex-wrap gap-2">
                  {recipe.contains.length === 0 ? (
                    <span className="text-sm">No declared allergens.</span>
                  ) : (
                    recipe.contains.map((a) => (
                      <span
                        key={a}
                        className="px-3 py-1 text-xs border border-ink bg-ink text-paper"
                      >
                        {a}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {recipe.allergenNotes && (
              <div className="border-l-2 border-ink pl-6 py-2">
                <p className="text-[10px] uppercase tracking-[0.15em] text-mute mb-2">
                  Editor's Note
                </p>
                <p className="text-sm leading-relaxed text-pretty">
                  {recipe.allergenNotes}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-steel px-6 md:px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[10px] uppercase tracking-[0.15em] text-mute">
        <span>© Novera. A plant-based archive.</span>
        <Link to="/" className="hover:text-ink transition-colors">
          ← Return to archive
        </Link>
      </footer>
    </div>
  );
}

function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper p-5 flex flex-col gap-1">
      <span className="text-[9px] uppercase tracking-[0.1em] text-mute">
        {label}
      </span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}
