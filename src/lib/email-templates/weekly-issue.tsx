import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

export interface WeeklyIssueRecipe {
  id: string;
  title: string;
  blurb: string;
  skill: string;
  timeMinutes: number;
  servings?: number;
  cuisine?: string | null;
  contains?: string[];
}

interface Props {
  weekOf?: string;
  siteUrl?: string;
  recipes?: WeeklyIssueRecipe[];
}

const main = { backgroundColor: "#ffffff", fontFamily: "Georgia, 'Times New Roman', serif" };
const container = { padding: "32px 28px", maxWidth: "600px" };
const sans = "Helvetica, Arial, sans-serif";
const kicker = {
  fontFamily: sans,
  fontSize: "10px",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  color: "#6b7169",
  margin: "0 0 12px",
};
const h1 = { fontSize: "26px", lineHeight: "1.2", color: "#16181a", margin: "0 0 8px" };
const intro = { fontSize: "15px", lineHeight: "1.65", color: "#33383a", margin: "0 0 8px" };
const h2 = { fontSize: "19px", lineHeight: "1.3", color: "#16181a", margin: "0 0 6px" };
const blurb = { fontSize: "14px", lineHeight: "1.6", color: "#33383a", margin: "0 0 8px" };
const meta = {
  fontFamily: sans,
  fontSize: "11px",
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
  color: "#6b7169",
  margin: "0 0 6px",
};
const small = { fontFamily: sans, fontSize: "12px", lineHeight: "1.6", color: "#6b7169", margin: 0 };
const link = { color: "#2f6b3a" };
const rule = { borderColor: "#e2e4e1", margin: "22px 0" };

function timeLabel(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

const Email = ({
  weekOf = "",
  siteUrl = "https://vegancook.live",
  recipes = [],
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      {recipes.length > 0
        ? `Five plant-based recipes for the week: ${recipes.map((r) => r.title).join(", ")}`
        : "Five plant-based recipes to plan your week"}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>Vegan Cook — weekly{weekOf ? ` · week of ${weekOf}` : ""}</Text>
        <Heading style={h1}>Five recipes for the week</Heading>
        <Text style={intro}>
          Enough to plan your cooking, with skill level, time and allergens on each. Vegan food
          that isn't boring and isn't just salad.
        </Text>
        <Hr style={rule} />
        {recipes.map((recipe, index) => (
          <Section key={recipe.id}>
            <Text style={meta}>
              {String(index + 1).padStart(2, "0")} · {recipe.skill} ·{" "}
              {timeLabel(recipe.timeMinutes)}
              {recipe.cuisine ? ` · ${recipe.cuisine}` : ""}
            </Text>
            <Heading as="h2" style={h2}>
              <Link href={`${siteUrl}/recipes/${recipe.id}`} style={link}>
                {recipe.title}
              </Link>
            </Heading>
            <Text style={blurb}>{recipe.blurb}</Text>
            <Text style={small}>
              Contains:{" "}
              {recipe.contains && recipe.contains.length > 0
                ? recipe.contains.join(", ")
                : "none declared"}
            </Text>
            <Hr style={rule} />
          </Section>
        ))}
        <Text style={small}>
          Browse the full collection at{" "}
          <Link href={siteUrl} style={link}>
            vegancook.live
          </Link>
          . Got a recipe worth sharing?{" "}
          <Link href={`${siteUrl}/submit`} style={link}>
            Send it in
          </Link>
          .
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: ({ weekOf }: Record<string, unknown>) =>
    weekOf
      ? `Vegan Cook weekly — five recipes for the week of ${String(weekOf)}`
      : "Vegan Cook weekly — five recipes for the week",
  displayName: "Weekly newsletter issue",
  previewData: {
    weekOf: "6 April",
    siteUrl: "https://vegancook.live",
    recipes: [
      {
        id: "lentil-dal-rice",
        title: "Everyday lentil dal with rice",
        blurb: "A soft, spiced red lentil dal that comes together in one pan.",
        skill: "Beginner",
        timeMinutes: 40,
        cuisine: "Indian",
        contains: [],
      },
    ],
  },
} satisfies TemplateEntry;
