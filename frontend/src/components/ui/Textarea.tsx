import * as React from "react";
import { cn } from "./cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "rounded-md border border-border bg-white px-3 py-2 text-ink shadow-sm placeholder:text-ink/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink disabled:cursor-not-allowed disabled:bg-baby",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";