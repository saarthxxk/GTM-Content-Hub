import { NextResponse } from "next/server";
import { getAnalyticsSummary } from "@/lib/store/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getAnalyticsSummary());
}
