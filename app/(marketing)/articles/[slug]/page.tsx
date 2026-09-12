import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getContentBySlug } from "@/lib/store/content";
import { getUser, listCampaigns, listCategories } from "@/lib/store/catalog";
import { ContentDetail } from "@/components/public/ContentDetail";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function load(slug: string) {
  const content = getContentBySlug(slug);
  if (!content || content.type !== "article" || content.status !== "published") return null;
  return content;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = load(slug);
  if (!content) return { title: "Not Found" };
  return {
    title: content.metadata.metaTitle || content.title,
    description: content.metadata.metaDescription || content.excerpt,
    alternates: content.metadata.canonicalUrl ? { canonical: content.metadata.canonicalUrl } : undefined,
    openGraph: {
      title: content.metadata.metaTitle || content.title,
      description: content.metadata.metaDescription || content.excerpt,
      type: "article",
    },
    keywords: content.metadata.keywords,
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const content = load(slug);
  if (!content) notFound();

  const author = getUser(content.authorId);
  const categories = listCategories();
  const campaigns = listCampaigns();

  return (
    <ContentDetail
      content={content}
      author={author}
      category={categories.find((c) => c.id === content.categoryId)}
      campaign={campaigns.find((c) => c.id === content.campaignId)}
    />
  );
}
