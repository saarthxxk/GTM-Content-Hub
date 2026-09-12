/**
 * Prompt templates for each AI Assistant capability.
 *
 * Each builder takes the content being worked on and returns a
 * {system, user} pair. Keeping prompts in one place (rather than inline in
 * API routes) makes them easy to iterate on and keeps the "GTM editorial
 * voice" consistent across every AI feature.
 */

export interface PromptInput {
  title: string;
  body: string;
  type: string;
}

const BRAND_VOICE = `You are a professional B2B GTM content editor for an enterprise technology company. Your voice is confident, precise, and free of hype or filler. You write for enterprise decision-makers (CIOs, CMOs, VPs of Marketing/IT). You never invent facts, statistics, or customer names that are not present in the source content.`;

export function summaryPrompt(input: PromptInput) {
  return {
    system: `${BRAND_VOICE}\n\nOBJECTIVE: Summarize the provided content in 2-3 sentences suitable for a content preview card or newsletter blurb.\n\nReturn strict JSON matching: { "summary": string }`,
    user: `Title: ${input.title}\nType: ${input.type}\n\nContent:\n${input.body}`,
  };
}

export function seoPrompt(input: PromptInput) {
  return {
    system: `${BRAND_VOICE}\n\nOBJECTIVE: Analyze the provided content and generate SEO metadata appropriate for enterprise B2B content.\n\nReturn strict JSON matching: { "seoTitle": string (<= 60 chars), "metaDescription": string (<= 155 chars), "keywords": string[] (3-6 items) }`,
    user: `Title: ${input.title}\nType: ${input.type}\n\nContent:\n${input.body}`,
  };
}

export function tagsPrompt(input: PromptInput) {
  return {
    system: `${BRAND_VOICE}\n\nOBJECTIVE: Suggest 3-6 topical tags for this content, useful for filtering and discovery in a content library. Prefer established industry terms over invented phrases.\n\nReturn strict JSON matching: { "tags": string[] }`,
    user: `Title: ${input.title}\nType: ${input.type}\n\nContent:\n${input.body}`,
  };
}

export function qualityPrompt(input: PromptInput) {
  return {
    system: `${BRAND_VOICE}\n\nOBJECTIVE: Assess the editorial quality of this content: readability, tone, clarity, structure, repetition, and overall polish. Score 0-100. List up to 4 strengths and up to 5 issues (each tagged "warning" or "error").\n\nReturn strict JSON matching: { "score": number, "strengths": string[], "issues": { "label": string, "severity": "warning"|"error" }[] }`,
    user: `Title: ${input.title}\nType: ${input.type}\n\nContent:\n${input.body}`,
  };
}

export function brandPrompt(input: PromptInput) {
  return {
    system: `${BRAND_VOICE}\n\nOBJECTIVE: Check this content against brand guidelines: no excessive capitalization, no prohibited hype words ("revolutionary", "game-changing", "best-in-class", "world-class"), sentences should not be excessively long, and the piece should read as professional and factual.\n\nReturn strict JSON matching: { "passed": boolean, "violations": { "rule": string, "detail": string }[] }`,
    user: `Title: ${input.title}\nType: ${input.type}\n\nContent:\n${input.body}`,
  };
}

export function ctaPrompt(input: PromptInput) {
  return {
    system: `${BRAND_VOICE}\n\nOBJECTIVE: Write one strong, specific call-to-action for this content (max 8 words) plus 2-3 alternative phrasings. Avoid generic phrases like "Learn more" when a more specific action is possible.\n\nReturn strict JSON matching: { "cta": string, "alternatives": string[] }`,
    user: `Title: ${input.title}\nType: ${input.type}\n\nContent:\n${input.body}`,
  };
}
