import { describe, expect, it } from "vitest";
import { methodToText, parseMethod } from "./recipe-format";
import { normalizeCsvRow } from "./csv-import";

describe("parseMethod", () => {
  it("leaves untitled steps with an empty title", () => {
    expect(parseMethod("Chop the onion.\nFry it.")).toEqual([
      { title: "", body: "Chop the onion." },
      { title: "", body: "Fry it." },
    ]);
  });

  it("never splits a step on a semicolon", () => {
    expect(parseMethod("Dry tofu; crisp it in a hot pan.")).toHaveLength(1);
  });
});

describe("methodToText round trip", () => {
  it("keeps untitled and titled steps without losing text", () => {
    const steps = [
      { title: "", body: "Dry tofu; crisp it." },
      { title: "Sauce", body: "Whisk soy and lime." },
      { title: "", body: "Tip: serve hot." },
    ];
    const text = methodToText(steps);
    expect(text).not.toContain("  : ");
    expect(parseMethod(text)).toEqual(steps);
  });
});

describe("CSV method column", () => {
  it("does not split method steps on semicolons", () => {
    const row = normalizeCsvRow(
      {
        title: "Stir fry",
        blurb: "Quick tofu stir fry for weeknights.",
        time_minutes: "20",
        servings: "2",
        skill: "Beginner",
        ingredients: "200 g | tofu",
        method: "Dry tofu; crisp it in a hot pan.\\nAdd the greens and toss.",
      },
      2,
    );
    expect(row.value?.methodText.split("\n")).toEqual([
      "Dry tofu; crisp it in a hot pan.",
      "Add the greens and toss.",
    ]);
  });
});
