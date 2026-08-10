/** Editable page copy (About, and any future prose page) stored in the database. */
export interface SitePage {
  id: string;
  heading: string;
  body: string;
  metaTitle: string;
  metaDescription: string;
  status: "published" | "draft";
}

/** Used when the row is missing, so the page never renders empty. */
export const ABOUT_FALLBACK: SitePage = {
  id: "about",
  heading: "A kitchen notebook for people who read the label before the menu.",
  body: `I cook plant-based food at home, and I write down what actually works.

## Why this exists

Every recipe here declares what it contains, so you can screen out what you can't eat, whether that is an allergy or a choice.`,
  metaTitle: "About: Who Writes Vegan Cook, and Why",
  metaDescription:
    "Vegan Cook is written for people cooking plant-based by allergy or by choice: how the recipes are checked and why allergens are declared on every one.",
  status: "published",
};
