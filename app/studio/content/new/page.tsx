import { listCategories } from "@/lib/store/catalog";
import { NewContentForm } from "@/components/content/NewContentForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "New Content" };

export default async function NewContentPage() {
  const categories = listCategories();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">New Content</h1>
        <p className="mt-1 text-[13px] text-muted">Choose a content type to get started. You&apos;ll fill in the rest in the editor.</p>
      </div>
      <NewContentForm categories={categories} />
    </div>
  );
}
