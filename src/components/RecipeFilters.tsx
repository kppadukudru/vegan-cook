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

export const SKILLS: Skill[] = ["Beginner", "Intermediate", "Expert"];

export interface RecipeFilterState {
  skill: Skill | "All";
  cuisine: Cuisine | "All";
  spice: SpiceLevel | "All";
  meal: MealType | "All";
  avoid: Allergen[];
}

export const EMPTY_FILTERS: RecipeFilterState = {
  skill: "All",
  cuisine: "All",
  spice: "All",
  meal: "All",
  avoid: [],
};

export function filterRecipes(recipes: Recipe[], f: RecipeFilterState): Recipe[] {
  return recipes.filter((r) => {
    if (f.skill !== "All" && r.skill !== f.skill) return false;
    if (f.cuisine !== "All" && r.cuisine !== f.cuisine) return false;
    if (f.spice !== "All" && r.spiceLevel !== f.spice) return false;
    if (f.meal !== "All" && !r.mealTypes.includes(f.meal)) return false;
    for (const a of f.avoid) if (r.contains.includes(a)) return false;
    return true;
  });
}

/** Only the non-default values, ready to hand to a <Link search={...}>. */
export function filtersToSearch(f: RecipeFilterState) {
  return {
    ...(f.skill !== "All" ? { skill: f.skill } : {}),
    ...(f.cuisine !== "All" ? { cuisine: f.cuisine } : {}),
    ...(f.spice !== "All" ? { spice: f.spice } : {}),
    ...(f.meal !== "All" ? { meal: f.meal } : {}),
    ...(f.avoid.length > 0 ? { avoid: f.avoid.join(",") } : {}),
  };
}

function chipClass(active: boolean) {
  return `px-4 py-2 text-xs transition-colors ${
    active
      ? "border border-ink bg-ink text-paper"
      : "border border-steel text-mute hover:border-ink hover:text-ink"
  }`;
}

export function RecipeFilters({
  value,
  onChange,
}: {
  value: RecipeFilterState;
  onChange: (patch: Partial<RecipeFilterState>) => void;
}) {
  const toggleAllergen = (a: Allergen) =>
    onChange({
      avoid: value.avoid.includes(a)
        ? value.avoid.filter((x) => x !== a)
        : [...value.avoid, a],
    });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-4 order-1">
        <span className="text-[10px] uppercase tracking-[0.15em] text-mute border-b border-steel pb-2 block w-full">
          Cooking skill
        </span>
        <div className="flex flex-wrap gap-2">
          {(["All", ...SKILLS] as (Skill | "All")[]).map((s) => (
            <button
              key={s}
              onClick={() => onChange({ skill: s })}
              aria-pressed={value.skill === s}
              className={chipClass(value.skill === s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 order-5">
        <span className="text-[10px] uppercase tracking-[0.15em] text-mute border-b border-steel pb-2 block w-full">
          Avoid these allergens
        </span>
        <div className="flex flex-wrap gap-2">
          {ALL_ALLERGENS.map((a) => {
            const active = value.avoid.includes(a);
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
                <span className={`block size-1.5 ${active ? "bg-paper" : "border border-mute"}`} />
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
              onClick={() => onChange({ cuisine: c })}
              aria-pressed={value.cuisine === c}
              className={chipClass(value.cuisine === c)}
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
              onClick={() => onChange({ spice: s })}
              aria-pressed={value.spice === s}
              className={chipClass(value.spice === s)}
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
              onClick={() => onChange({ meal: m })}
              aria-pressed={value.meal === m}
              className={chipClass(value.meal === m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
