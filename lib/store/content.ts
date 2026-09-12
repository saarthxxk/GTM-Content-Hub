import type {
  Content,
  ContentMetadata,
  ContentStatus,
  ContentType,
  QualityReport,
  Review,
  Role,
  TypeFields,
} from "@/types";
import { assertTransition } from "@/lib/workflow";
import { logAudit, newId, nowIso, readDb, slugify, writeDb } from "./db";

export interface ContentFilters {
  search?: string;
  status?: ContentStatus | "all";
  type?: ContentType | "all";
  authorId?: string | "all";
  campaignId?: string | "all";
  categoryId?: string | "all";
  tagId?: string | "all";
}

export function listContent(filters: ContentFilters = {}): Content[] {
  const db = readDb();
  let items = [...db.content];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.excerpt?.toLowerCase().includes(q) ||
        c.body.toLowerCase().includes(q)
    );
  }
  if (filters.status && filters.status !== "all") items = items.filter((c) => c.status === filters.status);
  if (filters.type && filters.type !== "all") items = items.filter((c) => c.type === filters.type);
  if (filters.authorId && filters.authorId !== "all") items = items.filter((c) => c.authorId === filters.authorId);
  if (filters.campaignId && filters.campaignId !== "all") items = items.filter((c) => c.campaignId === filters.campaignId);
  if (filters.categoryId && filters.categoryId !== "all") items = items.filter((c) => c.categoryId === filters.categoryId);
  if (filters.tagId && filters.tagId !== "all") items = items.filter((c) => c.tagIds.includes(filters.tagId!));

  return items.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getContent(id: string): Content | undefined {
  return readDb().content.find((c) => c.id === id);
}

export function getContentBySlug(slug: string): Content | undefined {
  return readDb().content.find((c) => c.slug === slug);
}

export interface CreateContentInput {
  title: string;
  type: ContentType;
  authorId: string;
  body?: string;
  categoryId?: string;
  campaignId?: string;
  tagIds?: string[];
  typeFields?: TypeFields;
}

export function createContent(input: CreateContentInput): Content {
  const db = readDb();
  const now = nowIso();
  const baseSlug = slugify(input.title) || `untitled-${Date.now()}`;
  let slug = baseSlug;
  let n = 1;
  while (db.content.some((c) => c.slug === slug)) {
    slug = `${baseSlug}-${++n}`;
  }
  const content: Content = {
    id: newId(),
    title: input.title,
    slug,
    type: input.type,
    status: "draft",
    body: input.body ?? "",
    authorId: input.authorId,
    campaignId: input.campaignId,
    categoryId: input.categoryId,
    tagIds: input.tagIds ?? [],
    metadata: { metaTitle: input.title, metaDescription: "", keywords: [] },
    typeFields: input.typeFields ?? {},
    createdAt: now,
    updatedAt: now,
    versionCount: 1,
  };
  db.content.push(content);
  db.versions.push({
    id: newId(),
    contentId: content.id,
    versionNumber: 1,
    title: content.title,
    body: content.body,
    metadata: content.metadata,
    createdBy: input.authorId,
    createdAt: now,
    note: "Initial draft",
  });
  logAudit(db, { userId: input.authorId, action: "created", entityType: "content", entityId: content.id, entityLabel: content.title });
  writeDb(db);
  return content;
}

export interface UpdateContentInput {
  title?: string;
  body?: string;
  excerpt?: string;
  coverImage?: string;
  categoryId?: string;
  campaignId?: string;
  tagIds?: string[];
  metadata?: Partial<ContentMetadata>;
  typeFields?: TypeFields;
  quality?: QualityReport;
}

