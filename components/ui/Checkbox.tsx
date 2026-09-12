import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "focus-ring h-4 w-4 rounded border-border text-brand accent-[var(--brand)] cursor-pointer",
        className
      )}
      {...props}
    />
  )
);
Checkbox.displayName = "Checkbox";
