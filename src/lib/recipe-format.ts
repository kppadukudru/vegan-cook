import type { Allergen, Ingredient, MethodStep, Skill } from "@/data/recipes";
import { ALL_ALLERGENS } from "@/data/recipes";

/** URL-safe slug from a title, used as the recipe id. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-|-$/g, "");
}

const UNIT =
  "g|kg|mg|ml|l|litre|litres|tsp|tbsp|cup|cups|clove|cloves|tin|tins|can|cans|handful|handfuls|pinch|slice|slices|piece|pieces|sprig|sprigs|bunch|thumb|sheet|sheets|packet|packets";

const QTY_RE = new RegExp(
  `^((?:about\\s+|approx\\.?\\s+)?[0-9¼½¾⅓⅔.,/\\-–]+(?:\\s*x\\s*[0-9.,/]+)?\\s*(?:${UNIT})?\\b\\.?)\\s+(.+)$`,
  "i",
);

function cleanLine(line: string): string {
  return line.replace(/^\s*(?:[-*•·–—]|\d+[.)])\s*/, "").trim();
}

function lines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map(cleanLine)
    .filter((l) => l.length > 0);
}

/**
 * Free text -> the site's { qty, item } shape, so submitted recipes render
 * exactly like editorial ones. Accepts "250 g flour", "250 g | flour",
 * "250 g - flour" or a bare ingredient with no quantity.
 */
export function parseIngredients(text: string): Ingredient[] {
  return lines(text).map((line) => {
    const piped = line.split(/\s*[|]\s*/);
    if (piped.length >= 2 && piped[0] && piped[0].length <= 24) {
      return { qty: piped[0].trim(), item: piped.slice(1).join(" ").trim() };
    }
    const dashed = line.match(/^(.{1,24}?)\s+[-–]\s+(.+)$/);
    if (dashed && /\d/.test(dashed[1] ?? "")) {
      return { qty: (dashed[1] ?? "").trim(), item: (dashed[2] ?? "").trim() };
    }
    const m = line.match(QTY_RE);
    if (m && m[1] && m[2]) {
      return { qty: m[1].trim().replace(/\.$/, ""), item: m[2].trim() };
    }
    return { qty: "", item: line };
  });
}

/** Free text -> a clean list (cookware, and anything else list-shaped). */
export function parseList(text: string): string[] {
  const out = lines(text).flatMap((line) =>
    line.includes(",") && line.length > 40 ? line.split(/\s*,\s*/) : [line],
  );
  return out
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .slice(0, 30);
}

/**
 * Free text -> titled method steps. Recognises "Title: body"; otherwise the
 * paragraph becomes a body under a generated "Step n" heading.
 */
export function parseMethod(text: string): MethodStep[] {
  const blocks = text
    .split(/\r?\n\s*\r?\n|\r?\n/)
    .map(cleanLine)
    .filter(Boolean);

  return blocks.map((block, i) => {
    const m = block.match(/^([^:]{3,60}):\s*(.+)$/s);
    if (m && m[1] && m[2] && !/\d\s*(?:g|ml|min)\b/i.test(m[1])) {
      return { title: m[1].trim(), body: m[2].trim() };
    }
    return { title: `Step ${i + 1}`, body: block };
  });
}

/** Only allergens the site declares, so filters keep working. */
export function normalizeAllergens(input: readonly string[]): Allergen[] {
  const wanted = new Set(input.map((a) => a.toLowerCase().trim()));
  return ALL_ALLERGENS.filter((a) => wanted.has(a.toLowerCase()));
}

/** Structured -> editable text, for the admin editor round-trip. */
export function ingredientsToText(list: Ingredient[]): string {
  return list.map((i) => (i.qty ? `${i.qty} | ${i.item}` : i.item)).join("\n");
}

export function methodToText(steps: MethodStep[]): string {
  return steps.map((s) => `${s.title}: ${s.body}`).join("\n\n");
}

export function listToText(list: string[]): string {
  return list.join("\n");
}

export function isSkill(value: string): value is Skill {
  return value === "Beginner" || value === "Intermediate" || value === "Expert";
}
