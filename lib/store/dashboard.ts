import { readDb } from "./db";

export interface DashboardStats {
  total: number;
  published: number;
  pendingReview: number;
  drafts: number;
  needsAttention: number;
  updatedThisMonth: number;
  avgReviewTimeDays: number;
  aiAssistedPct: number;
  metadataCompletionPct: number;
}

export function getDashboardStats(): DashboardStats {
  const db = readDb();
  const { content, reviews } = db;
  const now = new Date();

  const published = content.filter((c) => c.status === "published").length;
  const pendingReview = content.filter((c) => c.status === "in_review").length;
  const drafts = content.filter((c) => c.status === "draft").length;
  const needsAttention =
    content.filter((c) => c.status === "changes_requested").length +
    content.filter((c) => c.quality && c.quality.score < 70).length;

  const updatedThisMonth = content.filter((c) => {
    const d = new Date(c.updatedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const reviewDurations: number[] = [];
  for (const c of content) {
    if (!c.submittedAt) continue;
    const review = reviews.find((r) => r.contentId === c.id);
    if (!review) continue;
    const ms = new Date(review.createdAt).getTime() - new Date(c.submittedAt).getTime();
    if (ms > 0) reviewDurations.push(ms / 86400000);
  }
  const avgReviewTimeDays = reviewDurations.length
    ? Math.round((reviewDurations.reduce((s, v) => s + v, 0) / reviewDurations.length) * 10) / 10
    : 0;

  const aiAssistedPct = content.length ? Math.round((content.filter((c) => !!c.quality).length / content.length) * 100) : 0;
  const metadataCompletionPct = content.length
    ? Math.round((content.filter((c) => !!c.metadata.metaDescription?.trim()).length / content.length) * 100)
    : 0;

  return {
    total: content.length,
    published,
    pendingReview,
    drafts,
    needsAttention,
    updatedThisMonth,
    avgReviewTimeDays,
    aiAssistedPct,
    metadataCompletionPct,
  };
}
