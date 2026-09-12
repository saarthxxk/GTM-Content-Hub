import { NextRequest } from "next/server";
import { generateCta } from "@/lib/ai";
import { handleAiRequest } from "@/lib/ai/route-helper";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return handleAiRequest(req, generateCta);
}
