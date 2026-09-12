import { listContent } from "@/lib/store/content";
import { listCategories } from "@/lib/store/catalog";
import { ContentCard } from "./ContentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileStack } from "lucide-react";
import type { ContentType } from "@/types";

export function ContentListing({ type, title, description }: { type: ContentType; title: string; description: string }) {
  const items = listContent({ type, status: "published" });
  const categories = listCategories();
  const categoryById = (id?: string) => categories.find((c) => c.id === id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-[15px] text-muted">{description}</p>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={FileStack} title="Nothing published yet" description="Check back soon for new content." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <ContentCard key={c.id} content={c} category={categoryById(c.categoryId)} />
          ))}
        </div>
      )}
    </div>
  );
}
