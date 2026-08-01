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
  timeMinutes: number;
  servings: number;
  skill: Skill;
  contains: Allergen[];
  ingredients: Ingredient[];
  cookware: string[];
  method: MethodStep[];
  allergenNotes?: string;
  author: string;
  publishedAt: string; // ISO date
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
    id: "lentil-dal-rice",
    title: "Everyday Lentil Dal with Steamed Rice",
    blurb:
      "Split red lentils cooked soft with turmeric and ginger, finished with a hot tempering of cumin, garlic and chilli poured over the top. The most reliable dinner in the whole archive.",
    timeMinutes: 40,
    servings: 4,
    skill: "Beginner",
    contains: [],
    author: "Vegan Cook",
    publishedAt: "2026-07-24",
    ingredients: [
      { qty: "250 g", item: "split red lentils (masoor dal), rinsed" },
      { qty: "1 tsp", item: "ground turmeric" },
      { qty: "1 thumb", item: "ginger, finely grated" },
      { qty: "1 litre", item: "water" },
      { qty: "3 tbsp", item: "neutral oil or coconut oil" },
      { qty: "1 tsp", item: "cumin seeds" },
      { qty: "4 cloves", item: "garlic, thinly sliced" },
      { qty: "2", item: "dried red chillies" },
      { qty: "1", item: "tomato, chopped" },
      { qty: "300 g", item: "basmati rice" },
      { qty: "to taste", item: "salt, lemon, coriander" },
    ],
    cookware: ["Deep saucepan", "Small frying pan for tempering", "Rice pot with lid"],
    method: [
      {
        title: "Simmer the lentils",
        body: "Bring lentils, turmeric, ginger and water to a boil. Skim the foam, lower the heat and simmer uncovered for 25 minutes until the lentils collapse into a loose porridge. Salt generously.",
      },
      {
        title: "Cook the rice",
        body: "Rinse the basmati until the water runs clear. Cook with 1.5 parts water to 1 part rice, lid on, 10 minutes, then rest off heat for 5 minutes and fork through.",
      },
      {
        title: "Make the tempering",
        body: "Heat the oil until it shimmers. Add cumin seeds; when they crackle, add garlic and chillies and fry until the garlic is pale gold — no darker. Add tomato and cook 2 minutes.",
      },
      {
        title: "Combine and finish",
        body: "Pour the tempering into the dal, oil and all, and stir once. Finish with lemon and coriander. Serve over rice.",
      },
    ],
  },
  {
    id: "dosa",
    title: "Fermented Rice & Urad Dosa",
    blurb:
      "A thin, lacy, sour-edged crepe from a naturally fermented batter. Nothing but rice, lentils and time — crisp at the rim, soft at the centre.",
    timeMinutes: 60,
    servings: 4,
    skill: "Intermediate",
    contains: [],
    allergenNotes:
      "Naturally gluten-free and nut-free, but check that your asafoetida (if using) is wheat-free — most commercial blends are cut with wheat flour.",
    author: "Vegan Cook",
    publishedAt: "2026-07-25",
    ingredients: [
      { qty: "300 g", item: "idli or short-grain rice" },
      { qty: "100 g", item: "skinned urad dal" },
      { qty: "1/2 tsp", item: "fenugreek seeds" },
      { qty: "as needed", item: "water for soaking and grinding" },
      { qty: "1 tsp", item: "salt" },
      { qty: "as needed", item: "sesame or sunflower oil for the pan" },
    ],
    cookware: ["Two large bowls", "High-speed blender or wet grinder", "Flat cast-iron or non-stick tawa", "Ladle"],
    method: [
      {
        title: "Soak",
        body: "Soak the rice in one bowl. Soak the urad dal with the fenugreek in another. Leave both 5–6 hours at room temperature.",
      },
      {
        title: "Grind",
        body: "Grind the dal first with a little cold water into a light, airy paste. Grind the rice separately to a fine, slightly grainy batter. Combine by hand — the warmth helps.",
      },
      {
        title: "Ferment",
        body: "Cover loosely and leave 8–12 hours somewhere warm, until visibly risen and smelling pleasantly sour. Stir in the salt gently, keeping the bubbles.",
      },
      {
        title: "Cook the dosa",
        body: "Heat the tawa to medium-high. Pour a ladle of batter at the centre and spiral outward fast with the base of the ladle. Drizzle oil around the rim. Cook until the underside is deep gold and the edges lift, 2–3 minutes. Do not flip — fold and serve.",
      },
    ],
  },
  {
    id: "idli",
    title: "Steamed Idli, Soft and Pillowy",
    blurb:
      "Same fermented family as dosa, steamed instead of griddled. Weightless, faintly tangy, and the gentlest thing you can put on a plate.",
    timeMinutes: 45,
    servings: 4,
    skill: "Intermediate",
    contains: [],
    author: "Vegan Cook",
    publishedAt: "2026-07-26",
    ingredients: [
      { qty: "300 g", item: "idli rice or parboiled rice" },
      { qty: "100 g", item: "skinned urad dal" },
      { qty: "1/2 tsp", item: "fenugreek seeds" },
      { qty: "1 tsp", item: "salt" },
      { qty: "as needed", item: "oil for greasing the moulds" },
    ],
    cookware: ["Idli steamer with plates", "Blender or wet grinder", "Large bowl"],
    method: [
      {
        title: "Soak and grind",
        body: "Soak rice and dal (with fenugreek) separately for 5 hours. Grind the dal to a fluffy paste, the rice to a slightly coarse batter, then fold together.",
      },
      {
        title: "Ferment",
        body: "Rest 8–12 hours in a warm spot until doubled. Fold in the salt without knocking out the air.",
      },
      {
        title: "Steam",
        body: "Grease the idli plates, fill three-quarters full, and steam over rolling water for 10–12 minutes until a skewer comes out clean.",
      },
      {
        title: "Rest and unmould",
        body: "Wait 3 minutes before unmoulding — they release cleanly and stay intact. Serve hot with chutney or dal.",
      },
    ],
  },
  {
    id: "hummus-pita",
    title: "Slow-Blended Hummus with Warm Pita",
    blurb:
      "Chickpeas cooked past the point of politeness, then blended with ice water until the texture turns to cream. Warm flatbread does the rest.",
    timeMinutes: 50,
    servings: 6,
    skill: "Beginner",
    contains: ["Gluten", "Tree Nuts"],
    allergenNotes:
      "Tahini is sesame — treated here alongside tree nuts because it sits in the same 'seed and nut paste' risk group for many readers. Pita contains wheat gluten; serve with cucumber spears or gluten-free flatbread instead.",
    author: "Vegan Cook",
    publishedAt: "2026-07-27",
    ingredients: [
      { qty: "2 x 400 g", item: "tins chickpeas, drained" },
      { qty: "1/2 tsp", item: "bicarbonate of soda" },
      { qty: "150 g", item: "light tahini" },
      { qty: "2 cloves", item: "garlic" },
      { qty: "1", item: "lemon, juiced" },
      { qty: "60 ml", item: "ice water" },
      { qty: "to taste", item: "salt, cumin, olive oil" },
      { qty: "6", item: "pita breads" },
    ],
    cookware: ["Saucepan", "High-speed blender or food processor", "Rubber spatula"],
    method: [
      {
        title: "Overcook the chickpeas",
        body: "Simmer the chickpeas with the bicarbonate of soda and plenty of water for 20 minutes, until the skins slip and the chickpeas crush with no resistance. Drain hot.",
      },
      {
        title: "Blend hot",
        body: "Blend chickpeas with garlic, lemon and salt while hot. Add tahini, then stream in the ice water and run the machine for a full 3 minutes. It will look too loose — it sets as it cools.",
      },
      {
        title: "Warm the pita and serve",
        body: "Char the pita briefly over a flame or in a dry pan. Spread the hummus wide, dimple the surface, pool olive oil in the well and dust with cumin.",
      },
    ],
  },
  {
    id: "vegan-pasta",
    title: "Vegan Pasta with Roasted Tomato & Cashew Cream Sauce",
    blurb:
      "A sauce built from roasted tomatoes, garlic and soaked cashews, blended until it clings. Rich in the way dairy is rich, without any of it.",
    timeMinutes: 45,
    servings: 4,
    skill: "Beginner",
    contains: ["Gluten", "Tree Nuts"],
    allergenNotes:
      "Cashews carry the sauce. For a nut-free version use 200 g silken tofu (contains soy) or blended white beans. Use gluten-free pasta to drop the gluten.",
    author: "Vegan Cook",
    publishedAt: "2026-07-28",
    ingredients: [
      { qty: "600 g", item: "ripe tomatoes, halved" },
      { qty: "1 whole head", item: "garlic, top sliced off" },
      { qty: "120 g", item: "raw cashews, soaked 30 min in hot water" },
      { qty: "2 tbsp", item: "nutritional yeast" },
      { qty: "1 tbsp", item: "olive oil, plus more for roasting" },
      { qty: "400 g", item: "dried pasta" },
      { qty: "1 handful", item: "basil leaves" },
      { qty: "to taste", item: "salt, black pepper, chilli flakes" },
    ],
    cookware: ["Roasting tray", "Large pasta pot", "Blender", "Wide sauté pan"],
    method: [
      {
        title: "Roast",
        body: "Toss tomatoes and the garlic head in oil and salt. Roast at 200°C / 400°F for 30 minutes until collapsed and lightly scorched at the edges.",
      },
      {
        title: "Blend the sauce",
        body: "Squeeze the roasted garlic cloves into the blender with the tomatoes, drained cashews and nutritional yeast. Blend until completely smooth and glossy.",
      },
      {
        title: "Cook the pasta",
        body: "Boil the pasta in well-salted water until one minute short of the packet time. Reserve a mug of the cooking water.",
      },
      {
        title: "Bring it together",
        body: "Warm the sauce in the sauté pan, add the pasta and a splash of pasta water, and toss hard for a minute until the sauce coats every piece. Finish with basil and chilli.",
      },
    ],
  },
  {
    id: "vegan-pancakes",
    title: "Weekend Vegan Pancakes",
    blurb:
      "Thick, tender, quietly tangy pancakes leavened with soured plant milk. Ten minutes of mixing, and the stack disappears faster than that.",
    timeMinutes: 25,
    servings: 3,
    skill: "Beginner",
    contains: ["Gluten"],
    allergenNotes:
      "Wheat flour contains gluten — a 1:1 gluten-free blend works with no other changes. Use oat or rice milk to keep it soy-free and nut-free.",
    author: "Vegan Cook",
    publishedAt: "2026-07-29",
    ingredients: [
      { qty: "300 ml", item: "oat milk" },
      { qty: "1 tbsp", item: "apple cider vinegar or lemon juice" },
      { qty: "250 g", item: "plain flour" },
      { qty: "2 tbsp", item: "sugar" },
      { qty: "2 tsp", item: "baking powder" },
      { qty: "1/2 tsp", item: "bicarbonate of soda" },
      { qty: "1/2 tsp", item: "salt" },
      { qty: "3 tbsp", item: "melted vegan butter or neutral oil" },
      { qty: "to serve", item: "maple syrup, berries" },
    ],
    cookware: ["Two mixing bowls", "Whisk", "Non-stick frying pan or flat griddle", "Spatula"],
    method: [
      {
        title: "Sour the milk",
        body: "Stir the vinegar into the oat milk and leave 5 minutes until it thickens and curdles slightly. This is what makes them tender.",
      },
      {
        title: "Mix, barely",
        body: "Whisk the dry ingredients. Pour in the soured milk and melted butter and fold just until no dry flour remains — lumps are correct. Rest 5 minutes.",
      },
      {
        title: "Cook",
        body: "Cook over medium-low in a lightly greased pan, a heaped spoon at a time. Flip when the surface bubbles and the edges look matte, about 2 minutes, then 1 minute more.",
      },
      {
        title: "Stack",
        body: "Keep the stack in a warm oven while you finish the batch. Serve with maple syrup and berries.",
      },
    ],
  },
  {
    id: "chickpea-stew",
    title: "Slow-Braised Chickpea & Preserved Lemon Stew",
    blurb:
      "A quiet weeknight bowl built on garlic, smoked paprika and brined lemon peel. Forgiving, deeply flavoured, almost impossible to overcook.",
    timeMinutes: 60,
    servings: 4,
    skill: "Beginner",
    contains: [],
    author: "Vegan Cook",
    publishedAt: "2026-07-18",
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
    timeMinutes: 35,
    servings: 2,
    skill: "Beginner",
    contains: ["Soy"],
    allergenNotes: "White miso is fermented soy. Use chickpea miso for a soy-free alternative.",
    author: "Vegan Cook",
    publishedAt: "2026-07-19",
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
    id: "tomato-galette",
    title: "Charred Heirloom Tomato & Thyme Galette",
    blurb:
      "Blistered heirlooms layered over a buckwheat crust with fresh thyme and a drizzle of olive oil. Rustic, fragrant, and ready in under an hour.",
    timeMinutes: 45,
    servings: 6,
    skill: "Intermediate",
    contains: [],
    author: "Vegan Cook",
    publishedAt: "2026-07-20",
    ingredients: [
      { qty: "200 g", item: "buckwheat flour" },
      { qty: "120 g", item: "vegan butter, cold and cubed" },
      { qty: "60 ml", item: "ice water" },
      { qty: "500 g", item: "heirloom tomatoes, mixed colours" },
      { qty: "2 tbsp", item: "fresh thyme leaves" },
      { qty: "2 tbsp", item: "extra virgin olive oil" },
      { qty: "1 tsp", item: "flaky sea salt" },
    ],
    cookware: ["Mixing bowl", "Rolling pin", "Sheet pan with parchment", "Sharp paring knife"],
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
    id: "wild-mushroom-risotto",
    title: "Wild Mushroom & Saffron Risotto",
    blurb:
      "Carnaroli rice coaxed slowly into silk with porcini stock, saffron threads and a finishing knot of vegan cultured butter.",
    timeMinutes: 50,
    servings: 4,
    skill: "Intermediate",
    contains: ["Sulphite"],
    allergenNotes:
      "Dried porcini and white wine commonly contain sulphites. Use a sulphite-free wine and fresh mushrooms to avoid.",
    author: "Vegan Cook",
    publishedAt: "2026-07-21",
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
        body: "In a separate pan, sear the mushrooms hard in a dry pan, then finish with butter and salt.",
      },
      {
        title: "Mantecare and serve",
        body: "Off heat, beat in remaining butter until glossy. Fold through mushrooms, finish with a squeeze of lemon and cracked pepper.",
      },
    ],
  },
  {
    id: "celeriac-mille-feuille",
    title: "Smoked Celeriac Mille-Feuille with Truffle Jus",
    blurb:
      "A study in root vegetable compression. Forty thin layers of celeriac, slow-smoked over applewood, bound with a cashew-koji cream, and pressed overnight.",
    timeMinutes: 270,
    servings: 4,
    skill: "Expert",
    contains: ["Tree Nuts"],
    allergenNotes:
      "Cashew cream forms the structural binder. Substitute with sunflower seed cream for a tree-nut-free version, though the texture will be looser.",
    author: "Vegan Cook",
    publishedAt: "2026-07-22",
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
];

/** Stable per-UTC-day index so SSR and client agree and the feature rotates daily. */
export function dayIndex(now: number = Date.now()): number {
  return Math.floor(now / 86_400_000);
}

/** Rotates across the whole catalogue, one recipe per day. */
export function pickRecipeOfTheDay(pool: Recipe[] = recipes, now?: number): Recipe {
  const list = pool.length > 0 ? pool : recipes;
  return list[dayIndex(now) % list.length]!;
}

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find((r) => r.id === id);
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}
