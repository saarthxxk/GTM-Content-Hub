import { readDb } from "./db";
import type { ContentAnalytics } from "@/types";

export function getContentAnalytics(contentId: string): ContentAnalytics | undefined {
  return readDb().analytics.find((a) => a.contentId === contentId);
}

export function listAnalytics(): ContentAnalytics[] {
  return readDb().analytics;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  avgEngagementRate: number;
  seriesByDate: { date: string; views: number; clicks: number; conversions: number }[];
  byCampaign: { campaignId: string; campaignName: string; views: number }[];
  byCategory: { categoryId: string; categoryName: string; count: number }[];
  byStatus: Record<string, number>;
  topContent: { contentId: string; title: string; views: number; engagementRate: number }[];
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const db = readDb();
  const { analytics, content, campaigns, categories } = db;

  const totalViews = analytics.reduce((s, a) => s + a.totalViews, 0);
  const totalClicks = analytics.reduce((s, a) => s + a.totalClicks, 0);
  const totalConversions = analytics.reduce((s, a) => s + a.totalConversions, 0);
  const avgEngagementRate =
    analytics.length > 0
      ? Math.round((analytics.reduce((s, a) => s + a.engagementRate, 0) / analytics.length) * 10) / 10
      : 0;

  const dateMap = new Map<string, { views: number; clicks: number; conversions: number }>();
  for (const a of analytics) {
    for (const p of a.series) {
      const entry = dateMap.get(p.date) ?? { views: 0, clicks: 0, conversions: 0 };
      entry.views += p.views;
      entry.clicks += p.clicks;
      entry.conversions += p.conversions;
      dateMap.set(p.date, entry);
    }
  }
  const seriesByDate = Array.from(dateMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, v]) => ({ date, ...v }));

  const campaignViews = new Map<string, number>();
  for (const a of analytics) {
    const c = content.find((c) => c.id === a.contentId);
    if (c?.campaignId) campaignViews.set(c.campaignId, (campaignViews.get(c.campaignId) ?? 0) + a.totalViews);
  }
  const byCampaign = Array.from(campaignViews.entries())
    .map(([campaignId, views]) => ({
      campaignId,
      campaignName: campaigns.find((c) => c.id === campaignId)?.name ?? "Unknown",
      views,
    }))
    .sort((a, b) => b.views - a.views);

  const categoryCount = new Map<string, number>();
  for (const c of content) {
    if (c.categoryId) categoryCount.set(c.categoryId, (categoryCount.get(c.categoryId) ?? 0) + 1);
  }
  const byCategory = Array.from(categoryCount.entries())
    .map(([categoryId, count]) => ({
      categoryId,
      categoryName: categories.find((c) => c.id === categoryId)?.name ?? "Unknown",
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const byStatus: Record<string, number> = {};
  for (const c of content) {
    byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
  }

  const topContent = analytics
    .map((a) => ({
      contentId: a.contentId,
      title: content.find((c) => c.id === a.contentId)?.title ?? "Untitled",
      views: a.totalViews,
      engagementRate: a.engagementRate,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return { totalViews, totalClicks, totalConversions, avgEngagementRate, seriesByDate, byCampaign, byCategory, byStatus, topContent };
}
