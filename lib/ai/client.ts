import Anthropic from "@anthropic-ai/sdk";
import type { ZodType } from "zod";

/**
 * Thin wrapper around the Anthropic Messages API used by every AI Assistant
 * feature (summary, SEO, tags, quality, brand check, CTA).
 *
 * Model choice: Claude Sonnet 5 is the default for this feature set —
 * these are short, structured, latency-sensitive editorial tasks (a few
 * hundred words of content in, a small JSON object out), not deep multi-step
 * reasoning, so Sonnet's quality/cost/latency balance fits the workload.
 * Override with ANTHROPIC_MODEL if you want Opus-tier quality instead.
 *
 * If ANTHROPIC_API_KEY is not set, callers should use the mock generators in
 * lib/ai/mock.ts instead — see lib/ai/index.ts for the routing logic. This
 * keeps the whole app runnable without any API keys configured.
 */

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

export function isAiConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  return text.trim();
}

/**
 * Sends {system, user} to Claude, expects a single JSON object back, and
 * validates it against the given Zod schema. Throws on any failure so the
 * caller (lib/ai/index.ts) can fall back to the deterministic mock — an AI
 * feature going down should never break the editorial workflow.
 */
export async function callStructured<T>(
  prompt: { system: string; user: string },
  schema: ZodType<T>
): Promise<T> {
  const client = getClient();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `${prompt.system}\n\nRespond with ONLY the JSON object. No markdown fences, no commentary before or after.`,
    messages: [{ role: "user", content: prompt.user }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("AI request was declined by the model");
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from model");
  }

  const jsonText = extractJson(textBlock.text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Model response was not valid JSON");
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Model response failed validation: ${result.error.message}`);
  }
  return result.data;
}
