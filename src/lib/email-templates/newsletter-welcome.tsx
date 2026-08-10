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

interface Props {
  siteUrl?: string;
  unsubscribeUrl?: string;
}

const main = { backgroundColor: "#ffffff", fontFamily: "Georgia, 'Times New Roman', serif" };
const container = { padding: "32px 28px", maxWidth: "560px" };
const kicker = {
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "10px",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  color: "#6b7169",
  margin: "0 0 12px",
};
const h1 = { fontSize: "26px", lineHeight: "1.2", color: "#16181a", margin: "0 0 16px" };
const text = { fontSize: "15px", lineHeight: "1.65", color: "#33383a", margin: "0 0 14px" };
const small = {
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "12px",
  lineHeight: "1.6",
  color: "#6b7169",
  margin: "0",
};
const link = { color: "#2f6b3a" };

const Email = ({
  siteUrl = "https://vegancook.live",
  unsubscribeUrl = "https://vegancook.live/unsubscribe",
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're on the Vegan Cook weekly list: five recipes every Sunday.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>Vegan Cook</Text>
        <Heading style={h1}>You're on the list</Heading>
        <Text style={text}>
          Thanks for subscribing. Every Sunday you'll get five plant-based recipes, enough to plan
          the week, chosen from the whole collection, with skill level, time and allergen notes on
          each.
        </Text>
        <Text style={text}>
          No offers, no digests, no forwarding your address anywhere. Vegan food that isn't
          boring and isn't just salad.
        </Text>
        <Text style={text}>
          In the meantime, the{" "}
          <Link href={siteUrl} style={link}>
            recipe of the day
          </Link>{" "}
          rotates daily on the site, and you can filter the archive by skill level, cuisine and
          allergens.
        </Text>
        <Hr style={{ borderColor: "#e2e4e1", margin: "24px 0" }} />
        <Section>
          <Text style={small}>
            Sent because you signed up at{" "}
            <Link href={siteUrl} style={link}>
              vegancook.live
            </Link>
            . One email a week.{" "}
            <Link href={unsubscribeUrl} style={link}>
              Unsubscribe
            </Link>
            .
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: "You're on the Vegan Cook weekly list",
  displayName: "Weekly newsletter signup confirmation",
  previewData: {
    siteUrl: "https://vegancook.live",
    unsubscribeUrl: "https://vegancook.live/unsubscribe",
  },
} satisfies TemplateEntry;
