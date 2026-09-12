import type {
  AIBrandResult,
  AICtaResult,
  AIQualityResult,
  AISeoResult,
  AISummaryResult,
  AITagsResult,
} from "@/types";
import { brandPrompt, ctaPrompt, PromptInput, qualityPrompt, seoPrompt, summaryPrompt, tagsPrompt } from "@/prompts";
import { brandSchema, ctaSchema, qualitySchema, seoSchema, summarySchema, tagsSchema } from "@/prompts/schemas";
import { callStructured, isAiConfigured } from "./client";
import { mockBrand, mockCta, mockQuality, mockSeo, mockSummary, mockTags } from "./mock";

/**
 * Public AI service surface. Every API route under app/api/ai/* calls one of
 * these functions rather than touching lib/ai/client.ts or lib/ai/mock.ts
 * directly — this is the seam where "real LLM" vs "heuristic fallback" is
 * decided, and where a future swap (different model, different provider)
 * would happen once instead of in six route handlers.
 */

async function run<T>(
  useReal: boolean,
  real: () => Promise<T>,
  mock: () => T
): Promise<{ result: T; source: "ai" | "mock" }> {
  if (useReal) {
    try {
      return { result: await real(), source: "ai" };
    } catch (err) {
      console.warn("[ai] falling back to mock generator:", (err as Error).message);
    }
  }
  return { result: mock(), source: "mock" };
}

export async function generateSummary(input: PromptInput) {
  return run<AISummaryResult>(
    isAiConfigured(),
    () => callStructured(summaryPrompt(input), summarySchema),
    () => mockSummary(input)
  );
}

export async function generateSeo(input: PromptInput) {
  return run<AISeoResult>(
    isAiConfigured(),
    () => callStructured(seoPrompt(input), seoSchema),
    () => mockSeo(input)
  );
}

export async function generateTags(input: PromptInput) {
  return run<AITagsResult>(
    isAiConfigured(),
    () => callStructured(tagsPrompt(input), tagsSchema),
    () => mockTags(input)
  );
}

export async function assessQualityAi(input: PromptInput) {
  return run<AIQualityResult>(
    isAiConfigured(),
    () => callStructured(qualityPrompt(input), qualitySchema),
    () => mockQuality(input)
  );
}

export async function checkBrand(input: PromptInput) {
  return run<AIBrandResult>(
    isAiConfigured(),
    () => callStructured(brandPrompt(input), brandSchema),
    () => mockBrand(input)
  );
}

export async function generateCta(input: PromptInput) {
  return run<AICtaResult>(
    isAiConfigured(),
    () => callStructured(ctaPrompt(input), ctaSchema),
    () => mockCta(input)
  );
}
