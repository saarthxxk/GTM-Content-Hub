import type { Content, QualityCheckItem, QualityReport } from "@/types";
import { assessQualityAi } from "@/lib/ai";

/**
 * Layer 1 — deterministic, rule-based checks. Cheap, fast, and always
 * available (no AI call, no network). These mirror the "Brand/Style
 * Checker" and "Content Quality Engine" sections of the product spec.
 */
export function runRuleChecks(content: Content): QualityCheckItem[] {
  const checks: QualityCheckItem[] = [];
  const wordCount = content.body.trim().split(/\s+/).filter(Boolean).length;

  checks.push({
    id: "title",
    label: "Title is present",
    passed: !!content.title.trim(),
    severity: "error",
    source: "rule",
  });
  checks.push({
    id: "meta-title",
    label: "SEO title is set",
    passed: !!content.metadata.metaTitle.trim(),
    severity: "warning",
    source: "rule",
  });
  checks.push({
    id: "meta-description",
    label: "Meta description is present",
    passed: !!content.metadata.metaDescription.trim(),
    severity: "warning",
    source: "rule",
  });
  checks.push({
    id: "meta-description-length",
    label: "Meta description is within 155 characters",
    passed: content.metadata.metaDescription.length === 0 || content.metadata.metaDescription.length <= 155,
    severity: "warning",
    source: "rule",
  });
  checks.push({
    id: "tags",
    label: "At least one tag is assigned",
    passed: content.tagIds.length > 0,
    severity: "warning",
    source: "rule",
  });
  checks.push({
    id: "category",
    label: "Category is assigned",
    passed: !!content.categoryId,
    severity: "warning",
    source: "rule",
  });
  checks.push({
    id: "cover-image",
    label: "Cover image is set",
    passed: !!content.coverImage,
    severity: "info",
    source: "rule",
  });
  checks.push({
    id: "length",
    label: "Body has sufficient length (120+ words)",
    passed: wordCount >= 120,
    severity: "warning",
    source: "rule",
  });
  if (content.type === "campaign") {
    checks.push({
      id: "cta-present",
      label: "Campaign has a call-to-action",
      passed: !!content.typeFields.campaign?.cta,
      severity: "error",
      source: "rule",
    });
  }

  return checks;
}

export function ruleScore(checks: QualityCheckItem[]): number {
  if (checks.length === 0) return 100;
  let score = 100;
  for (const c of checks) {
    if (c.passed) continue;
    score -= c.severity === "error" ? 20 : c.severity === "warning" ? 10 : 3;
  }
  return Math.max(0, Math.min(100, score));
}

/**
 * Layer 2 — AI assessment (readability, tone, clarity, brand voice) plus
 * combination into a single score.
 *
 *   Quality Score = 40% deterministic checks + 60% AI assessment
 *
 * This mirrors the "don't make AI responsible for everything" principle:
 * the rule layer always runs and always produces a defensible partial
 * score even if the AI call fails or is disabled.
 */
export async function assessContentQuality(content: Content): Promise<QualityReport> {
  const ruleChecks = runRuleChecks(content);
  const rScore = ruleScore(ruleChecks);

  const { result: ai } = await assessQualityAi({ title: content.title, body: content.body, type: content.type });

  const aiChecks: QualityCheckItem[] = [
    ...ai.strengths.map((s, i) => ({
      id: `ai-strength-${i}`,
      label: s,
      passed: true,
      severity: "info" as const,
      source: "ai" as const,
    })),
    ...ai.issues.map((issue, i) => ({
      id: `ai-issue-${i}`,
      label: issue.label,
      passed: false,
      severity: issue.severity,
      source: "ai" as const,
    })),
  ];

  const combined = Math.round(rScore * 0.4 + ai.score * 0.6);

  return {
    score: combined,
    ruleScore: rScore,
    aiScore: ai.score,
    generatedAt: new Date().toISOString(),
    checks: [...ruleChecks, ...aiChecks],
  };
}
