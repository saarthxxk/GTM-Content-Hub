import { describe, expect, it } from "vitest";
import { ruleScore, runRuleChecks } from "@/lib/quality";
import type { Content } from "@/types";

function makeContent(overrides: Partial<Content> = {}): Content {
  return {
    id: "c1",
    title: "A Title",
    slug: "a-title",
    type: "article",
    status: "draft",
    body: "word ".repeat(150),
    authorId: "u1",
    tagIds: [],
    metadata: { metaTitle: "A Title", metaDescription: "A description under 155 chars.", keywords: [] },
    typeFields: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versionCount: 1,
    ...overrides,
  };
}

describe("runRuleChecks", () => {
  it("flags a missing title as an error-severity failure", () => {
    const checks = runRuleChecks(makeContent({ title: "" }));
    const titleCheck = checks.find((c) => c.id === "title");
    expect(titleCheck?.passed).toBe(false);
    expect(titleCheck?.severity).toBe("error");
  });

  it("flags short content as a warning", () => {
    const checks = runRuleChecks(makeContent({ body: "too short" }));
    const lengthCheck = checks.find((c) => c.id === "length");
    expect(lengthCheck?.passed).toBe(false);
  });

  it("requires a CTA on campaign content specifically", () => {
    const checks = runRuleChecks(makeContent({ type: "campaign", typeFields: {} }));
    expect(checks.find((c) => c.id === "cta-present")).toBeTruthy();
  });

  it("does not require a CTA check on non-campaign content", () => {
    const checks = runRuleChecks(makeContent({ type: "article" }));
    expect(checks.find((c) => c.id === "cta-present")).toBeUndefined();
  });
});

describe("ruleScore", () => {
  it("returns 100 when every check passes", () => {
    const content = makeContent({
      categoryId: "cat1",
      tagIds: ["tag1"],
      coverImage: "/img.png",
    });
    expect(ruleScore(runRuleChecks(content))).toBe(100);
  });

  it("deducts more for error-severity failures than warnings", () => {
    const missingTitle = ruleScore(runRuleChecks(makeContent({ title: "" })));
    const missingTags = ruleScore(runRuleChecks(makeContent({ tagIds: [] })));
    expect(missingTitle).toBeLessThan(missingTags);
  });

  it("never goes below 0", () => {
    const content = makeContent({ title: "", body: "", type: "campaign" });
    expect(ruleScore(runRuleChecks(content))).toBeGreaterThanOrEqual(0);
  });
});
