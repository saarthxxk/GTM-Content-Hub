// Core domain types for GTM Content Hub.
// This is the single source of truth for the shape of content, users, and
// workflow state across the client, API routes, and the mock data layer.
// When the app is later wired to Supabase, these types should mirror the
// generated database types (see supabase/migrations/0001_init.sql).

export type Role = "author" | "reviewer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
  title?: string;
}

export type ContentType = "article" | "campaign" | "event" | "case_study";

export type ContentStatus =
  | "draft"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "published"
  | "archived";

export const CONTENT_STATUSES: ContentStatus[] = [
  "draft",
  "in_review",
  "changes_requested",
  "approved",
  "published",
  "archived",
];

export interface ContentMetadata {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
}

/** Type-specific fields, keyed by ContentType. All optional since a draft
 * may not have them filled in yet. */
export interface ArticleFields {
  subtitle?: string;
  category?: string;
}

export interface CampaignFields {
  targetAudience?: string;
  cta?: string;
  ctaUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface EventFields {
  eventDate?: string;
  location?: string;
  speaker?: string;
  registrationUrl?: string;
}

export interface CaseStudyFields {
  client?: string;
  industry?: string;
  challenge?: string;
  solution?: string;
  results?: string;
}

export interface TypeFields {
  article?: ArticleFields;
  campaign?: CampaignFields;
  event?: EventFields;
  case_study?: CaseStudyFields;
}

export interface QualityCheckItem {
  id: string;
  label: string;
  passed: boolean;
  severity: "info" | "warning" | "error";
  source: "rule" | "ai";
}

export interface QualityReport {
  score: number; // 0-100
  ruleScore: number;
  aiScore: number;
  generatedAt: string;
  checks: QualityCheckItem[];
}

export interface ContentVersion {
  id: string;
  contentId: string;
  versionNumber: number;
  title: string;
  body: string;
  metadata: ContentMetadata;
  createdBy: string;
  createdAt: string;
  note?: string;
}

export interface Review {
  id: string;
  contentId: string;
  reviewerId: string;
  decision: "approved" | "changes_requested";
  comments: string;
  createdAt: string;
}

export interface Content {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  type: ContentType;
  status: ContentStatus;
  body: string;
  excerpt?: string;
  coverImage?: string;
  authorId: string;
  campaignId?: string;
  categoryId?: string;
  tagIds: string[];
  metadata: ContentMetadata;
  typeFields: TypeFields;
  quality?: QualityReport;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  publishedAt?: string;
  archivedAt?: string;
  versionCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export type MediaType = "image" | "document" | "video";

export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  type: MediaType;
  mimeType: string;
  size: number;
  altText?: string;
  description?: string;
  tags: string[];
  campaignId?: string;
  uploadedBy: string;
  uploadedAt: string;
  width?: number;
  height?: number;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entityType: "content" | "media" | "user" | "campaign" | "category" | "tag";
  entityId: string;
  entityLabel: string;
  detail?: string;
  createdAt: string;
}

export interface AnalyticsEventPoint {
  date: string;
  views: number;
  clicks: number;
  ctaClicks: number;
  conversions: number;
}

export interface ContentAnalytics {
  contentId: string;
  totalViews: number;
  totalClicks: number;
  totalCtaClicks: number;
  totalConversions: number;
  engagementRate: number;
  series: AnalyticsEventPoint[];
}

// ---- AI service contracts -------------------------------------------------

export interface AISummaryResult {
  summary: string;
}

export interface AISeoResult {
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface AITagsResult {
  tags: string[];
}

export interface AIQualityResult {
  score: number;
  strengths: string[];
  issues: { label: string; severity: "warning" | "error" }[];
}

export interface AIBrandResult {
  passed: boolean;
  violations: { rule: string; detail: string }[];
}

export interface AICtaResult {
  cta: string;
  alternatives: string[];
}

export interface WorkflowTransition {
  from: ContentStatus;
  to: ContentStatus;
  action: string;
  allowedRoles: Role[];
}