export function updateContent(id: string, patch: UpdateContentInput, actorId: string, snapshot = true): Content | undefined {
  const db = readDb();
  const content = db.content.find((c) => c.id === id);
  if (!content) return undefined;

  if (patch.title !== undefined) content.title = patch.title;
  if (patch.body !== undefined) content.body = patch.body;
  if (patch.excerpt !== undefined) content.excerpt = patch.excerpt;
  if (patch.coverImage !== undefined) content.coverImage = patch.coverImage;
  if (patch.categoryId !== undefined) content.categoryId = patch.categoryId;
  if (patch.campaignId !== undefined) content.campaignId = patch.campaignId;
  if (patch.tagIds !== undefined) content.tagIds = patch.tagIds;
  if (patch.metadata !== undefined) content.metadata = { ...content.metadata, ...patch.metadata };
  if (patch.typeFields !== undefined) content.typeFields = { ...content.typeFields, ...patch.typeFields };
  if (patch.quality !== undefined) content.quality = patch.quality;
  content.updatedAt = nowIso();

  if (snapshot) {
    content.versionCount += 1;
    db.versions.push({
      id: newId(),
      contentId: content.id,
      versionNumber: content.versionCount,
      title: content.title,
      body: content.body,
      metadata: content.metadata,
      createdBy: actorId,
      createdAt: content.updatedAt,
      note: "Edited",
    });
  }

  logAudit(db, { userId: actorId, action: "updated", entityType: "content", entityId: content.id, entityLabel: content.title });
  writeDb(db);
  return content;
}

export function deleteContent(id: string, actorId: string): boolean {
  const db = readDb();
  const idx = db.content.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  const [removed] = db.content.splice(idx, 1);
  db.versions = db.versions.filter((v) => v.contentId !== id);
  db.reviews = db.reviews.filter((r) => r.contentId !== id);
  logAudit(db, { userId: actorId, action: "deleted", entityType: "content", entityId: id, entityLabel: removed.title });
  writeDb(db);
  return true;
}

export interface TransitionResult {
  content: Content;
}

const ACTION_LABEL: Record<string, string> = {
  submit: "submitted_for_review",
  approve: "approved",
  request_changes: "requested_changes",
  revise: "moved_to_draft",
  publish: "published",
  archive: "archived",
  unapprove: "moved_to_draft",
  unpublish: "unpublished",
};

export function performTransition(
  id: string,
  action: string,
  actorId: string,
  role: Role,
  comments?: string
): Content {
  const db = readDb();
  const content = db.content.find((c) => c.id === id);
  if (!content) throw new Error("Content not found");

  const nextStatus = assertTransition(content, action, role);
  content.status = nextStatus;
  content.updatedAt = nowIso();

  if (action === "submit") content.submittedAt = nowIso();
  if (action === "publish") content.publishedAt = nowIso();
  if (action === "archive") content.archivedAt = nowIso();

  if (action === "approve" || action === "request_changes") {
    const review: Review = {
      id: newId(),
      contentId: id,
      reviewerId: actorId,
      decision: action === "approve" ? "approved" : "changes_requested",
      comments: comments ?? "",
      createdAt: nowIso(),
    };
    db.reviews.push(review);
  }

  logAudit(db, {
    userId: actorId,
    action: ACTION_LABEL[action] ?? action,
    entityType: "content",
    entityId: id,
    entityLabel: content.title,
    detail: comments,
  });
  writeDb(db);
  return content;
}

export function listVersions(contentId: string) {
  return readDb()
    .versions.filter((v) => v.contentId === contentId)
    .sort((a, b) => b.versionNumber - a.versionNumber);
}

