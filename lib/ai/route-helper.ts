import { NextRequest, NextResponse } from "next/server";
import { aiRequestSchema } from "@/lib/validation";
import type { PromptInput } from "@/prompts";

/**
 * Shared plumbing for the app/api/ai/* routes: parse + validate the
 * {title, body, type} payload every AI feature takes, run the given
 * generator, and shape the response as {result, source} so the UI can show
 * an "AI" vs "heuristic" badge (see components/ai/AIAssistantPanel.tsx).
 */
export async function handleAiRequest<T>(
  req: NextRequest,
  generator: (input: PromptInput) => Promise<{ result: T; source: "ai" | "mock" }>
) {
  const body = await req.json();
  const parsed = aiRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { result, source } = await generator(parsed.data);
  return NextResponse.json({ result, source });
}
