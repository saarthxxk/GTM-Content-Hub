import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { listContent } from "@/lib/store/content";
import { listUsers } from "@/lib/store/catalog";
import { StatusBadge, TypeBadge } from "@/components/content/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { formatRelativeDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Review Queue" };

export default async function ReviewQueuePage() {
  const inReview = listContent({ status: "in_review" });
  const changesRequested = listContent({ status: "changes_requested" });
  const users = listUsers();
  const userById = (id: string) => users.find((u) => u.id === id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Review Queue</h1>
        <p className="mt-1 text-[13px] text-muted">Content waiting on your decision, prioritized by submission time.</p>
      </div>

      {inReview.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="Nothing waiting for review" description="Submitted content will show up here for approval." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {inReview.map((item) => {
            const author = userById(item.authorId);
            return (
              <Link key={item.id} href={`/studio/content/${item.id}`} className="focus-ring block rounded-xl">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <TypeBadge type={item.type} />
                      <StatusBadge status={item.status} />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-foreground line-clamp-2">{item.title}</h3>
                    {item.excerpt && <p className="mt-1 text-[13px] text-muted line-clamp-2">{item.excerpt}</p>}
                    <div className="mt-4 flex items-center justify-between">
                      {author && (
                        <span className="flex items-center gap-2">
                          <Avatar name={author.name} color={author.avatarColor} size="sm" />
                          <span className="text-xs text-foreground">{author.name}</span>
                        </span>
                      )}
                      <span className="text-xs text-muted">Submitted {formatRelativeDate(item.submittedAt)}</span>
                    </div>
                    {item.quality && (
                      <div className="mt-3 border-t border-border pt-3">
                        <span className="text-xs text-muted">AI Quality Score: </span>
                        <Badge tone={item.quality.score >= 80 ? "success" : item.quality.score >= 60 ? "warning" : "danger"} dot={false}>
                          {item.quality.score}/100
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {changesRequested.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Sent Back for Changes</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {changesRequested.map((item) => {
              const author = userById(item.authorId);
              return (
                <Link key={item.id} href={`/studio/content/${item.id}`} className="focus-ring block rounded-xl">
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <TypeBadge type={item.type} />
                        <StatusBadge status={item.status} />
                      </div>
                      <h3 className="mt-2 text-sm font-semibold text-foreground line-clamp-2">{item.title}</h3>
                      {author && (
                        <span className="mt-3 flex items-center gap-2">
                          <Avatar name={author.name} color={author.avatarColor} size="sm" />
                          <span className="text-xs text-foreground">{author.name}</span>
                        </span>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
