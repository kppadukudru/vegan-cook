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
  resetUrl?: string;
  invitedByEmail?: string;
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
const button = {
  display: "inline-block",
  backgroundColor: "#16181a",
  color: "#ffffff",
  padding: "14px 24px",
  textDecoration: "none",
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "12px",
  letterSpacing: "1.5px",
  textTransform: "uppercase" as const,
};
const link = { color: "#2f6b3a" };

const Email = ({
  siteUrl = "https://vegancook.live",
  resetUrl,
  invitedByEmail = "an existing editor",
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You have been invited to edit Vegan Cook.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>Vegan Cook</Text>
        <Heading style={h1}>You're invited to edit Vegan Cook</Heading>
        <Text style={text}>
          {invitedByEmail} has added you as an editor. You can manage recipes, review reader
          submissions, write journal posts and edit page copy.
        </Text>
        {resetUrl ? (
          <>
            <Text style={text}>
              Click the button below to set your password and sign in for the first time.
            </Text>
            <Section style={{ margin: "24px 0" }}>
              <Link href={resetUrl} style={button}>
                Set your password
              </Link>
            </Section>
          </>
        ) : (
          <Text style={text}>
            Use the "Forgot password?" link on the sign-in page to set your password before signing
            in.
          </Text>
        )}
        <Text style={text}>
          The sign-in page is at{" "}
          <Link href={`${siteUrl}/auth`} style={link}>
            {siteUrl}/auth
          </Link>
          .
        </Text>
        <Hr style={{ borderColor: "#e2e4e1", margin: "24px 0" }} />
        <Section>
          <Text style={small}>
            Sent because you were invited to edit{" "}
            <Link href={siteUrl} style={link}>
              Vegan Cook
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
  subject: "You're invited to edit Vegan Cook",
  displayName: "Editor invitation",
  previewData: {
    siteUrl: "https://vegancook.live",
    resetUrl: "https://vegancook.live/auth/reset-password",
    invitedByEmail: "editor@example.com",
  },
} satisfies TemplateEntry;