export function listReviews(contentId: string): Review[] {
  return readDb()
    .reviews.filter((r) => r.contentId === contentId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function restoreVersion(contentId: string, versionId: string, actorId: string): Content | undefined {
  const db = readDb();
  const content = db.content.find((c) => c.id === contentId);
  const version = db.versions.find((v) => v.id === versionId && v.contentId === contentId);
  if (!content || !version) return undefined;
  content.title = version.title;
  content.body = version.body;
  content.metadata = version.metadata;
  content.updatedAt = nowIso();
  content.versionCount += 1;
  db.versions.push({
    id: newId(),
    contentId,
    versionNumber: content.versionCount,
    title: content.title,
    body: content.body,
    metadata: content.metadata,
    createdBy: actorId,
    createdAt: content.updatedAt,
    note: `Restored from version ${version.versionNumber}`,
  });
  logAudit(db, { userId: actorId, action: "restored_version", entityType: "content", entityId: contentId, entityLabel: content.title, detail: `v${version.versionNumber}` });
  writeDb(db);
  return content;
}

// ---- Bulk operations --------------------------------------------------

export interface BulkUpdatePayload {
  categoryId?: string;
  addTagId?: string;
  authorId?: string;
  campaignId?: string;
  archive?: boolean;
}

export function bulkUpdateContent(ids: string[], payload: BulkUpdatePayload, actorId: string): number {
  const db = readDb();
  let count = 0;
  for (const c of db.content) {
    if (!ids.includes(c.id)) continue;
    if (payload.categoryId !== undefined) c.categoryId = payload.categoryId;
    if (payload.authorId !== undefined) c.authorId = payload.authorId;
    if (payload.campaignId !== undefined) c.campaignId = payload.campaignId;
    if (payload.addTagId && !c.tagIds.includes(payload.addTagId)) c.tagIds.push(payload.addTagId);
    if (payload.archive) {
      c.status = "archived";
      c.archivedAt = nowIso();
    }
    c.updatedAt = nowIso();
    count++;
  }
  logAudit(db, {
    userId: actorId,
    action: "bulk_update",
    entityType: "content",
    entityId: ids.join(","),
    entityLabel: `${count} content items`,
    detail: JSON.stringify(payload),
  });
  writeDb(db);
  return count;
}

export interface ImportRow {
  title: string;
  type?: string;
  status?: string;
  category?: string;
  tags?: string;
  body?: string;
}

export interface ImportResult {
  created: Content[];
  errors: { row: number; message: string }[];
}

const VALID_TYPES: ContentType[] = ["article", "campaign", "event", "case_study"];
const VALID_STATUSES: ContentStatus[] = ["draft", "in_review", "changes_requested", "approved", "published", "archived"];

export function importContent(rows: ImportRow[], actorId: string): ImportResult {
  const db = readDb();
  const created: Content[] = [];
  const errors: { row: number; message: string }[] = [];

  rows.forEach((row, i) => {
    if (!row.title || !row.title.trim()) {
      errors.push({ row: i + 1, message: "Missing title" });
      return;
    }
    const type = (row.type?.toLowerCase().replace(/\s+/g, "_") as ContentType) || "article";
    if (!VALID_TYPES.includes(type)) {
      errors.push({ row: i + 1, message: `Invalid type "${row.type}"` });
      return;
    }
    const status = (row.status?.toLowerCase().replace(/\s+/g, "_") as ContentStatus) || "draft";
    if (!VALID_STATUSES.includes(status)) {
      errors.push({ row: i + 1, message: `Invalid status "${row.status}"` });
      return;
    }
    const category = db.categories.find(
      (cat) => cat.name.toLowerCase() === row.category?.toLowerCase() || cat.slug === row.category?.toLowerCase()
    );
    const tagNames = (row.tags ?? "").split(/[;,]/).map((t) => t.trim()).filter(Boolean);
    const tagIds: string[] = [];
    for (const name of tagNames) {
      let tag = db.tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
      if (!tag) {
        tag = { id: newId(), name };
        db.tags.push(tag);
      }
      tagIds.push(tag.id);
    }

    const now = nowIso();
    const baseSlug = slugify(row.title) || `imported-${Date.now()}-${i}`;
    let slug = baseSlug;
    let n = 1;
    while (db.content.some((c) => c.slug === slug)) slug = `${baseSlug}-${++n}`;

    const content: Content = {
      id: newId(),
      title: row.title.trim(),
      slug,
      type,
      status,
      body: row.body ?? "",
      authorId: actorId,
      categoryId: category?.id,
      tagIds,
      metadata: { metaTitle: row.title.trim(), metaDescription: "", keywords: [] },
      typeFields: {},
      createdAt: now,
      updatedAt: now,
      versionCount: 1,
    };
    db.content.push(content);
    db.versions.push({
      id: newId(),
      contentId: content.id,
      versionNumber: 1,
      title: content.title,
      body: content.body,
      metadata: content.metadata,
      createdBy: actorId,
      createdAt: now,
      note: "Imported",
    });
    created.push(content);
  });

  if (created.length > 0) {
    logAudit(db, {
      userId: actorId,
      action: "bulk_import",
      entityType: "content",
      entityId: created.map((c) => c.id).join(","),
      entityLabel: `${created.length} content items imported`,
    });
  }
  writeDb(db);
  return { created, errors };
}
