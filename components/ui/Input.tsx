import { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export const Label = ({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("block text-[13px] font-medium text-foreground mb-1.5", className)} {...props} />
);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "focus-ring h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted disabled:opacity-50 disabled:bg-neutral-soft",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "focus-ring w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export function FormField({
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </Label>
      <div id={id}>{children}</div>
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
