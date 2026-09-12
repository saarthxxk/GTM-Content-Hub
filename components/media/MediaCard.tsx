import { FileText, Film, Image as ImageIcon } from "lucide-react";
import { formatBytes, formatRelativeDate } from "@/lib/utils";
import type { MediaAsset } from "@/types";

const ICONS = { image: ImageIcon, document: FileText, video: Film };
const TILE_COLORS = ["#eef0fd", "#eff4ff", "#ecfdf3", "#fffaeb", "#fef2f2"];

function tileColor(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return TILE_COLORS[hash % TILE_COLORS.length];
}

export function MediaCard({ asset, onClick }: { asset: MediaAsset; onClick: () => void }) {
  const Icon = ICONS[asset.type];
  const isDataUrl = asset.url.startsWith("data:");

  return (
    <button
      onClick={onClick}
      className="focus-ring group flex flex-col overflow-hidden rounded-xl border border-border bg-surface text-left transition-shadow hover:shadow-md"
    >
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden" style={{ backgroundColor: isDataUrl ? undefined : tileColor(asset.id) }}>
        {isDataUrl && asset.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.url} alt={asset.altText ?? asset.filename} className="h-full w-full object-cover" />
        ) : (
          <Icon className="h-8 w-8 text-muted" aria-hidden="true" />
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-[13px] font-medium text-foreground" title={asset.filename}>{asset.filename}</p>
        <p className="mt-0.5 text-xs text-muted">{formatBytes(asset.size)} · {formatRelativeDate(asset.uploadedAt)}</p>
        {!asset.altText && (
          <p className="mt-1 text-xs text-warning">Missing alt text</p>
        )}
      </div>
    </button>
  );
}
