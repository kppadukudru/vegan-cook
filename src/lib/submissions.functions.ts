import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { describeNonVeganHits, findNonVeganTerms } from "@/lib/vegan-check";
import { cuisineEnum, mealTypeEnum, spiceEnum } from "@/lib/admin-schemas";

const submissionSchema = z.object({
  title: z.string().trim().min(4, "Give the recipe a title.").max(160),
  authorName: z.string().trim().min(2, "Tell us who to credit.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(255),
  skill: z.enum(["Beginner", "Intermediate", "Expert"]),
  timeMinutes: z.coerce.number().int().min(1).max(2880),
  servings: z.coerce.number().int().min(1).max(50),
  blurb: z.string().trim().min(20, "Add a short description.").max(600),
  ingredients: z.string().trim().min(10, "List the ingredients.").max(4000),
  cookware: z.string().trim().min(3, "List the cookware.").max(2000),
  method: z.string().trim().min(20, "Describe the method.").max(8000),
  allergens: z.array(z.string().max(40)).max(20).default([]),
  allergenNotes: z.string().trim().max(1000).default(""),
  cuisine: cuisineEnum.nullish(),
  spiceLevel: spiceEnum.nullish(),
  mealTypes: z.array(mealTypeEnum).max(5).default([]),
  calories: z.coerce.number().int().min(0).max(10000).nullish(),
});


export const submitRecipe = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submissionSchema.parse(data))
  .handler(async ({ data }) => {
    // Server-side vegan guard — the client check is convenience only.
    const lines = [
      ...data.ingredients.split("\n"),
      ...data.method.split("\n"),
      data.title,
    ];
    const hits = findNonVeganTerms(lines);
    if (hits.length > 0) {
      return { ok: false as const, message: describeNonVeganHits(hits) };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("recipe_submissions").insert({
      title: data.title,
      author_name: data.authorName,
      email: data.email,
      skill: data.skill,
      time_minutes: data.timeMinutes,
      servings: data.servings,
      blurb: data.blurb,
      ingredients: data.ingredients,
      cookware: data.cookware,
      method: data.method,
      allergens: data.allergens,
      allergen_notes: data.allergenNotes || null,
      cuisine: data.cuisine ?? null,
      spice_level: data.spiceLevel ?? null,
      meal_types: data.mealTypes ?? [],
      calories: data.calories ?? null,
    });

    if (error) {
      console.error("submitRecipe failed:", error.message);
      return { ok: false as const, message: "Could not save your recipe. Please try again." };
    }

    return {
      ok: true as const,
      message: "Received. We read every submission before it goes into the archive.",
    };
  });
