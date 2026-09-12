import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "info" | "warning" | "success" | "danger" | "brand";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-neutral-soft text-foreground",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  brand: "bg-brand-soft text-brand",
};

const dotClasses: Record<BadgeTone, string> = {
  neutral: "bg-muted",
  info: "bg-info",
  warning: "bg-warning",
  success: "bg-success",
  danger: "bg-danger",
  brand: "bg-brand",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

/** Status indicators always pair a dot + label — never color alone — so
 * status remains legible for color-blind users (see accessibility notes). */
export function Badge({ tone = "neutral", dot = true, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotClasses[tone])} aria-hidden="true" />}
      {children}
    </span>
  );
}
