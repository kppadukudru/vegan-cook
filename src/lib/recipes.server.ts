import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type {
  Allergen,
  Cuisine,
  Ingredient,
  MealType,
  MethodStep,
  Recipe,
  Skill,
  SpiceLevel,
} from "@/data/recipes";

type RecipeRow = Database["public"]["Tables"]["recipes"]["Row"];

export const RECIPE_COLUMNS =
  "id, title, blurb, time_minutes, servings, skill, contains, ingredients, cookware, method, allergen_notes, author, published_at, status, cuisine, spice_level, meal_types, calories";


/** Server-side publishable client for public reads (RLS applies as anon). */
export function createPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/** DB row -> the shape every page on the site already renders. */
export function rowToRecipe(row: Partial<RecipeRow>): Recipe {
  return {
    id: row.id!,
    title: row.title!,
    blurb: row.blurb!,
    timeMinutes: row.time_minutes!,
    servings: row.servings!,
    skill: row.skill as Skill,
    contains: (row.contains ?? []) as Allergen[],
    ingredients: (row.ingredients ?? []) as unknown as Ingredient[],
    cookware: row.cookware ?? [],
    method: (row.method ?? []) as unknown as MethodStep[],
    ...(row.allergen_notes ? { allergenNotes: row.allergen_notes } : {}),
    author: row.author ?? "Vegan Cook",
    publishedAt: (row.published_at ?? "").slice(0, 10),
    status: (row.status as "published" | "draft") ?? "published",
  };
}
