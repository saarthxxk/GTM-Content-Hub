import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createCampaign, listCampaigns } from "@/lib/store/catalog";

export const dynamic = "force-dynamic";
const schema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().default(""),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

export async function GET() {
  return NextResponse.json({ items: listCampaigns() });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (user.role !== "admin") return NextResponse.json({ error: "Only admins can manage campaigns" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const campaign = createCampaign(parsed.data, user.id);
  return NextResponse.json({ campaign }, { status: 201 });
}
