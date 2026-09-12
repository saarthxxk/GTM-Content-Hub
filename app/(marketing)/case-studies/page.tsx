import { ContentListing } from "@/components/public/ContentListing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Case Studies" };

export default function CaseStudiesPage() {
  return <ContentListing type="case_study" title="Case Studies" description="Real customer outcomes across industries." />;
}
