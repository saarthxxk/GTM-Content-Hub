import { ContentListing } from "@/components/public/ContentListing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Articles" };

export default function ArticlesPage() {
  return <ContentListing type="article" title="Articles" description="Thought leadership and how-to guidance from our team." />;
}
