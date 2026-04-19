import recipeHero from "@/assets/recipe-hero.jpg";

export type Skill = "Beginner" | "Intermediate" | "Expert";
export type Allergen = "Sulphite" | "Peanut" | "Soy" | "Gluten" | "Tree Nuts";

export interface Ingredient {
  qty: string;
  item: string;
}

export interface MethodStep {
  title: string;
  body: string;
}

export interface Recipe {
  id: string;
  title: string;
  blurb: string;
  image: string;
  timeMinutes: number;
  servings: number;
  skill: Skill;
  contains: Allergen[];
  ingredients: Ingredient[];
  cookware: string[];
  method: MethodStep[];
  allergenNotes?: string;
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
    servings: 4,
    skill: "Expert",
    contains: ["Tree Nuts"],
    allergenNotes:
      "Cashew cream forms the structural binder. Substitute with sunflower seed cream for a tree-nut-free version, though texture will be looser.",
    ingredients: [
      { qty: "2 large", item: "celeriac, peeled" },
      { qty: "200 g", item: "raw cashews, soaked overnight" },
      { qty: "2 tbsp", item: "white koji rice" },
      { qty: "1 tbsp", item: "black truffle, finely grated" },
      { qty: "300 ml", item: "vegetable stock, dark and reduced" },
      { qty: "60 ml", item: "applewood smoke oil" },
      { qty: "to taste", item: "flaky sea salt" },
    ],
    cookware: [
      "Mandoline",
      "Stovetop smoker",
      "Loaf tin lined with parchment",
      "High-speed blender",
      "Fine mesh sieve",
    ],
    method: [
      {
        title: "Slice and smoke",
        body: "Use a mandoline to cut celeriac into 1.5 mm sheets. Cold-smoke over applewood for 20 minutes, then blanch briefly until just pliable.",
      },
      {
        title: "Build the cream",
        body: "Blend soaked cashews with koji and a splash of warm stock until silken. Season aggressively — it will mellow once layered.",
      },
      {
        title: "Layer and press",
        body: "Stack 40 alternating sheets of celeriac and cream into the lined tin. Weight with a second tin and refrigerate overnight.",
      },
      {
        title: "Reduce the jus",
        body: "Reduce remaining stock to a glossy syrup. Whisk in grated truffle off the heat. Hold warm.",
      },
      {
        title: "Slice and serve",
        body: "Trim the pressed block into clean rectangles. Sear cut faces in a dry pan. Plate with a pool of jus and flaky salt.",
      },
    ],
  },
  {
    id: "tomato-galette",
    title: "Charred Heirloom Tomato & Thyme Galette",
    blurb:
      "Blistered heirlooms layered over a buckwheat crust with fresh thyme and a drizzle of olive oil. Rustic, fragrant, and ready in under an hour.",
    image: recipeHero,
    timeMinutes: 45,
    servings: 6,
    skill: "Intermediate",
    contains: [],
    ingredients: [
      { qty: "200 g", item: "buckwheat flour" },
      { qty: "120 g", item: "vegan butter, cold and cubed" },
      { qty: "60 ml", item: "ice water" },
      { qty: "500 g", item: "heirloom tomatoes, mixed colours" },
      { qty: "2 tbsp", item: "fresh thyme leaves" },
      { qty: "2 tbsp", item: "extra virgin olive oil" },
      { qty: "1 tsp", item: "flaky sea salt" },
    ],
    cookware: [
      "Mixing bowl",
      "Rolling pin",
      "Sheet pan with parchment",
      "Sharp paring knife",
    ],
    method: [
      {
        title: "Make the dough",
        body: "Rub butter into flour until coarse. Add water, bring together, flatten into a disc and chill for 20 minutes.",
      },
      {
        title: "Prep the tomatoes",
        body: "Slice into 1 cm rounds, salt lightly, and rest on paper towel for 10 minutes to draw out moisture.",
      },
      {
        title: "Assemble",
        body: "Roll dough into a rough 30 cm circle. Arrange tomatoes in concentric rings, leaving a 4 cm border. Fold and pleat the edge.",
      },
      {
        title: "Bake",
        body: "Bake at 220°C / 425°F for 25–30 minutes until the crust is deep gold and tomatoes are blistered. Finish with thyme and olive oil.",
      },
    ],
  },
  {
    id: "chickpea-stew",
    title: "Slow-Braised Chickpea & Preserved Lemon Stew",
    blurb:
      "A quiet weeknight bowl built on garlic, smoked paprika and brined lemon peel. Forgiving, deeply flavoured, almost impossible to overcook.",
    image: recipeHero,
    timeMinutes: 60,
    servings: 4,
    skill: "Beginner",
    contains: [],
    ingredients: [
      { qty: "2 x 400 g", item: "tins chickpeas, drained" },
      { qty: "1", item: "yellow onion, finely diced" },
      { qty: "6 cloves", item: "garlic, sliced" },
      { qty: "2 tsp", item: "smoked paprika" },
      { qty: "1", item: "preserved lemon, peel only, minced" },
      { qty: "400 ml", item: "vegetable stock" },
      { qty: "1 bunch", item: "flat-leaf parsley, chopped" },
      { qty: "to taste", item: "olive oil, salt, black pepper" },
    ],
    cookware: ["Heavy-bottomed pot", "Wooden spoon"],
    method: [
      {
        title: "Sweat the aromatics",
        body: "Warm olive oil over medium-low. Sweat onion until translucent, then add garlic and smoked paprika.",
      },
      {
        title: "Add chickpeas",
        body: "Stir in chickpeas to coat. Add stock and preserved lemon peel. Bring to a low simmer.",
      },
      {
        title: "Braise",
        body: "Cook uncovered for 35–40 minutes, crushing some chickpeas against the pot to thicken. Adjust seasoning.",
      },
      {
        title: "Finish",
        body: "Off heat, fold through parsley and a final drizzle of olive oil. Serve with crusty bread.",
      },
    ],
  },
  {
    id: "miso-aubergine",
    title: "Charred Miso Aubergine with Black Sesame",
    blurb:
      "Halved aubergines lacquered in white miso glaze, broiled until caramelised, finished with toasted sesame and scallion oil.",
    image: recipeHero,
    timeMinutes: 35,
    servings: 2,
    skill: "Beginner",
    contains: ["Soy"],
    allergenNotes: "White miso is fermented soy. Use chickpea miso for a soy-free alternative.",
    ingredients: [
      { qty: "2", item: "small aubergines, halved lengthwise" },
      { qty: "3 tbsp", item: "white miso paste" },
      { qty: "1 tbsp", item: "maple syrup" },
      { qty: "1 tbsp", item: "rice vinegar" },
      { qty: "1 tsp", item: "toasted sesame oil" },
      { qty: "2 tbsp", item: "black sesame seeds, toasted" },
      { qty: "2", item: "scallions, thinly sliced" },
    ],
    cookware: ["Sheet pan", "Small bowl", "Pastry brush", "Broiler / grill"],
    method: [
      {
        title: "Score the flesh",
        body: "Score aubergine cut faces in a tight crosshatch. Brush with neutral oil and broil cut-side up for 10 minutes until soft.",
      },
      {
        title: "Whisk the glaze",
        body: "Combine miso, maple syrup, rice vinegar and sesame oil into a thick lacquer.",
      },
      {
        title: "Glaze and finish",
        body: "Brush glaze generously over the cut faces. Broil for a further 4–6 minutes until deeply caramelised. Top with sesame and scallions.",
      },
    ],
  },
  {
    id: "wild-mushroom-risotto",
    title: "Wild Mushroom & Saffron Risotto",
    blurb:
      "Carnaroli rice coaxed slowly into silk with porcini stock, saffron threads and a finishing knot of vegan cultured butter.",
    image: recipeHero,
    timeMinutes: 50,
    servings: 4,
    skill: "Intermediate",
    contains: ["Sulphite"],
    allergenNotes: "Dried porcini and white wine commonly contain sulphites. Use a sulphite-free wine and freshly foraged mushrooms to avoid.",
    ingredients: [
      { qty: "320 g", item: "Carnaroli rice" },
      { qty: "30 g", item: "dried porcini, soaked in 500 ml hot water" },
      { qty: "200 g", item: "mixed wild mushrooms, torn" },
      { qty: "1", item: "shallot, finely diced" },
      { qty: "120 ml", item: "dry white wine" },
      { qty: "1 pinch", item: "saffron threads" },
      { qty: "60 g", item: "vegan cultured butter" },
      { qty: "to taste", item: "salt, black pepper, lemon" },
    ],
    cookware: ["Heavy saucepan", "Wide risotto pan", "Wooden spoon", "Ladle"],
    method: [
      {
        title: "Build the stock",
        body: "Strain the porcini soaking liquid into a saucepan. Add saffron and keep warm just below a simmer.",
      },
      {
        title: "Toast the rice",
        body: "Sweat shallot in a slick of oil until translucent. Add rice and toast for 2 minutes until edges turn glassy. Deglaze with wine.",
      },
      {
        title: "Coax the risotto",
        body: "Add stock one ladle at a time, stirring gently and waiting for absorption between additions. Cook for 16–18 minutes until al dente.",
      },
      {
        title: "Sear the mushrooms",
        body: "In a separate pan, sear wild mushrooms hard in a dry pan, then finish with butter and salt.",
      },
      {
        title: "Mantecare and serve",
        body: "Off heat, beat in remaining butter until glossy. Fold through mushrooms, finish with a squeeze of lemon and cracked pepper.",
      },
    ],
  },
];

export function pickRecipeOfTheDay(pool: Recipe[]): Recipe {
  if (pool.length === 0) return recipes[0];
  // Stable pick per UTC day so SSR and client agree.
  const day = Math.floor(Date.now() / 86_400_000);
  return pool[day % pool.length];
}

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find((r) => r.id === id);
}
