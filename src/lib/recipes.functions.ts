import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Recipe } from "@/data/recipes";

/** Public: every published recipe, newest publish date first. */
export const listPublishedRecipes = createServerFn({ method: "GET" }).handler(
  async (): Promise<Recipe[]> => {
    const { createPublicClient, rowToRecipe, RECIPE_COLUMNS } = await import(
      "@/lib/recipes.server"
    );
    const { data, error } = await createPublicClient()
      .from("recipes")
      .select(RECIPE_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .order("id", { ascending: true });

    if (error) {
      console.error("listPublishedRecipes failed:", error.message);
      return [];
    }
    return (data ?? []).map(rowToRecipe);
  },
);

/** Public: a single published recipe, or null when it is missing or a draft. */
export const getPublishedRecipe = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ id: z.string().max(80) }).parse(data))
  .handler(async ({ data }): Promise<Recipe | null> => {
    const { createPublicClient, rowToRecipe, RECIPE_COLUMNS } = await import(
      "@/lib/recipes.server"
    );
    const { data: row, error } = await createPublicClient()
      .from("recipes")
      .select(RECIPE_COLUMNS)
      .eq("id", data.id)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      console.error("getPublishedRecipe failed:", error.message);
      return null;
    }
    return row ? rowToRecipe(row) : null;
  });
