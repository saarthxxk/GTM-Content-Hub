import { ContentListing } from "@/components/public/ContentListing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Events" };

export default function EventsPage() {
  return <ContentListing type="event" title="Events" description="Upcoming webinars, conferences, and live sessions." />;
}
