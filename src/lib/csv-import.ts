import { ALL_ALLERGENS, ALL_CUISINES, ALL_MEAL_TYPES, ALL_SKILLS, ALL_SPICE_LEVELS } from "@/data/recipes";
import { recipeInput, type RecipeInput } from "@/lib/admin-schemas";
import { slugify } from "@/lib/recipe-format";
import { z } from "zod";

export const CSV_REQUIRED = [
  "title",
  "blurb",
  "time_minutes",
  "servings",
  "skill",
  "ingredients",
  "method",
] as const;

export const CSV_OPTIONAL = [
  "id",
  "cookware",
  "contains",
  "allergen_notes",
  "author",
  "published_at",
  "cuisine",
  "spice_level",
  "meal_types",
  "calories",
  "status",
  "image_url",
  "image_alt",
  "image_caption",
] as const;

export const CSV_COLUMNS = [...CSV_REQUIRED, ...CSV_OPTIONAL];

export const MAX_IMPORT_ROWS = 500;

/** A ready-to-fill template with one worked example row. */
export function templateCsv(): string {
  const example: Record<string, string> = {
    title: "Smoky Chickpea Stew",
    blurb: "A one-pot stew with smoked paprika, tomatoes and chickpeas.",
    time_minutes: "40",
    servings: "4",
    skill: "Beginner",
    ingredients: "2 tbsp | olive oil\n1 | onion, diced\n400 g | chickpeas, drained",
    method:
      "Sweat the base: Warm the oil, add the onion and cook until soft.\nSimmer: Add the chickpeas and tomatoes, simmer 20 minutes.",
    id: "smoky-chickpea-stew",
    cookware: "Large pan\nWooden spoon",
    contains: "Sulphite",
    allergen_notes: "Check your stock cube for gluten.",
    author: "Vegan Cook",
    published_at: "2026-08-01",
    cuisine: "Mediterranean",
    spice_level: "Mild",
    meal_types: "Lunch, Dinner",
    calories: "410",
    status: "draft",
    image_url: "https://example.com/photos/smoky-chickpea-stew.jpg",
    image_alt: "A bowl of smoky chickpea stew with flatbread",
    image_caption: "Stock photo, not the actual dish.",
  };
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return `${CSV_COLUMNS.join(",")}\n${CSV_COLUMNS.map((c) => escape(example[c] ?? "")).join(",")}\n`;
}

function textBlock(value: string): string {
  const withBreaks = value.replace(/\\n/g, "\n").replace(/\s*;\s*/g, "\n");
  return withBreaks
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
}

function commaList(value: string): string[] {
  return value
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function matchOption<T extends string>(options: readonly T[], value: string): T | undefined {
  const wanted = value.trim().toLowerCase();
  return options.find((o) => o.toLowerCase() === wanted);
}

export interface ParsedRow {
  line: number;
  title: string;
  /** Valid rows carry the payload; invalid rows carry problems instead. */
  value?: RecipeInput;
  problems: string[];
}

/** Normalises one raw CSV record into the same payload the editor submits. */
export function normalizeCsvRow(raw: Record<string, string>, line: number): ParsedRow {
  const get = (key: string) => (raw[key] ?? "").toString().trim();
  const problems: string[] = [];
  const title = get("title");

  const skillRaw = get("skill");
  const skill = skillRaw ? matchOption(ALL_SKILLS, skillRaw) : "Beginner";
  if (!skill) problems.push(`Unknown skill "${skillRaw}" (use Beginner, Intermediate or Expert).`);

  const cuisineRaw = get("cuisine");
  const cuisine = cuisineRaw ? matchOption(ALL_CUISINES, cuisineRaw) : null;
  if (cuisineRaw && !cuisine) problems.push(`Unknown cuisine "${cuisineRaw}".`);

  const spiceRaw = get("spice_level");
  const spiceLevel = spiceRaw ? matchOption(ALL_SPICE_LEVELS, spiceRaw) : null;
  if (spiceRaw && !spiceLevel) problems.push(`Unknown spice level "${spiceRaw}".`);

  const mealTypes: string[] = [];
  for (const entry of commaList(get("meal_types"))) {
    const match = matchOption(ALL_MEAL_TYPES, entry);
    if (match) mealTypes.push(match);
    else problems.push(`Unknown meal type "${entry}".`);
  }

  const contains = commaList(get("contains")).flatMap((entry) => {
    const match = matchOption(ALL_ALLERGENS, entry);
    if (match) return [match];
    problems.push(`Unknown allergen "${entry}".`);
    return [];
  });

  const caloriesRaw = get("calories");
  const statusRaw = get("status").toLowerCase();
  const publishedAt = get("published_at") || new Date().toISOString().slice(0, 10);

  const candidate = {
    id: get("id") || slugify(title),
    title,
    blurb: get("blurb"),
    timeMinutes: get("time_minutes"),
    servings: get("servings"),
    skill: skill ?? "Beginner",
    contains,
    ingredientsText: textBlock(get("ingredients")),
    cookwareText: textBlock(get("cookware")),
    methodText: textBlock(get("method")),
    allergenNotes: get("allergen_notes"),
    author: get("author") || "Vegan Cook",
    publishedAt,
    status: statusRaw === "published" ? "published" : "draft",
    cuisine,
    spiceLevel,
    mealTypes,
    calories: caloriesRaw === "" ? null : caloriesRaw,
    imageUrl: get("image_url"),
    imageAlt: get("image_alt"),
    imageCaption: get("image_caption"),
  };

  const parsed = recipeInput.safeParse(candidate);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      problems.push(`${issue.path.join(".") || "row"}: ${issue.message}`);
    }
  }

  if (problems.length > 0 || !parsed.success) {
    return { line, title: title || "(untitled)", problems };
  }
  return { line, title, value: parsed.data, problems: [] };
}

export const importInput = z.object({
  rows: z.array(recipeInput).min(1).max(MAX_IMPORT_ROWS),
  publish: z.boolean().default(false),
});

export type ImportInput = z.infer<typeof importInput>;

export interface ImportRowResult {
  id: string;
  title: string;
  outcome: "created" | "updated" | "skipped";
  message?: string;
}
