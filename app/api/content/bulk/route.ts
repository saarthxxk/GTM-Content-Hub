import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { bulkUpdateContent } from "@/lib/store/content";
import { bulkUpdateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can perform bulk operations" }, { status: 403 });
  }
  const body = await req.json();
  const parsed = bulkUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { ids, ...payload } = parsed.data;
  const count = bulkUpdateContent(ids, payload, user.id);
  return NextResponse.json({ updated: count });
}
