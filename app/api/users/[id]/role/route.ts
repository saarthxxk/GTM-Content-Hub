import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { updateUserRole } from "@/lib/store/catalog";

export const dynamic = "force-dynamic";

const schema = z.object({ role: z.enum(["author", "reviewer", "admin"]) });

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const actor = await getCurrentUser();
  if (actor.role !== "admin") {
    return NextResponse.json({ error: "Only admins can manage roles" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const user = updateUserRole(id, parsed.data.role, actor.id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user });
}
