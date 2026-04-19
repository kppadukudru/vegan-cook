import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ALL_ALLERGENS,
  pickRecipeOfTheDay,
  recipes,
  type Allergen,
  type Skill,
} from "@/data/recipes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Novera — Plant-Based Recipes, Edited Daily" },
      {
        name: "description",
        content:
          "A curated archive of vegan recipes. Filter by skill level and dietary constraints. A new recipe of the day, every day.",
      },
      { property: "og:title", content: "Novera — Plant-Based Recipes" },
      {
        property: "og:description",
        content:
          "A curated archive of vegan recipes, filtered by skill and allergen.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

const SKILLS: Skill[] = ["Beginner", "Intermediate", "Expert"];

function Index() {
  const [skill, setSkill] = useState<Skill | "All">("All");
  const [avoid, setAvoid] = useState<Set<Allergen>>(new Set());

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (skill !== "All" && r.skill !== skill) return false;
      for (const a of avoid) if (r.contains.includes(a)) return false;
      return true;
    });
  }, [skill, avoid]);

  const featured = useMemo(() => pickRecipeOfTheDay(filtered), [filtered]);

  const toggleAllergen = (a: Allergen) => {
    setAvoid((prev) => {
      const next = new Set(prev);
      next.has(a) ? next.delete(a) : next.add(a);
      return next;
    });
  };

  const hours = Math.floor(featured.timeMinutes / 60);
  const mins = featured.timeMinutes % 60;
  const timeLabel =
    hours > 0
      ? `${hours}.${Math.round((mins / 60) * 10)} Hours`
      : `${mins} Min`;

  return (
    <div className="bg-paper text-ink min-h-dvh antialiased selection:bg-ink selection:text-paper">
      <header className="border-b border-steel px-6 md:px-8 py-5 flex items-center justify-between uppercase text-[10px] tracking-[0.15em] font-medium">
        <div className="flex gap-12 items-center">
          <span className="font-serif text-xl tracking-tight capitalize">
            Novera
          </span>
          <nav className="hidden md:flex gap-8 text-mute">
            <a href="#archive" className="hover:text-ink transition-colors">
              Archive
            </a>
            <a href="#" className="hover:text-ink transition-colors">
              Techniques
            </a>
            <a href="#" className="hover:text-ink transition-colors">
              Provisions
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <button className="hover:text-mute transition-colors">Sign In</button>
          <button className="bg-ink text-paper px-4 py-2 hover:bg-mute transition-colors">
            Subscribe
          </button>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto">
        <section className="grid grid-cols-1 lg:grid-cols-12 lg:min-h-[85vh] border-b border-steel">
          <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-steel p-8 lg:p-12 lg:pr-16">
            <div className="space-y-10 lg:space-y-12 mt-4 lg:mt-8">
              <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.15em] text-mute">
                <span className="inline-block size-1.5 bg-ink" />
                <span>Feature — Recipe of the Day</span>
              </div>

              <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] tracking-tight text-balance">
                {featured.title}.
              </h1>

              <p className="text-mute max-w-[45ch] text-sm leading-relaxed text-pretty">
                {featured.blurb}
              </p>
            </div>

            <div className="mt-12 lg:mt-16 grid grid-cols-2 gap-px bg-steel border border-steel">
              <div className="bg-paper p-5 flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-[0.1em] text-mute">
                  Time Req.
                </span>
                <span className="text-sm font-medium tabular-nums">
                  {timeLabel}
                </span>
              </div>
              <div className="bg-paper p-5 flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-[0.1em] text-mute">
                  Skill Level
                </span>
                <span className="text-sm font-medium">{featured.skill}</span>
              </div>
              <div className="bg-paper p-5 col-span-2 flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-[0.1em] text-mute">
                  Allergen Profile
                </span>
                <div className="flex flex-wrap gap-3 text-xs">
                  {ALL_ALLERGENS.filter(
                    (a) => !featured.contains.includes(a),
                  ).map((a) => (
                    <span key={a} className="line-through text-mute">
                      {a}
                    </span>
                  ))}
                  {featured.contains.length > 0 && (
                    <span>Contains: {featured.contains.join(", ")}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-steel relative p-6 md:p-8 min-h-[60vh] lg:min-h-0">
            <img
              src={featured.image}
              alt={featured.title}
              width={1024}
              height={1024}
              className="w-full h-full object-cover"
              style={{ outline: "1px solid rgba(0,0,0,0.05)", outlineOffset: -1 }}
            />
          </div>
        </section>

        <section
          id="archive"
          className="px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12"
        >
          <div className="lg:col-span-3">
            <h2 className="font-serif text-2xl tracking-tight">
              Archive Parameters
            </h2>
            <p className="text-xs text-mute mt-2 max-w-[30ch]">
              Filter the collection to match your kitchen's capability and
              dietary constraints.
            </p>
          </div>

          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.15em] text-mute border-b border-steel pb-2 block w-full">
                Proficiency
              </span>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  active={skill === "All"}
                  onClick={() => setSkill("All")}
                >
                  All
                </FilterChip>
                {SKILLS.map((s) => (
                  <FilterChip
                    key={s}
                    active={skill === s}
                    onClick={() => setSkill(s)}
                  >
                    {s}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.15em] text-mute border-b border-steel pb-2 block w-full">
                Strictly Avoid
              </span>
              <div className="flex flex-wrap gap-2">
                {ALL_ALLERGENS.map((a) => {
                  const active = avoid.has(a);
                  return (
                    <button
                      key={a}
                      onClick={() => toggleAllergen(a)}
                      className={`px-4 py-2 text-xs flex items-center gap-2 transition-colors ${
                        active
                          ? "border border-ink bg-ink text-paper"
                          : "border border-steel text-mute hover:border-ink hover:text-ink"
                      }`}
                    >
                      <span
                        className={`block size-1.5 ${
                          active ? "bg-paper" : "border border-mute"
                        }`}
                      />
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-8 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3">
            <h2 className="font-serif text-2xl tracking-tight">
              The Collection
            </h2>
            <p className="text-xs text-mute mt-2 max-w-[30ch]">
              {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}{" "}
              matching your filters.
            </p>
          </div>

          <div className="lg:col-span-9">
            {filtered.length === 0 ? (
              <div className="border border-dashed border-steel p-12 text-center text-sm text-mute">
                No recipes match these constraints. Try loosening a filter.
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-steel border border-steel">
                {filtered.map((r) => (
                  <li
                    key={r.id}
                    className="bg-paper p-6 flex flex-col gap-4 group hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-serif text-xl leading-tight tracking-tight text-balance group-hover:text-leaf transition-colors">
                        {r.title}
                      </h3>
                      <span className="text-[9px] uppercase tracking-[0.1em] text-mute shrink-0 mt-1">
                        {r.skill}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-mute mt-auto pt-4 border-t border-steel">
                      <span className="tabular-nums">{r.timeMinutes} min</span>
                      <span>
                        {r.contains.length === 0
                          ? "Allergen-free"
                          : `Contains ${r.contains.join(", ")}`}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-steel px-6 md:px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[10px] uppercase tracking-[0.15em] text-mute">
        <span>© Novera. A plant-based archive.</span>
        <span>Vol. 01 — Issue 04</span>
      </footer>
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
