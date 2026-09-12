import { z } from "zod";

/**
 * Zod schemas the AI service validates every LLM response against before it
 * reaches the frontend. If the model (or the mock fallback) returns
 * something that doesn't fit, the caller in lib/ai/index.ts falls back to
 * the deterministic mock rather than passing malformed data downstream.
 */

export const summarySchema = z.object({
  summary: z.string().min(1).max(600),
});

export const seoSchema = z.object({
  seoTitle: z.string().min(1).max(70),
  metaDescription: z.string().min(1).max(200),
  keywords: z.array(z.string()).min(1).max(8),
});

export const tagsSchema = z.object({
  tags: z.array(z.string()).min(1).max(8),
});

export const qualitySchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()).max(6),
  issues: z
    .array(
      z.object({
        label: z.string(),
        severity: z.enum(["warning", "error"]),
      })
    )
    .max(8),
});

export const brandSchema = z.object({
  passed: z.boolean(),
  violations: z
    .array(
      z.object({
        rule: z.string(),
        detail: z.string(),
      })
    )
    .max(10),
});

export const ctaSchema = z.object({
  cta: z.string().min(1).max(80),
  alternatives: z.array(z.string()).max(4),
});
