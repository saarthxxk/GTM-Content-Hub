import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createContent, listContent } from "@/lib/store/content";
import { createContentSchema } from "@/lib/validation";
import type { ContentStatus, ContentType } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const items = listContent({
    search: params.get("search") ?? undefined,
    status: (params.get("status") as ContentStatus | "all") ?? "all",
    type: (params.get("type") as ContentType | "all") ?? "all",
    authorId: params.get("authorId") ?? "all",
    campaignId: params.get("campaignId") ?? "all",
    categoryId: params.get("categoryId") ?? "all",
    tagId: params.get("tagId") ?? "all",
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const body = await req.json();
  const parsed = createContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const content = createContent({ ...parsed.data, authorId: user.id });
  return NextResponse.json({ content }, { status: 201 });
}
