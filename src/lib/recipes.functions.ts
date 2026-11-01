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

export interface ServeWithLink {
  id: string;
  title: string;
}

/**
 * Public: published recipes linked either way — ids this recipe names, then
 * recipes that name this one. Drafts and unknown ids drop out via the filter.
 */
export const getServeWith = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().max(80), forward: z.array(z.string().max(80)).max(20) }).parse(data),
  )
  .handler(async ({ data }): Promise<ServeWithLink[]> => {
    const { createPublicClient } = await import("@/lib/recipes.server");
    const client = createPublicClient();
    const [fwd, rev] = await Promise.all([
      data.forward.length > 0
        ? client.from("recipes").select("id, title").eq("status", "published").in("id", data.forward)
        : Promise.resolve({ data: [], error: null }),
      client
        .from("recipes")
        .select("id, title")
        .eq("status", "published")
        .contains("serve_with", [data.id])
        .order("title"),
    ]);
    if (fwd.error || rev.error) {
      console.error("getServeWith failed:", fwd.error?.message ?? rev.error?.message);
      return [];
    }
    const byId = new Map((fwd.data ?? []).map((r) => [r.id, r]));
    const out: ServeWithLink[] = [];
    const seen = new Set<string>([data.id]);
    for (const id of data.forward) {
      const r = byId.get(id);
      if (r && !seen.has(r.id)) { seen.add(r.id); out.push({ id: r.id, title: r.title }); }
    }
    for (const r of rev.data ?? []) {
      if (!seen.has(r.id)) { seen.add(r.id); out.push({ id: r.id, title: r.title }); }
    }
    return out;
  });
