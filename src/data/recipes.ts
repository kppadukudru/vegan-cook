export type Skill = "Beginner" | "Intermediate" | "Expert";
export type Allergen = "Sulphite" | "Peanut" | "Soy" | "Gluten" | "Tree Nuts";

export interface Ingredient {
  qty: string;
  item: string;
}

export interface MethodStep {
  title: string;
  body: string;
}

export interface Recipe {
  id: string;
  title: string;
  blurb: string;
  timeMinutes: number;
  servings: number;
  skill: Skill;
  contains: Allergen[];
  ingredients: Ingredient[];
  cookware: string[];
  method: MethodStep[];
  allergenNotes?: string;
  author: string;
  publishedAt: string; // ISO date
  status?: "published" | "draft";
}

export const ALL_ALLERGENS: Allergen[] = [
  "Sulphite",
  "Peanut",
  "Soy",
  "Gluten",
  "Tree Nuts",
];

export const ALL_SKILLS: Skill[] = ["Beginner", "Intermediate", "Expert"];

/** Stable per-UTC-day index so SSR and client agree and the feature rotates daily. */
export function dayIndex(now: number = Date.now()): number {
  return Math.floor(now / 86_400_000);
}

/** Rotates across the whole catalogue, one recipe per day. */
export function pickRecipeOfTheDay(pool: Recipe[], now?: number): Recipe | undefined {
  if (pool.length === 0) return undefined;
  return pool[dayIndex(now) % pool.length];
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}
