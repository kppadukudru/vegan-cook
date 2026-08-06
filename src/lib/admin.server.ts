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
import type { ImportRowResult } from "@/lib/csv-import";

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
      image_url: data.imageUrl || null,
      image_alt: data.imageAlt || null,
      image_caption: data.imageCaption || null,
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("saveRecipe failed:", error.message);
    return { ok: false, message: "Could not save the recipe." };
  }
  return { ok: true, id, message: `Saved "${data.title}".` };
}

export async function setRecipeStatus(
  id: string,
  status: "published" | "draft",
): Promise<Result> {
  const { error } = await supabaseAdmin.from("recipes").update({ status }).eq("id", id);
  if (error) {
    console.error("setRecipeStatus failed:", error.message);
    return { ok: false, message: "Could not change that recipe's status." };
  }
  return { ok: true, id, message: status === "published" ? "Recipe published." : "Recipe moved to draft." };
}

export async function publishAllDrafts(): Promise<Result> {
  const { data, error } = await supabaseAdmin
    .from("recipes")
    .update({ status: "published" })
    .eq("status", "draft")
    .select("id");
  if (error) {
    console.error("publishAllDrafts failed:", error.message);
    return { ok: false, message: "Could not publish the drafts." };
  }
  const count = data?.length ?? 0;
  return {
    ok: true,
    message: count === 0 ? "No drafts left to publish." : `Published ${count} draft recipe${count === 1 ? "" : "s"}.`,
  };
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
      image_url: sub.image_url ?? null,
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

/**
 * Bulk import from CSV. Rows are validated client-side and again by the server
 * function's schema; here we only vegan-check and upsert.
 */
export async function importRecipes(
  rows: RecipeInput[],
  publish: boolean,
): Promise<{ ok: boolean; message: string; results: ImportRowResult[] }> {
  const results: ImportRowResult[] = [];
  const ids = rows.map((r) => r.id?.trim() || slugify(r.title)).filter(Boolean);

  const { data: existing } = await supabaseAdmin
    .from("recipes")
    .select("id")
    .in("id", ids.length > 0 ? ids : ["__none__"]);
  const known = new Set((existing ?? []).map((r) => r.id));

  const payloads: Record<string, unknown>[] = [];

  for (const data of rows) {
    const id = data.id?.trim() || slugify(data.title);
    if (!id) {
      results.push({ id: "", title: data.title, outcome: "skipped", message: "No valid address could be derived from the title." });
      continue;
    }
    const hits = findNonVeganTerms([
      ...data.ingredientsText.split("\n"),
      ...data.methodText.split("\n"),
      data.title,
    ]);
    if (hits.length > 0) {
      results.push({ id, title: data.title, outcome: "skipped", message: describeNonVeganHits(hits) });
      continue;
    }

    payloads.push({
      id,
      title: data.title,
      blurb: data.blurb,
      time_minutes: data.timeMinutes,
      servings: data.servings,
      skill: data.skill,
      contains: normalizeAllergens(data.contains),
      ingredients: parseIngredients(data.ingredientsText),
      cookware: parseList(data.cookwareText),
      method: parseMethod(data.methodText),
      allergen_notes: data.allergenNotes || null,
      author: data.author,
      published_at: data.publishedAt,
      status: publish ? "published" : data.status,
      cuisine: data.cuisine ?? null,
      spice_level: data.spiceLevel ?? null,
      meal_types: data.mealTypes ?? [],
      calories: data.calories ?? null,
      image_url: data.imageUrl || null,
      image_alt: data.imageAlt || null,
      image_caption: data.imageCaption || null,
    });
    results.push({
      id,
      title: data.title,
      outcome: known.has(id) ? "updated" : "created",
    });
  }

  if (payloads.length === 0) {
    return { ok: false, message: "Nothing was imported — every row was skipped.", results };
  }

  const { error } = await supabaseAdmin
    .from("recipes")
    .upsert(payloads as never, { onConflict: "id" });
  if (error) {
    console.error("importRecipes failed:", error.message);
    return { ok: false, message: "Could not write the imported recipes.", results: [] };
  }

  const created = results.filter((r) => r.outcome === "created").length;
  const updated = results.filter((r) => r.outcome === "updated").length;
  const skipped = results.filter((r) => r.outcome === "skipped").length;
  return {
    ok: true,
    message: `Imported ${created} new and updated ${updated} recipe${updated === 1 ? "" : "s"} as ${publish ? "published" : "drafts"}${skipped > 0 ? `, skipped ${skipped}` : ""}.`,
    results,
  };
}
