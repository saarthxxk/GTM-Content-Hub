"use client";

import { X } from "lucide-react";
import { FormField, Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import type { Campaign, Category, Content, ContentMetadata, Tag, TypeFields } from "@/types";

export function MetadataPanel({
  content,
  metadata,
  onMetadataChange,
  categoryId,
  onCategoryChange,
  campaignId,
  onCampaignChange,
  tagIds,
  onTagIdsChange,
  typeFields,
  onTypeFieldsChange,
  categories,
  campaigns,
  tags,
}: {
  content: Content;
  metadata: ContentMetadata;
  onMetadataChange: (m: ContentMetadata) => void;
  categoryId: string;
  onCategoryChange: (v: string) => void;
  campaignId: string;
  onCampaignChange: (v: string) => void;
  tagIds: string[];
  onTagIdsChange: (v: string[]) => void;
  typeFields: TypeFields;
  onTypeFieldsChange: (v: TypeFields) => void;
  categories: Category[];
  campaigns: Campaign[];
  tags: Tag[];
}) {
  const toggleTag = (id: string) => {
    onTagIdsChange(tagIds.includes(id) ? tagIds.filter((t) => t !== id) : [...tagIds, id]);
  };

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">Organization</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Category">
            <Select value={categoryId} onChange={(e) => onCategoryChange(e.target.value)}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Campaign">
            <Select value={campaignId} onChange={(e) => onCampaignChange(e.target.value)}>
              <option value="">None</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </FormField>
        </div>
        <FormField label="Tags" className="mt-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => {
              const active = tagIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  aria-pressed={active}
                  className="focus-ring rounded-full"
                >
                  <Badge tone={active ? "brand" : "neutral"} dot={false} className="cursor-pointer">
                    {t.name}
                    {active && <X className="h-3 w-3" />}
                  </Badge>
                </button>
              );
            })}
          </div>
        </FormField>
      </section>

      {content.type === "campaign" && (
        <TypeFieldsCampaign typeFields={typeFields} onChange={onTypeFieldsChange} />
      )}
      {content.type === "event" && <TypeFieldsEvent typeFields={typeFields} onChange={onTypeFieldsChange} />}
      {content.type === "case_study" && <TypeFieldsCaseStudy typeFields={typeFields} onChange={onTypeFieldsChange} />}

      <section>
        <h3 className="text-sm font-semibold text-foreground mb-1">SEO Metadata</h3>
        <p className="text-xs text-muted mb-3">Shown in search results and social previews. Use the AI Assistant to generate suggestions.</p>
        <div className="flex flex-col gap-4">
          <FormField label="SEO Title" hint={`${metadata.metaTitle.length}/60 characters`}>
            <Input
              value={metadata.metaTitle}
              onChange={(e) => onMetadataChange({ ...metadata, metaTitle: e.target.value })}
              maxLength={70}
            />
          </FormField>
          <FormField label="Meta Description" hint={`${metadata.metaDescription.length}/155 characters`}>
            <Textarea
              rows={3}
              value={metadata.metaDescription}
              onChange={(e) => onMetadataChange({ ...metadata, metaDescription: e.target.value })}
              maxLength={200}
            />
          </FormField>
          <FormField label="Keywords" hint="Comma-separated">
            <Input
              value={metadata.keywords.join(", ")}
              onChange={(e) =>
                onMetadataChange({ ...metadata, keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) })
              }
            />
          </FormField>
          <FormField label="Canonical URL" hint="Optional — set only if this content is republished elsewhere">
            <Input
              value={metadata.canonicalUrl ?? ""}
              onChange={(e) => onMetadataChange({ ...metadata, canonicalUrl: e.target.value })}
              placeholder="https://…"
            />
          </FormField>
        </div>
      </section>
    </div>
  );
}

function TypeFieldsCampaign({ typeFields, onChange }: { typeFields: TypeFields; onChange: (v: TypeFields) => void }) {
  const f = typeFields.campaign ?? {};
  const set = (patch: Partial<NonNullable<TypeFields["campaign"]>>) => onChange({ ...typeFields, campaign: { ...f, ...patch } });
  return (
    <section>
      <h3 className="text-sm font-semibold text-foreground mb-3">Campaign Details</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Target Audience">
          <Input value={f.targetAudience ?? ""} onChange={(e) => set({ targetAudience: e.target.value })} />
        </FormField>
        <FormField label="Call to Action">
          <Input value={f.cta ?? ""} onChange={(e) => set({ cta: e.target.value })} />
        </FormField>
        <FormField label="CTA URL">
          <Input value={f.ctaUrl ?? ""} onChange={(e) => set({ ctaUrl: e.target.value })} placeholder="https://…" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Start Date">
            <Input type="date" value={f.startDate ?? ""} onChange={(e) => set({ startDate: e.target.value })} />
          </FormField>
          <FormField label="End Date">
            <Input type="date" value={f.endDate ?? ""} onChange={(e) => set({ endDate: e.target.value })} />
          </FormField>
        </div>
      </div>
    </section>
  );
}

function TypeFieldsEvent({ typeFields, onChange }: { typeFields: TypeFields; onChange: (v: TypeFields) => void }) {
  const f = typeFields.event ?? {};
  const set = (patch: Partial<NonNullable<TypeFields["event"]>>) => onChange({ ...typeFields, event: { ...f, ...patch } });
  return (
    <section>
      <h3 className="text-sm font-semibold text-foreground mb-3">Event Details</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Event Date">
          <Input type="date" value={f.eventDate ?? ""} onChange={(e) => set({ eventDate: e.target.value })} />
        </FormField>
        <FormField label="Location">
          <Input value={f.location ?? ""} onChange={(e) => set({ location: e.target.value })} />
        </FormField>
        <FormField label="Speaker">
          <Input value={f.speaker ?? ""} onChange={(e) => set({ speaker: e.target.value })} />
        </FormField>
        <FormField label="Registration URL">
          <Input value={f.registrationUrl ?? ""} onChange={(e) => set({ registrationUrl: e.target.value })} placeholder="https://…" />
        </FormField>
      </div>
    </section>
  );
}

function TypeFieldsCaseStudy({ typeFields, onChange }: { typeFields: TypeFields; onChange: (v: TypeFields) => void }) {
  const f = typeFields.case_study ?? {};
  const set = (patch: Partial<NonNullable<TypeFields["case_study"]>>) => onChange({ ...typeFields, case_study: { ...f, ...patch } });
  return (
    <section>
      <h3 className="text-sm font-semibold text-foreground mb-3">Case Study Details</h3>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Client">
            <Input value={f.client ?? ""} onChange={(e) => set({ client: e.target.value })} />
          </FormField>
          <FormField label="Industry">
            <Input value={f.industry ?? ""} onChange={(e) => set({ industry: e.target.value })} />
          </FormField>
        </div>
        <FormField label="Challenge">
          <Textarea rows={2} value={f.challenge ?? ""} onChange={(e) => set({ challenge: e.target.value })} />
        </FormField>
        <FormField label="Solution">
          <Textarea rows={2} value={f.solution ?? ""} onChange={(e) => set({ solution: e.target.value })} />
        </FormField>
        <FormField label="Results">
          <Textarea rows={2} value={f.results ?? ""} onChange={(e) => set({ results: e.target.value })} />
        </FormField>
      </div>
    </section>
  );
}
