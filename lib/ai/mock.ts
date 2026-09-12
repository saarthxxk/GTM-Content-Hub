import type { AIBrandResult, AICtaResult, AIQualityResult, AISeoResult, AISummaryResult, AITagsResult } from "@/types";
import type { PromptInput } from "@/prompts";

/**
 * Deterministic, heuristic "AI" used whenever no ANTHROPIC_API_KEY is
 * configured, so the whole AI Assistant flow works out of the box in a demo
 * environment. It's intentionally simple text analysis, not a model — but it
 * returns the same shape the real LLM path returns, so the rest of the app
 * (validation, UI, quality scoring) never needs to know which one ran.
 */

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "is", "are", "was",
  "were", "be", "by", "that", "this", "it", "as", "at", "from", "their", "its", "can", "will",
  "not", "but", "into", "than", "then", "so", "these", "those", "such", "have", "has", "had",
  // Generic connective/verb filler that ranks high by frequency but carries
  // little topical signal — excluded so keyword/tag suggestions read like
  // subject terms rather than sentence scaffolding.
  "increasingly", "adopting", "adopt", "across", "accelerate", "accelerating", "improve",
  "improving", "organizations", "organization", "enterprise", "enterprises", "using", "used",
  "also", "more", "most", "many", "some", "who", "what", "when", "where", "how", "which",
  "should", "would", "could", "must", "need", "needs", "make", "making", "made", "getting",
  "get", "gets", "just", "very", "really", "about", "over", "under", "through", "while",
  "being", "still", "even", "only", "each", "every", "both", "own", "same", "other", "another",
]);

const HYPE_WORDS = ["revolutionary", "game-changing", "best-in-class", "world-class", "cutting-edge", "unprecedented", "groundbreaking"];

function words(body: string): string[] {
  return body
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function sentences(body: string): string[] {
  return body.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
}

/** Acronyms (AI, CX, ROI) carry real topical signal even at 2-3 letters and
 * even at low frequency — pull them from the ORIGINAL casing before the
 * rest of the pipeline lowercases everything. */
function findAcronyms(body: string): string[] {
  const matches = body.match(/\b[A-Z]{2,5}\b/g) ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of matches) {
    if (!seen.has(m)) {
      seen.add(m);
      out.push(m);
    }
  }
  return out;
}

function topKeywords(body: string, count: number): string[] {
  const freq = new Map<string, number>();
  for (const w of words(body)) {
    if (w.length < 4 || STOPWORDS.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  const ranked = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));

  const acronyms = findAcronyms(body);
  const combined = [...acronyms, ...ranked.filter((w) => !acronyms.includes(w))];
  return combined.slice(0, count);
}

export function mockSummary(input: PromptInput): AISummaryResult {
  const sents = sentences(input.body);
  const summary = sents.slice(0, 2).join(" ").trim() || input.title;
  return { summary: summary.length > 400 ? summary.slice(0, 397) + "…" : summary };
}

export function mockSeo(input: PromptInput): AISeoResult {
  const keywords = topKeywords(input.body, 5);
  const seoTitle = input.title.length <= 60 ? input.title : input.title.slice(0, 57) + "…";
  const firstSentence = sentences(input.body)[0] ?? input.body;
  const metaDescription = firstSentence.length <= 155 ? firstSentence : firstSentence.slice(0, 152) + "…";
  return { seoTitle, metaDescription, keywords: keywords.length ? keywords : [input.type] };
}

export function mockTags(input: PromptInput): AITagsResult {
  const keywords = topKeywords(input.body, 6);
  return { tags: keywords.length ? keywords : [input.type] };
}

export function mockQuality(input: PromptInput): AIQualityResult {
  const sents = sentences(input.body);
  const wc = words(input.body).length;
  const avgSentenceLen = sents.length ? wc / sents.length : 0;
  const longSentences = sents.filter((s) => words(s).length > 34).length;

  const strengths: string[] = [];
  const issues: { label: string; severity: "warning" | "error" }[] = [];

  if (wc >= 120) strengths.push("Content has substantive depth");
  else issues.push({ label: "Content is quite short — consider expanding key points", severity: "warning" });

  if (avgSentenceLen > 0 && avgSentenceLen <= 24) strengths.push("Sentence length supports readability");
  else if (avgSentenceLen > 24) issues.push({ label: "Average sentence length is long — consider shortening", severity: "warning" });

  if (longSentences > 0) issues.push({ label: `${longSentences} sentence(s) are especially long`, severity: "warning" });
  if (sents.length >= 3) strengths.push("Structure includes multiple developed ideas");

  const hype = HYPE_WORDS.filter((h) => input.body.toLowerCase().includes(h));
  if (hype.length) issues.push({ label: `Contains hype language: ${hype.join(", ")}`, severity: "error" });
  else strengths.push("Tone avoids hype language");

  let score = 100;
  score -= issues.filter((i) => i.severity === "warning").length * 8;
  score -= issues.filter((i) => i.severity === "error").length * 15;
  score = Math.max(30, Math.min(100, score));

  return { score, strengths: strengths.slice(0, 4), issues: issues.slice(0, 5) };
}

export function mockBrand(input: PromptInput): AIBrandResult {
  const violations: { rule: string; detail: string }[] = [];
  const hype = HYPE_WORDS.filter((h) => input.body.toLowerCase().includes(h));
  if (hype.length) violations.push({ rule: "No prohibited terminology", detail: `Found: ${hype.join(", ")}` });

  const capsWords = words(input.body).filter((w) => w.length > 3 && w === w.toUpperCase());
  if (capsWords.length > 3) violations.push({ rule: "No excessive capitalization", detail: `${capsWords.length} all-caps words found` });

  const longSentenceCount = sentences(input.body).filter((s) => words(s).length > 40).length;
  if (longSentenceCount > 0) violations.push({ rule: "Sentence length within guidelines", detail: `${longSentenceCount} sentence(s) exceed 40 words` });

  return { passed: violations.length === 0, violations };
}

export function mockCta(input: PromptInput): AICtaResult {
  const byType: Record<string, { cta: string; alternatives: string[] }> = {
    article: { cta: "Read the full playbook", alternatives: ["Download the report", "Talk to our team"] },
    campaign: { cta: "Book a free assessment", alternatives: ["Request a demo", "See the offer details"] },
    event: { cta: "Register for the event", alternatives: ["Save your seat", "Add to calendar"] },
    case_study: { cta: "See how they did it", alternatives: ["Read the full case study", "Talk to our team"] },
  };
  return byType[input.type] ?? byType.article;
}
