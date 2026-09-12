import { Badge } from "@/components/ui/Badge";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/workflow";
import type { ContentStatus, ContentType } from "@/types";
import { FileText, Megaphone, Calendar, BookOpen } from "lucide-react";

export function StatusBadge({ status }: { status: ContentStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}

export const TYPE_LABEL: Record<ContentType, string> = {
  article: "Article",
  campaign: "Campaign",
  event: "Event",
  case_study: "Case Study",
};

export const TYPE_ICON: Record<ContentType, React.ElementType> = {
  article: FileText,
  campaign: Megaphone,
  event: Calendar,
  case_study: BookOpen,
};

export function TypeBadge({ type }: { type: ContentType }) {
  const Icon = TYPE_ICON[type];
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {TYPE_LABEL[type]}
    </span>
  );
}
