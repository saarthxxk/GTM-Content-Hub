import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createMedia, listMedia } from "@/lib/store/media";
import { mediaUploadSchema } from "@/lib/validation";
import type { MediaType } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const items = listMedia({
    search: params.get("search") ?? undefined,
    type: (params.get("type") as MediaType | "all") ?? "all",
    tag: params.get("tag") ?? "all",
  });
  return NextResponse.json({ items });
}

function inferType(mimeType: string): MediaType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

/**
 * Media "upload" for this demo: the file is sent as a data URL, which we
 * store directly as the asset's `url` (no real object storage configured).
 * Swapping in Supabase Storage means uploading the blob there and storing
 * the returned public URL instead — everything downstream (media library,
 * content editor image picker) only ever reads `asset.url`.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const body = await req.json();
  const parsed = mediaUploadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { filename, mimeType, size, dataUrl, altText, tags, campaignId } = parsed.data;
  const asset = createMedia(
    {
      filename,
      type: inferType(mimeType),
      mimeType,
      size,
      url: dataUrl || `/media/${filename}`,
      altText,
      tags,
      campaignId,
    },
    user.id
  );
  return NextResponse.json({ asset }, { status: 201 });
}
