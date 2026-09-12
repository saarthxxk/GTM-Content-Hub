import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteContent, getContent, updateContent } from "@/lib/store/content";
import { updateContentSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const content = getContent(id);
  if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ content });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  const existing = getContent(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // RBAC: authors edit only their own content; reviewers act on content via
  // the /transition endpoint (approve/request changes), not direct edits.
  const canEdit = user.role === "admin" || (user.role === "author" && existing.authorId === user.id);
  if (!canEdit) {
    return NextResponse.json({ error: "You don't have permission to edit this content" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { snapshot, ...patch } = parsed.data;
  const content = updateContent(id, patch, user.id, snapshot ?? true);
  if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ content });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  const ok = deleteContent(id, user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
