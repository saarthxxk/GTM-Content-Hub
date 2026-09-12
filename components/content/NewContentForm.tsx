"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Megaphone, Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { Category, ContentType } from "@/types";

const TYPES: { value: ContentType; label: string; description: string; icon: React.ElementType }[] = [
  { value: "article", label: "Article", description: "Long-form thought leadership or how-to content", icon: FileText },
  { value: "campaign", label: "Campaign", description: "A promotional push with a target audience and CTA", icon: Megaphone },
  { value: "event", label: "Event", description: "Webinars, conferences, and other live moments", icon: Calendar },
  { value: "case_study", label: "Case Study", description: "Client challenge, solution, and results narrative", icon: BookOpen },
];

export function NewContentForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ContentType>("article");
  const [categoryId, setCategoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, categoryId: categoryId || undefined }),
      });
      if (!res.ok) throw new Error();
      const { content } = await res.json();
      push({ tone: "success", title: "Draft created" });
      router.push(`/studio/content/${content.id}`);
    } catch {
      push({ tone: "error", title: "Could not create content" });
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 max-w-2xl">
      <FormField label="Content type" required>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TYPES.map((t) => (
            <button
              type="button"
              key={t.value}
              onClick={() => setType(t.value)}
              className={cn(
                "focus-ring flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                type === t.value ? "border-brand bg-brand-soft" : "border-border bg-surface hover:bg-neutral-soft"
              )}
              aria-pressed={type === t.value}
            >
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", type === t.value ? "bg-brand text-white" : "bg-neutral-soft text-muted")}>
                <t.icon className="h-4.5 w-4.5" />
              </span>
              <span>
                <span className="block text-sm font-medium text-foreground">{t.label}</span>
                <span className="block text-xs text-muted mt-0.5">{t.description}</span>
              </span>
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="Title" required hint="You can refine this later — it also becomes the URL slug.">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. AI Transformation Strategy for Modern Enterprises" autoFocus />
      </FormField>

      <FormField label="Category">
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">No category yet</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" variant="primary" loading={submitting} disabled={!title.trim()}>
          Create draft
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
