import { listMedia } from "@/lib/store/media";
import { listCampaigns } from "@/lib/store/catalog";
import { MediaLibraryClient } from "@/components/media/MediaLibraryClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Media Library" };

export default async function MediaLibraryPage() {
  const items = listMedia();
  const campaigns = listCampaigns();
  return <MediaLibraryClient items={items} campaigns={campaigns} />;
}
