import type { MediaAsset, MediaType } from "@/types";
import { logAudit, newId, nowIso, readDb, writeDb } from "./db";

export interface MediaFilters {
  search?: string;
  type?: MediaType | "all";
  tag?: string | "all";
}

export function listMedia(filters: MediaFilters = {}): MediaAsset[] {
  let items = [...readDb().media];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter((m) => m.filename.toLowerCase().includes(q) || m.altText?.toLowerCase().includes(q));
  }
  if (filters.type && filters.type !== "all") items = items.filter((m) => m.type === filters.type);
  if (filters.tag && filters.tag !== "all") items = items.filter((m) => m.tags.includes(filters.tag!));
  return items.sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
}

export function getMedia(id: string): MediaAsset | undefined {
  return readDb().media.find((m) => m.id === id);
}

export interface CreateMediaInput {
  filename: string;
  type: MediaType;
  mimeType: string;
  size: number;
  url: string;
  altText?: string;
  tags?: string[];
  campaignId?: string;
  width?: number;
  height?: number;
}

export function createMedia(input: CreateMediaInput, actorId: string): MediaAsset {
  const db = readDb();
  const asset: MediaAsset = {
    id: newId(),
    filename: input.filename,
    url: input.url,
    type: input.type,
    mimeType: input.mimeType,
    size: input.size,
    altText: input.altText,
    tags: input.tags ?? [],
    campaignId: input.campaignId,
    uploadedBy: actorId,
    uploadedAt: nowIso(),
    width: input.width,
    height: input.height,
  };
  db.media.unshift(asset);
  logAudit(db, { userId: actorId, action: "uploaded", entityType: "media", entityId: asset.id, entityLabel: asset.filename });
  writeDb(db);
  return asset;
}

export function updateMedia(id: string, patch: Partial<Pick<MediaAsset, "altText" | "description" | "tags" | "campaignId">>, actorId: string): MediaAsset | undefined {
  const db = readDb();
  const asset = db.media.find((m) => m.id === id);
  if (!asset) return undefined;
  Object.assign(asset, patch);
  logAudit(db, { userId: actorId, action: "updated", entityType: "media", entityId: asset.id, entityLabel: asset.filename });
  writeDb(db);
  return asset;
}

export function deleteMedia(id: string, actorId: string): boolean {
  const db = readDb();
  const idx = db.media.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  const [removed] = db.media.splice(idx, 1);
  logAudit(db, { userId: actorId, action: "deleted", entityType: "media", entityId: id, entityLabel: removed.filename });
  writeDb(db);
  return true;
}
