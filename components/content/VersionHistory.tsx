"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { History, RotateCcw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import type { ContentVersion, Review, User } from "@/types";

export function VersionHistory({ contentId, users }: { contentId: string; users: User[] }) {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const router = useRouter();
  const { push } = useToast();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/content/${contentId}/versions`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setVersions(data.versions);
        setReviews(data.reviews);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [contentId]);

  const restore = async (versionId: string) => {
    setRestoring(versionId);
    try {
      const res = await fetch(`/api/content/${contentId}/versions/${versionId}/restore`, { method: "POST" });
      if (!res.ok) throw new Error();
      push({ tone: "success", title: "Version restored" });
      router.refresh();
    } catch {
      push({ tone: "error", title: "Could not restore version" });
    } finally {
      setRestoring(null);
    }
  };

  const userName = (id: string) => users.find((u) => u.id === id)?.name ?? "Unknown";

  if (loading) return <p className="text-[13px] text-muted">Loading history…</p>;

  return (
    <div className="flex flex-col gap-6">
      {reviews.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <MessageSquare className="h-4 w-4" /> Review Feedback
          </h3>
          <ul className="flex flex-col gap-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-foreground">{userName(r.reviewerId)}</span>
                  <span
                    className={`text-xs font-medium ${r.decision === "approved" ? "text-success" : "text-warning"}`}
                  >
                    {r.decision === "approved" ? "Approved" : "Requested changes"}
                  </span>
                </div>
                {r.comments && <p className="mt-1.5 text-[13px] text-muted">{r.comments}</p>}
                <p className="mt-1.5 text-xs text-muted">{formatRelativeDate(r.createdAt)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <History className="h-4 w-4" /> Version History
        </h3>
        <ul className="flex flex-col gap-2">
          {versions.map((v, i) => (
            <li key={v.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-foreground">
                  Version {v.versionNumber} {i === 0 && <span className="text-muted font-normal">(current)</span>}
                </p>
                <p className="text-xs text-muted">
                  {v.note} · {userName(v.createdBy)} · {formatDate(v.createdAt)}
                </p>
              </div>
              {i !== 0 && (
                <Button size="sm" variant="outline" loading={restoring === v.id} onClick={() => restore(v.id)}>
                  <RotateCcw className="h-3.5 w-3.5" /> Restore
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
