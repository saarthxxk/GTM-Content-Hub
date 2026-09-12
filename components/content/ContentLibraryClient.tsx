"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileStack, Plus, Upload } from "lucide-react";
import { ContentFilters, ContentFilterState } from "./ContentFilters";
import { ContentTable } from "./ContentTable";
import { BulkActionsBar } from "./BulkActionsBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import type { Campaign, Category, Content, Role, Tag, User } from "@/types";

export function ContentLibraryClient({
  items,
  users,
  categories,
  campaigns,
  tags,
  role,
}: {
  items: Content[];
  users: User[];
  categories: Category[];
  campaigns: Campaign[];
  tags: Tag[];
  role: Role;
}) {
  const router = useRouter();
  const [filters, setFilters] = useState<ContentFilterState>({
    search: "",
    status: "all",
    type: "all",
    authorId: "all",
    campaignId: "all",
    categoryId: "all",
  });
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return items.filter((c) => {
      if (filters.search && !c.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.status !== "all" && c.status !== filters.status) return false;
      if (filters.type !== "all" && c.type !== filters.type) return false;
      if (filters.authorId !== "all" && c.authorId !== filters.authorId) return false;
      if (filters.campaignId !== "all" && c.campaignId !== filters.campaignId) return false;
      if (filters.categoryId !== "all" && c.categoryId !== filters.categoryId) return false;
      return true;
    });
  }, [items, filters]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () =>
    setSelected((prev) => (prev.length === filtered.length ? [] : filtered.map((f) => f.id)));

  const applyBulk = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/content/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, ...payload }),
    });
    if (!res.ok) throw new Error("Bulk update failed");
    setSelected([]);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Content Library</h1>
        <div className="flex items-center gap-2">
          <Link href="/studio/content/import">
            <Button variant="outline">
              <Upload className="h-4 w-4" /> Import
            </Button>
          </Link>
          <Link href="/studio/content/new">
            <Button variant="primary">
              <Plus className="h-4 w-4" /> New Content
            </Button>
          </Link>
        </div>
      </div>

      <ContentFilters filters={filters} onChange={setFilters} users={users} categories={categories} campaigns={campaigns} />

      {role === "admin" && selected.length > 0 && (
        <BulkActionsBar
          count={selected.length}
          categories={categories}
          tags={tags}
          campaigns={campaigns}
          users={users}
          onClear={() => setSelected([])}
          onApplied={applyBulk}
        />
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileStack}
          title="No content matches your filters"
          description="Try adjusting your search or filters, or create a new piece of content."
          action={
            <Link href="/studio/content/new">
              <Button variant="primary" size="sm">
                <Plus className="h-4 w-4" /> New Content
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="rounded-xl border border-border bg-surface">
          <ContentTable
            items={filtered}
            users={users}
            selectable={role === "admin"}
            selectedIds={selected}
            onToggle={toggle}
            onToggleAll={toggleAll}
          />
        </div>
      )}
    </div>
  );
}
