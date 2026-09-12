import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getContent, updateContent } from "@/lib/store/content";
import { assessContentQuality } from "@/lib/quality";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Runs the combined quality engine (40% rule-based + 60% AI, see
 * lib/quality.ts) against the current state of the content and persists the
 * report on the record. This is what the "Analyze Content" button in the AI
 * Assistant sidebar calls.
 */
export async function POST(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  const content = getContent(id);
  if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const quality = await assessContentQuality(content);
  const updated = updateContent(id, { quality }, user.id, false);
  return NextResponse.json({ content: updated, quality });
}
