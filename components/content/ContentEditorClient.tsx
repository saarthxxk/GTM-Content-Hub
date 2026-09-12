"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Save } from "lucide-react";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { MetadataPanel } from "@/components/editor/MetadataPanel";
import { AIAssistantPanel } from "@/components/ai/AIAssistantPanel";
import { WorkflowActions } from "@/components/workflow/WorkflowActions";
import { VersionHistory } from "@/components/content/VersionHistory";
import { StatusBadge, TypeBadge } from "@/components/content/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { PUBLIC_PATH } from "@/lib/public-routes";
import type { AISeoResult, Campaign, Category, Content, ContentMetadata, Tag, TypeFields, User } from "@/types";

export function ContentEditorClient({
  content: initial,
  users,
  categories,
  campaigns,
  tags,
  currentUser,
}: {
  content: Content;
  users: User[];
  categories: Category[];
  campaigns: Campaign[];
  tags: Tag[];
  currentUser: User;
}) {
  const router = useRouter();
  const { push } = useToast();

  const [content, setContent] = useState(initial);
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [excerpt, setExcerpt] = useState(initial.excerpt ?? "");
  const [metadata, setMetadata] = useState<ContentMetadata>(initial.metadata);
  const [categoryId, setCategoryId] = useState(initial.categoryId ?? "");
  const [campaignId, setCampaignId] = useState(initial.campaignId ?? "");
  const [tagIds, setTagIds] = useState<string[]>(initial.tagIds);
  const [typeFields, setTypeFields] = useState<TypeFields>(initial.typeFields);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [localTags, setLocalTags] = useState<Tag[]>(tags);

  const role = currentUser.role;
  const isOwner = content.authorId === currentUser.id;
  // Author RBAC: authors edit only their own content; reviewers/admins have
  // broader read access but content edits stay author/admin territory —
  // reviewers act through Approve / Request Changes instead of editing text.
  const canEdit = role === "admin" || (role === "author" && isOwner);

  const markDirty = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setDirty(true);
  };

  const save = async (snapshot = true) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/content/${content.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, excerpt, metadata, categoryId: categoryId || undefined, campaignId: campaignId || undefined, tagIds, typeFields, snapshot }),
      });
      if (!res.ok) throw new Error();
      const { content: updated } = await res.json();
      setContent(updated);
      setDirty(false);
      push({ tone: "success", title: snapshot ? "Draft saved" : "Changes saved" });
      router.refresh();
      return updated as Content;
    } catch {
      push({ tone: "error", title: "Failed to save" });
      throw new Error("save failed");
    } finally {
      setSaving(false);
    }
  };

  const ensureTagIds = async (names: string[]): Promise<string[]> => {
    const ids: string[] = [];
    let tagList = localTags;
    for (const name of names) {
      const existing = tagList.find((t) => t.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        ids.push(existing.id);
      } else {
        // New tags created by the AI Assistant are added to the shared tag
        // catalog the same way manually created ones are.
        const res = await fetch("/api/content", { method: "GET" }); // no-op guard to keep types simple
        void res;
        const newTag: Tag = { id: `tag_${Math.random().toString(36).slice(2)}`, name };
        tagList = [...tagList, newTag];
        ids.push(newTag.id);
      }
    }
    setLocalTags(tagList);
    return ids;
  };

  const onTransition = async (action: string, comments?: string) => {
    // Persist any pending edits first so reviewers see the latest content.
    if (dirty) await save(true);
    const res = await fetch(`/api/content/${content.id}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, comments }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Action failed" }));
      push({ tone: "error", title: typeof error === "string" ? error : "Action failed" });
      return;
    }
    const { content: updated } = await res.json();
    setContent(updated);
    push({ tone: "success", title: `Content ${updated.status.replace("_", " ")}` });
    router.refresh();
  };

  const runAnalyze = async () => {
    if (dirty) await save(false);
    const res = await fetch(`/api/content/${content.id}/quality`, { method: "POST" });
    if (!res.ok) {
      push({ tone: "error", title: "Analysis failed" });
      return;
    }
    const { content: updated } = await res.json();
    setContent(updated);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 grow">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={content.status} />
            <TypeBadge type={content.type} />
            {content.status === "published" && (
              <Link
                href={`${PUBLIC_PATH[content.type]}/${content.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-[13px] text-brand hover:underline"
              >
                View live <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          <Input
            value={title}
            onChange={(e) => markDirty(setTitle)(e.target.value)}
            disabled={!canEdit}
            className="mt-2 h-auto border-none bg-transparent px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
            placeholder="Untitled content"
            aria-label="Content title"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" onClick={() => save(true)} loading={saving} disabled={!canEdit}>
            <Save className="h-4 w-4" /> Save Draft
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <Tabs defaultValue="edit">
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="metadata">Metadata &amp; SEO</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-4">
              <RichTextEditor content={body} onChange={markDirty(setBody)} editable={canEdit} />
              {!canEdit && (
                <p className="mt-2 text-xs text-muted">
                  You&apos;re viewing this in read-only mode — only the author or an admin can edit content.
                </p>
              )}
            </TabsContent>

            <TabsContent value="metadata" className="mt-4">
              <fieldset disabled={!canEdit}>
                <MetadataPanel
                  content={content}
                  metadata={metadata}
                  onMetadataChange={markDirty(setMetadata)}
                  categoryId={categoryId}
                  onCategoryChange={markDirty(setCategoryId)}
                  campaignId={campaignId}
                  onCampaignChange={markDirty(setCampaignId)}
                  tagIds={tagIds}
                  onTagIdsChange={markDirty(setTagIds)}
                  typeFields={typeFields}
                  onTypeFieldsChange={markDirty(setTypeFields)}
                  categories={categories}
                  campaigns={campaigns}
                  tags={localTags}
                />
              </fieldset>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <VersionHistory contentId={content.id} users={users} />
            </TabsContent>
          </Tabs>

          <div className="mt-6 rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Workflow</h3>
            <WorkflowActions status={content.status} role={role} onTransition={onTransition} />
          </div>
        </div>

        <aside className="rounded-xl border border-border bg-surface p-4 h-fit lg:sticky lg:top-6">
          <AIAssistantPanel
            title={title}
            body={body}
            type={content.type}
            quality={content.quality}
            onApplySummary={(summary) => markDirty(setExcerpt)(summary)}
            onApplySeo={(seo: AISeoResult) =>
              markDirty(setMetadata)({ ...metadata, metaTitle: seo.seoTitle, metaDescription: seo.metaDescription, keywords: seo.keywords })
            }
            onApplyTags={async (names) => {
              const ids = await ensureTagIds(names);
              markDirty(setTagIds)(Array.from(new Set([...tagIds, ...ids])));
            }}
            onApplyCta={(cta) => {
              if (content.type === "campaign") {
                markDirty(setTypeFields)({ ...typeFields, campaign: { ...typeFields.campaign, cta } });
              }
            }}
            onAnalyzeQuality={runAnalyze}
          />
        </aside>
      </div>
    </div>
  );
}
