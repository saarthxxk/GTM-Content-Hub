import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { restoreVersion } from "@/lib/store/content";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string; versionId: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  const { id, versionId } = await ctx.params;
  const user = await getCurrentUser();
  const content = restoreVersion(id, versionId, user.id);
  if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ content });
}
