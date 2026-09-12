import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createCategory, listCategories } from "@/lib/store/catalog";

export const dynamic = "force-dynamic";
const schema = z.object({ name: z.string().min(1).max(80) });

export async function GET() {
  return NextResponse.json({ items: listCategories() });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (user.role !== "admin") return NextResponse.json({ error: "Only admins can manage categories" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const category = createCategory(parsed.data.name, user.id);
  return NextResponse.json({ category }, { status: 201 });
}
