import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Avatar({
  name,
  color,
  size = "md",
  className,
}: {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = { sm: "h-6 w-6 text-[10px]", md: "h-8 w-8 text-xs", lg: "h-11 w-11 text-sm" };
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white", sizeClasses[size], className)}
      style={{ backgroundColor: color ?? "#6366f1" }}
      aria-hidden="true"
      title={name}
    >
      {initials(name)}
    </span>
  );
}
