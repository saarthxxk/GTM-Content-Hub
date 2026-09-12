import { NextRequest, NextResponse } from "next/server";
import { listReviews, listVersions } from "@/lib/store/content";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return NextResponse.json({ versions: listVersions(id), reviews: listReviews(id) });
}
