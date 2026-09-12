import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { performTransition } from "@/lib/store/content";
import { transitionSchema } from "@/lib/validation";
import { WorkflowError } from "@/lib/workflow";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Single endpoint for every workflow move (submit, approve, request_changes,
 * revise, publish, archive, ...). The action names and role checks live in
 * lib/workflow — this route is intentionally thin so the rules can't drift
 * between the API and anywhere else that might call performTransition.
 */
export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  const body = await req.json();
  const parsed = transitionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const content = performTransition(id, parsed.data.action, user.id, user.role, parsed.data.comments);
    return NextResponse.json({ content });
  } catch (err) {
    if (err instanceof WorkflowError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }
}
