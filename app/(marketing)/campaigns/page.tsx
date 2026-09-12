import { ContentListing } from "@/components/public/ContentListing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Campaigns" };

export default function CampaignsPage() {
  return <ContentListing type="campaign" title="Campaigns" description="Current offers and promotions from our go-to-market team." />;
}
