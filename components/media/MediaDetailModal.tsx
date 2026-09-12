"use client";

import { useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { formatBytes, formatDate } from "@/lib/utils";
import type { Campaign, MediaAsset } from "@/types";

/** Lightweight heuristic alt-text suggestion derived from the filename —
 * not an LLM call, just a fast accessibility nudge for the common case of a
 * descriptively-named file (see the "AI can suggest alt text" idea in the
 * product spec's Media Library section). */
function suggestAltFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function MediaDetailModal({
  asset,
  campaigns,
  onClose,
  onUpdated,
  onDeleted,
}: {
  asset: MediaAsset | null;
  campaigns: Campaign[];
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const [altText, setAltText] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadedAssetId, setLoadedAssetId] = useState<string | null>(null);
  const { push } = useToast();

  // Re-seed the form fields when a different asset is opened. This runs
  // during render (React's documented pattern for "adjusting state when a
  // prop changes") rather than in an effect, so opening a new asset never
  // flashes the previous one's values first.
  if (asset && asset.id !== loadedAssetId) {
    setLoadedAssetId(asset.id);
    setAltText(asset.altText ?? "");
    setDescription(asset.description ?? "");
    setTags(asset.tags.join(", "));
    setCampaignId(asset.campaignId ?? "");
  }

  if (!asset) return null;

  // Reset so reopening later re-seeds from the persisted asset rather than
  // showing whatever was left in the fields when this was last closed.
  const handleClose = () => {
    setLoadedAssetId(null);
    onClose();
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/media/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          altText,
          description,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          campaignId: campaignId || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      push({ tone: "success", title: "Asset updated" });
      onUpdated();
      handleClose();
    } catch {
      push({ tone: "error", title: "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete ${asset.filename}? This can't be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/media/${asset.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      push({ tone: "success", title: "Asset deleted" });
      onDeleted();
      handleClose();
    } catch {
      push({ tone: "error", title: "Delete failed" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      open={!!asset}
      onClose={handleClose}
      title={asset.filename}
      description={`${formatBytes(asset.size)} · uploaded ${formatDate(asset.uploadedAt)}`}
      size="lg"
      footer={
        <>
          <Button variant="danger" loading={deleting} onClick={remove} className="mr-auto">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={save}>Save</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 flex items-center justify-center rounded-xl bg-neutral-soft p-4">
          {asset.url.startsWith("data:") && asset.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset.url} alt={altText || asset.filename} className="max-h-64 rounded-lg object-contain" />
          ) : (
            <p className="text-sm text-muted py-10">{asset.mimeType}</p>
          )}
        </div>
        <FormField label="Alt text" hint="Required for accessibility and SEO." className="sm:col-span-2">
          <div className="flex gap-2">
            <Input value={altText} onChange={(e) => setAltText(e.target.value)} />
            <Button type="button" variant="outline" size="sm" onClick={() => setAltText(suggestAltFromFilename(asset.filename))}>
              <Sparkles className="h-3.5 w-3.5" /> Suggest
            </Button>
          </div>
        </FormField>
        <FormField label="Description" className="sm:col-span-2">
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormField>
        <FormField label="Tags" hint="Comma-separated">
          <Input value={tags} onChange={(e) => setTags(e.target.value)} />
        </FormField>
        <FormField label="Campaign">
          <Select value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
            <option value="">None</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </FormField>
      </div>
    </Modal>
  );
}
