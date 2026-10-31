import * as React from "react";
import { cn } from "./cn";

type Variant = "primary" | "outline" | "ghost" | "text";
type Size = "sm" | "md" | "lg";

function buttonBase(variant: Variant, size: Size, className?: string) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink focus-visible:ring-offset-2 focus-visible:ring-offset-blush disabled:pointer-events-none disabled:opacity-50";
  const variants: Record<Variant, string> = {
    primary: "bg-deep text-white hover:bg-pink",
    outline: "bg-transparent border border-border text-ink hover:bg-rose",
    ghost: "bg-transparent text-deep hover:bg-baby",
    text: "bg-transparent text-pink hover:underline underline-offset-4",
  };
  const sizes: Record<Size, string> = {
    sm: "h-10 px-4 text-sm",
    md: "h-12 px-6 text-base",
    lg: "h-14 px-10 text-lg",
  };
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={buttonBase(variant, size, className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";