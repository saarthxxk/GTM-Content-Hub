import type { MetadataRoute } from "next";
import { listContent } from "@/lib/store/content";
import { PUBLIC_PATH } from "@/lib/public-routes";

const SITE_URL = process.env.SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const published = listContent({ status: "published" });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/articles`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/campaigns`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/events`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/case-studies`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const contentRoutes: MetadataRoute.Sitemap = published.map((c) => ({
    url: `${SITE_URL}${PUBLIC_PATH[c.type]}/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...contentRoutes];
}
