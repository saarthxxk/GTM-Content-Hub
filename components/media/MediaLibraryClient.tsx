"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Search, Upload } from "lucide-react";
import { MediaCard } from "./MediaCard";
import { UploadModal } from "./UploadModal";
import { MediaDetailModal } from "./MediaDetailModal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Campaign, MediaAsset, MediaType } from "@/types";

export function MediaLibraryClient({ items, campaigns }: { items: MediaAsset[]; campaigns: Campaign[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<MediaType | "all">("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selected, setSelected] = useState<MediaAsset | null>(null);

  const filtered = useMemo(
    () =>
      items.filter((m) => {
        if (type !== "all" && m.type !== type) return false;
        if (search && !m.filename.toLowerCase().includes(search.toLowerCase()) && !m.altText?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [items, search, type]
  );

  const refresh = () => router.refresh();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Media Library</h1>
        <Button variant="primary" onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4" /> Upload Asset
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search media..." className="pl-9" aria-label="Search media" />
        </div>
        <Select aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value as MediaType | "all")} className="sm:w-40">
          <option value="all">All types</option>
          <option value="image">Images</option>
          <option value="document">Documents</option>
          <option value="video">Video</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No media assets found" description="Upload images, PDFs, or video to use across your content." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((asset) => (
            <MediaCard key={asset.id} asset={asset} onClick={() => setSelected(asset)} />
          ))}
        </div>
      )}

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={refresh} />
      <MediaDetailModal
        asset={selected}
        campaigns={campaigns}
        onClose={() => setSelected(null)}
        onUpdated={refresh}
        onDeleted={refresh}
      />
    </div>
  );
}
