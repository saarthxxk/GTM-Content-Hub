import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getContent } from "@/lib/store/content";
import { listCampaigns, listCategories, listTags, listUsers } from "@/lib/store/catalog";
import { ContentEditorClient } from "@/components/content/ContentEditorClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const content = getContent(id);
  return { title: content?.title ?? "Content" };
}

export default async function ContentEditorPage({ params }: Props) {
  const { id } = await params;
  const content = getContent(id);
  if (!content) notFound();

  const currentUser = await getCurrentUser();
  const users = listUsers();
  const categories = listCategories();
  const campaigns = listCampaigns();
  const tags = listTags();

  return (
    <ContentEditorClient
      content={content}
      users={users}
      categories={categories}
      campaigns={campaigns}
      tags={tags}
      currentUser={currentUser}
    />
  );
}
