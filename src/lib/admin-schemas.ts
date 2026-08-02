import { z } from "zod";

export const cuisineEnum = z.enum([
  "Indian",
  "Middle Eastern",
  "Japanese",
  "Italian",
  "Continental",
  "Mexican",
  "Thai",
  "Chinese",
  "Mediterranean",
  "American",
  "Other",
]);
export const spiceEnum = z.enum(["None", "Mild", "Medium", "Spicy", "Fiery"]);
export const mealTypeEnum = z.enum(["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"]);

export const recipeInput = z.object({
  id: z.string().trim().max(80).optional(),
  title: z.string().trim().min(4).max(160),
  blurb: z.string().trim().min(10).max(1000),
  timeMinutes: z.coerce.number().int().min(1).max(2880),
  servings: z.coerce.number().int().min(1).max(50),
  skill: z.enum(["Beginner", "Intermediate", "Expert"]),
  contains: z.array(z.string().max(40)).max(20).default([]),
  ingredientsText: z.string().trim().min(3).max(6000),
  cookwareText: z.string().trim().max(2000).default(""),
  methodText: z.string().trim().min(10).max(12000),
  allergenNotes: z.string().trim().max(2000).default(""),
  author: z.string().trim().min(2).max(120).default("Vegan Cook"),
  publishedAt: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["published", "draft"]),
  cuisine: cuisineEnum.nullish(),
  spiceLevel: spiceEnum.nullish(),
  mealTypes: z.array(mealTypeEnum).max(5).default([]),
  calories: z.coerce.number().int().min(0).max(10000).nullish(),
  imageUrl: z
    .string()
    .trim()
    .max(600)
    .refine((v) => v === "" || /^https?:\/\//i.test(v), "Image link must start with http:// or https://")
    .default(""),
  imageAlt: z.string().trim().max(200).default(""),
});


export type RecipeInput = z.infer<typeof recipeInput>;

export const idInput = z.object({ id: z.string().max(80) });

export const publishInput = z.object({
  id: z.string().uuid(),
  asDraft: z.boolean().default(false),
});

export const rejectInput = z.object({
  id: z.string().uuid(),
  notes: z.string().trim().max(1000).default(""),
});

/**
 * Reads the caller's own admin row as the caller (RLS-scoped: users may only
 * see their own roles), so no privileged helper is exposed to signed-in users.
 */
export async function isCallerAdmin(context: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  userId: string;
}): Promise<boolean> {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return data != null;
}

/** Throws unless the caller holds the admin role (checked as the user, not as admin). */
export async function assertAdmin(context: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  userId: string;
}) {
  if (!(await isCallerAdmin(context))) throw new Error("Forbidden: admin access required.");
}

