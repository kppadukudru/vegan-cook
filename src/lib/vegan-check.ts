/**
 * Shared (client + server) guard against non-vegan ingredients.
 * Runs in the browser for instant feedback and again on the server so it
 * cannot be bypassed.
 */

export interface NonVeganHit {
  term: string;
  line: string;
}

// Ordered longest-first at match time. Keep entries lowercase.
const NON_VEGAN_TERMS: string[] = [
  // dairy
  "milk", "whole milk", "skim milk", "buttermilk", "cream", "double cream",
  "single cream", "sour cream", "creme fraiche", "crème fraîche", "half and half",
  "cheese", "parmesan", "parmigiano", "pecorino", "mozzarella", "cheddar",
  "feta", "ricotta", "mascarpone", "gruyere", "gruyère", "halloumi", "paneer",
  "yoghurt", "yogurt", "curd", "dahi", "ghee", "khoya", "condensed milk",
  "evaporated milk", "milk powder", "whey", "casein", "caseinate", "lactose",
  "custard", "ice cream",
  // eggs
  "egg", "eggs", "egg white", "egg whites", "egg yolk", "egg yolks",
  "albumen", "mayonnaise", "mayo", "meringue", "aioli",
  // meat & poultry
  "meat", "beef", "steak", "veal", "mince", "pork", "ham", "bacon", "pancetta",
  "prosciutto", "salami", "chorizo", "sausage", "lard", "tallow", "suet",
  "chicken", "turkey", "duck", "goose", "lamb", "mutton", "goat meat",
  "venison", "rabbit", "liver", "pate", "pâté", "bone broth", "chicken stock",
  "beef stock", "chicken broth", "beef broth", "gelatin", "gelatine",
  // fish & seafood
  "fish", "fish sauce", "salmon", "tuna", "cod", "haddock", "sardine",
  "sardines", "anchovy", "anchovies", "mackerel", "trout", "prawn", "prawns",
  "shrimp", "crab", "lobster", "squid", "calamari", "octopus", "oyster",
  "oysters", "oyster sauce", "mussel", "mussels", "clam", "clams", "scallop",
  "scallops", "caviar", "roe", "bonito", "dashi", "worcestershire",
  // other animal products
  "honey", "beeswax", "royal jelly", "propolis", "shellac", "carmine",
  "cochineal", "isinglass", "rennet", "collagen", "keratin", "bone char",
];

// Vegan phrases that legitimately contain a flagged word.
const ALLOWED_PHRASES: string[] = [
  "coconut milk", "almond milk", "soy milk", "soya milk", "oat milk",
  "rice milk", "cashew milk", "hemp milk", "hazelnut milk", "macadamia milk",
  "pea milk", "plant milk", "plant-based milk", "non-dairy milk",
  "vegan milk", "condensed coconut milk", "coconut cream", "cashew cream",
  "oat cream", "soy cream", "vegan cream", "vegan cream cheese",
  "coconut yoghurt", "coconut yogurt", "soy yoghurt", "soy yogurt",
  "vegan yoghurt", "vegan yogurt", "plant yoghurt", "plant yogurt",
  "vegan cheese", "plant-based cheese", "nutritional yeast cheese",
  "vegan butter", "vegan mayonnaise", "vegan mayo", "vegan egg",
  "egg replacer", "egg substitute", "flax egg", "chia egg", "aquafaba",
  "vegan parmesan", "vegan feta", "vegan sausage", "vegan bacon",
  "vegan chicken", "vegan beef", "vegan mince", "vegan meat",
  "mock meat", "soy curd", "bean curd", "vegetable stock", "vegetable broth",
  "mushroom broth", "milk thistle", "coconut butter", "peanut butter",
  "almond butter", "cashew butter", "nut butter", "cocoa butter",
  "shea butter", "apple butter", "milkweed", "eggplant", "egg plant",
  "eggplants", "buttermilk substitute", "vegan buttermilk", "milk chocolate substitute",
];

function normalise(input: string): string {
  return input.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Blank out the parts of the line covered by explicitly-vegan phrases. */
function maskAllowed(line: string): string {
  let masked = line;
  for (const phrase of ALLOWED_PHRASES) {
    let idx = masked.indexOf(phrase);
    while (idx !== -1) {
      masked = masked.slice(0, idx) + " ".repeat(phrase.length) + masked.slice(idx + phrase.length);
      idx = masked.indexOf(phrase, idx + phrase.length);
    }
  }
  return masked;
}

function hasWord(haystack: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, "i").test(haystack);
}

/** Returns every non-vegan term found across the supplied lines. */
export function findNonVeganTerms(lines: string[]): NonVeganHit[] {
  const hits: NonVeganHit[] = [];
  for (const raw of lines) {
    const line = normalise(raw);
    if (!line) continue;
    const masked = maskAllowed(line);
    for (const term of NON_VEGAN_TERMS) {
      if (hasWord(masked, term)) {
        hits.push({ term, line: raw.trim() });
        break; // one hit per line is enough to flag it
      }
    }
  }
  return hits;
}

export function describeNonVeganHits(hits: NonVeganHit[]): string {
  if (hits.length === 0) return "";
  const list = hits.map((h) => `"${h.term}" in "${h.line}"`).join("; ");
  return `Every recipe here has to be fully plant-based. Found ${list}. Swap for a plant-based alternative and try again.`;
}
