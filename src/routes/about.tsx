import { createFileRoute, Link } from "@tanstack/react-router";
import { Prose } from "@/components/Prose";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

const ABOUT_BODY = `I cook plant-based food, and I travel. Those two things don't always cooperate, so this site is where I write down what works.

## Why this exists

Most vegan recipe sites assume you're doing it for one reason. In practice the people reading this are a mix: some have a dairy allergy or a soy allergy and no choice at all, some are cutting animal products for ethical or environmental reasons, and plenty are just cooking for someone else in the house. The food doesn't need to be different for those groups — but the labelling does. That's why every recipe here declares what it contains and lets you screen out what you can't eat.

## What I actually believe about vegan food

It isn't a salad. It isn't a compromise version of a real dish. A dal cooked properly, a fermented dosa, a mushroom risotto finished with good olive oil instead of butter — none of those are missing anything. The recipes here are the ones I make on ordinary weeknights, written out in enough detail that they work the first time.

## Where the travel comes in

I'm based in India, so a lot of what I cook is what's around me. I've also spent enough time in northern Italy — Venice, Milan, Verona — to have learned the specific phrases and dishes that get you fed there rather than apologised at. That kind of knowledge doesn't fit into a recipe card, so it lives in the journal.

## How recipes get checked

Every recipe, including the ones readers submit, is screened for non-plant ingredients before it can be published, and reviewed by hand after that. Allergens are declared per recipe, with a notes field for the awkward cases — shared equipment, trace sesame, that sort of thing. If something is wrong, I'd rather hear about it and fix it.

## Submit something

If you cook something worth sharing, send it in. Recipes come with ingredients, method, cookware and allergen information, and go live once they've been reviewed.`;

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Who Writes Vegan Cook, and Why" },
      {
        name: "description",
        content:
          "Vegan Cook is written for people cooking plant-based by allergy or by choice — how the recipes are checked, why allergens are declared, and where the travel notes come from.",
      },
      { property: "og:title", content: "About — Who Writes Vegan Cook, and Why" },
      {
        property: "og:description",
        content: "Plant-based cooking for allergies and lifestyle choices alike.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.vegancook.live/about" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://www.vegancook.live/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="bg-paper text-ink min-h-dvh antialiased">
      <SiteHeader />

      <main className="max-w-[1440px] mx-auto">
        <section className="border-b border-steel px-6 md:px-8 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <p className="lg:col-span-3 text-[10px] uppercase tracking-[0.15em] text-mute">About</p>
          <div className="lg:col-span-9">
            <h1 className="font-serif text-3xl md:text-5xl leading-[1.1] tracking-tight text-balance max-w-[38ch]">
              A kitchen notebook for people who read the label before the menu.
            </h1>
          </div>
        </section>

        <section className="px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3 space-y-4">
            <Link
              to="/journal"
              className="block text-[10px] uppercase tracking-[0.15em] text-mute hover:text-ink transition-colors"
            >
              Read the journal →
            </Link>
            <Link
              to="/submit"
              className="block text-[10px] uppercase tracking-[0.15em] text-mute hover:text-ink transition-colors"
            >
              Submit a recipe →
            </Link>
          </div>
          <div className="lg:col-span-9">
            <Prose markdown={ABOUT_BODY} />
          </div>
        </section>
      </main>

      <SiteFooter note="Vegan Cook — about" />
    </div>
  );
}
