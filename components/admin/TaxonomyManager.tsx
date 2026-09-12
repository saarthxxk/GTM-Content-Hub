"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import type { Category, Tag } from "@/types";

export function TaxonomyManager({ categories, tags }: { categories: Category[]; tags: Tag[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <SimpleTaxonomyList title="Categories" endpoint="/api/categories" items={categories.map((c) => c.name)} />
      <SimpleTaxonomyList title="Tags" endpoint="/api/tags" items={tags.map((t) => t.name)} />
    </div>
  );
}

function SimpleTaxonomyList({ title, endpoint, items }: { title: string; endpoint: string; items: string[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const add = async () => {
    if (!value.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value.trim() }),
      });
      if (!res.ok) throw new Error();
      setValue("");
      push({ tone: "success", title: `${title.slice(0, -1)} added` });
      router.refresh();
    } catch {
      push({ tone: "error", title: "Could not add" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {items.map((name) => (
          <Badge key={name} tone="neutral" dot={false}>{name}</Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={`New ${title.slice(0, -1).toLowerCase()} name`}
        />
        <Button variant="outline" loading={submitting} onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
