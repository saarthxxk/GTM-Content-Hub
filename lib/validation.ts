import { z } from "zod";

export const contentTypeSchema = z.enum(["article", "campaign", "event", "case_study"]);
export const contentStatusSchema = z.enum([
  "draft",
  "in_review",
  "changes_requested",
  "approved",
  "published",
  "archived",
]);

export const createContentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  type: contentTypeSchema,
  categoryId: z.string().optional(),
  campaignId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  body: z.string().optional(),
});

export const updateContentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().optional(),
  excerpt: z.string().max(300).optional(),
  coverImage: z.string().optional(),
  categoryId: z.string().optional(),
  campaignId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  metadata: z
    .object({
      metaTitle: z.string().max(70).optional(),
      metaDescription: z.string().max(200).optional(),
      keywords: z.array(z.string()).optional(),
      canonicalUrl: z.string().optional(),
      ogImage: z.string().optional(),
    })
    .partial()
    .optional(),
  typeFields: z.record(z.string(), z.any()).optional(),
  snapshot: z.boolean().optional(),
});

export const transitionSchema = z.object({
  action: z.string().min(1),
  comments: z.string().max(2000).optional(),
});

export const bulkUpdateSchema = z.object({
  ids: z.array(z.string()).min(1),
  categoryId: z.string().optional(),
  addTagId: z.string().optional(),
  authorId: z.string().optional(),
  campaignId: z.string().optional(),
  archive: z.boolean().optional(),
});

export const importRowSchema = z.object({
  title: z.string(),
  type: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  body: z.string().optional(),
});

export const importPayloadSchema = z.object({
  rows: z.array(importRowSchema).min(1).max(2000),
});

export const mediaUploadSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().nonnegative(),
  dataUrl: z.string().optional(),
  altText: z.string().max(300).optional(),
  tags: z.array(z.string()).optional(),
  campaignId: z.string().optional(),
});

export const mediaUpdateSchema = z.object({
  altText: z.string().max(300).optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  campaignId: z.string().optional(),
});

export const aiRequestSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  type: z.string().min(1),
});

export const sessionSchema = z.object({
  userId: z.string().min(1),
});
