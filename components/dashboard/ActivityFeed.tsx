import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeDate, titleCase } from "@/lib/utils";
import type { AuditLogEntry, User } from "@/types";

export function ActivityFeed({ entries, users }: { entries: AuditLogEntry[]; users: User[] }) {
  if (entries.length === 0) {
    return <p className="text-[13px] text-muted">No activity yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-4">
      {entries.map((e) => {
        const actor = users.find((u) => u.id === e.userId);
        return (
          <li key={e.id} className="flex gap-3">
            {actor && <Avatar name={actor.name} color={actor.avatarColor} size="sm" className="mt-0.5" />}
            <div className="min-w-0">
              <p className="text-[13px] text-foreground">
                <span className="font-medium">{actor?.name ?? "Someone"}</span>{" "}
                <span className="text-muted">{titleCase(e.action).toLowerCase()}</span>{" "}
                <span className="font-medium">{e.entityLabel}</span>
              </p>
              <p className="text-xs text-muted">{formatRelativeDate(e.createdAt)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
