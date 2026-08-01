import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { describeNonVeganHits, findNonVeganTerms } from "@/lib/vegan-check";
import {
  normalizeAllergens,
  parseIngredients,
  parseList,
  parseMethod,
  slugify,
} from "@/lib/recipe-format";
import type { RecipeInput } from "@/lib/admin-schemas";

type Result = { ok: boolean; message: string; id?: string };

export async function saveRecipe(data: RecipeInput): Promise<Result> {
  const hits = findNonVeganTerms([
    ...data.ingredientsText.split("\n"),
    ...data.methodText.split("\n"),
    data.title,
  ]);
  if (hits.length > 0) return { ok: false, message: describeNonVeganHits(hits) };

  const id = data.id?.trim() || slugify(data.title);
  if (!id) return { ok: false, message: "Could not derive an address from that title." };

  const { error } = await supabaseAdmin.from("recipes").upsert(
    {
      id,
      title: data.title,
      blurb: data.blurb,
      time_minutes: data.timeMinutes,
      servings: data.servings,
      skill: data.skill,
      contains: normalizeAllergens(data.contains),
      ingredients: parseIngredients(data.ingredientsText) as never,
      cookware: parseList(data.cookwareText),
      method: parseMethod(data.methodText) as never,
      allergen_notes: data.allergenNotes || null,
      author: data.author,
      published_at: data.publishedAt,
      status: data.status,
      cuisine: data.cuisine ?? null,
      spice_level: data.spiceLevel ?? null,
      meal_types: data.mealTypes ?? [],
      calories: data.calories ?? null,
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("saveRecipe failed:", error.message);
    return { ok: false, message: "Could not save the recipe." };
  }
  return { ok: true, id, message: `Saved "${data.title}".` };
}

export async function deleteRecipe(id: string): Promise<Result> {
  const { error } = await supabaseAdmin.from("recipes").delete().eq("id", id);
  if (error) return { ok: false, message: "Could not delete that recipe." };
  return { ok: true, message: "Recipe removed." };
}

export async function listSubmissions() {
  const { data, error } = await supabaseAdmin
    .from("recipe_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Turns a submission into a real recipe using the same parsing the editor uses,
 * so a published submission renders identically to editorial recipes.
 */
export async function publishSubmission(id: string, asDraft: boolean): Promise<Result> {
  const { data: sub, error: readError } = await supabaseAdmin
    .from("recipe_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (readError || !sub) return { ok: false, message: "Submission not found." };

  const hits = findNonVeganTerms([
    ...sub.ingredients.split("\n"),
    ...sub.method.split("\n"),
    sub.title,
  ]);
  if (hits.length > 0) return { ok: false, message: describeNonVeganHits(hits) };

  // Reuse the existing address on re-publish; otherwise find a free one.
  let recipeId = sub.published_recipe_id ?? "";
  if (!recipeId) {
    const base = slugify(sub.title) || `submission-${sub.id.slice(0, 8)}`;
    recipeId = base;
    for (let n = 2; n <= 40; n += 1) {
      const { data: clash } = await supabaseAdmin
        .from("recipes")
        .select("id")
        .eq("id", recipeId)
        .maybeSingle();
      if (!clash) break;
      recipeId = `${base}-${n}`;
    }
  }

  const { error: writeError } = await supabaseAdmin.from("recipes").upsert(
    {
      id: recipeId,
      title: sub.title,
      blurb: sub.blurb,
      time_minutes: sub.time_minutes,
      servings: sub.servings,
      skill: sub.skill,
      contains: normalizeAllergens(sub.allergens ?? []),
      ingredients: parseIngredients(sub.ingredients) as never,
      cookware: parseList(sub.cookware),
      method: parseMethod(sub.method) as never,
      allergen_notes: sub.allergen_notes,
      author: sub.author_name,
      published_at: new Date().toISOString().slice(0, 10),
      status: asDraft ? "draft" : "published",
      source_submission_id: sub.id,
      cuisine: sub.cuisine,
      spice_level: sub.spice_level,
      meal_types: sub.meal_types ?? [],
      calories: sub.calories,
    },
    { onConflict: "id" },
  );
  if (writeError) {
    console.error("publishSubmission failed:", writeError.message);
    return { ok: false, message: "Could not publish that submission." };
  }

  await supabaseAdmin
    .from("recipe_submissions")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      published_recipe_id: recipeId,
    })
    .eq("id", sub.id);

  return {
    ok: true,
    id: recipeId,
    message: asDraft
      ? "Converted to a draft recipe — edit it, then set it to published."
      : `Published "${sub.title}". It is live on the site now.`,
  };
}

export async function rejectSubmission(id: string, notes: string): Promise<Result> {
  const { error } = await supabaseAdmin
    .from("recipe_submissions")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      review_notes: notes || null,
    })
    .eq("id", id);
  if (error) return { ok: false, message: "Could not update that submission." };
  return { ok: true, message: "Marked as rejected." };
}
