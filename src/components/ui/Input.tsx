import * as React from "react";
import { cn } from "./cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-border bg-white px-3 py-2 text-ink shadow-sm placeholder:text-ink/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink disabled:cursor-not-allowed disabled:bg-baby disabled:opacity-100",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";