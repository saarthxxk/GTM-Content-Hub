import type { ContentType } from "@/types";

/** Public site URL prefix for each content type — kept separate from the
 * /studio/* editor routes so the two apps (internal CMS vs. public website)
 * never collide on a path. See app/(public routes) and app/studio/*. */
export const PUBLIC_PATH: Record<ContentType, string> = {
  article: "/articles",
  campaign: "/campaigns",
  event: "/events",
  case_study: "/case-studies",
};
