import recipeHero from "@/assets/recipe-hero.jpg";

export type Skill = "Beginner" | "Intermediate" | "Expert";
export type Allergen = "Sulphite" | "Peanut" | "Soy" | "Gluten" | "Tree Nuts";

export interface Recipe {
  id: string;
  title: string;
  blurb: string;
  image: string;
  timeMinutes: number;
  skill: Skill;
  contains: Allergen[];
}

export const ALL_ALLERGENS: Allergen[] = [
  "Sulphite",
  "Peanut",
  "Soy",
  "Gluten",
  "Tree Nuts",
];

export const recipes: Recipe[] = [
  {
    id: "celeriac-mille-feuille",
    title: "Smoked Celeriac Mille-Feuille with Fermented Truffle Jus",
    blurb:
      "A study in root vegetable compression. Forty thin layers of celeriac, slow-smoked over applewood, bound with a cashew-based koji cream, and pressed overnight. Served sharp and monolithic.",
    image: recipeHero,
    timeMinutes: 270,
    skill: "Expert",
    contains: ["Tree Nuts"],
  },
  {
    id: "tomato-galette",
    title: "Charred Heirloom Tomato & Thyme Galette",
    blurb:
      "Blistered heirlooms layered over a buckwheat crust with fresh thyme and a drizzle of olive oil. Rustic, fragrant, and ready in under an hour.",
    image: recipeHero,
    timeMinutes: 45,
    skill: "Intermediate",
    contains: [],
  },
  {
    id: "chickpea-stew",
    title: "Slow-Braised Chickpea & Preserved Lemon Stew",
    blurb:
      "A quiet weeknight bowl built on garlic, smoked paprika and brined lemon peel. Forgiving, deeply flavoured, almost impossible to overcook.",
    image: recipeHero,
    timeMinutes: 60,
    skill: "Beginner",
    contains: [],
  },
  {
    id: "miso-aubergine",
    title: "Charred Miso Aubergine with Black Sesame",
    blurb:
      "Halved aubergines lacquered in white miso glaze, broiled until caramelised, finished with toasted sesame and scallion oil.",
    image: recipeHero,
    timeMinutes: 35,
    skill: "Beginner",
    contains: ["Soy"],
  },
  {
    id: "wild-mushroom-risotto",
    title: "Wild Mushroom & Saffron Risotto",
    blurb:
      "Carnaroli rice coaxed slowly into silk with porcini stock, saffron threads and a finishing knot of vegan cultured butter.",
    image: recipeHero,
    timeMinutes: 50,
    skill: "Intermediate",
    contains: ["Sulphite"],
  },
];

export function pickRecipeOfTheDay(pool: Recipe[]): Recipe {
  if (pool.length === 0) return recipes[0];
  // Stable pick per UTC day so SSR and client agree.
  const day = Math.floor(Date.now() / 86_400_000);
  return pool[day % pool.length];
}
