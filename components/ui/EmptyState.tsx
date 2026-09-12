import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-14 px-6 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-soft">
        <Icon className="h-5 w-5 text-muted" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="mt-1 text-[13px] text-muted max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
