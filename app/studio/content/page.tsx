import { getCurrentUser } from "@/lib/auth";
import { listContent } from "@/lib/store/content";
import { listCampaigns, listCategories, listTags, listUsers } from "@/lib/store/catalog";
import { ContentLibraryClient } from "@/components/content/ContentLibraryClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Content Library" };

export default async function ContentLibraryPage() {
  const user = await getCurrentUser();
  const items = listContent();
  const users = listUsers();
  const categories = listCategories();
  const campaigns = listCampaigns();
  const tags = listTags();

  return (
    <ContentLibraryClient items={items} users={users} categories={categories} campaigns={campaigns} tags={tags} role={user.role} />
  );
}
