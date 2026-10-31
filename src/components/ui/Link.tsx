import * as React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "./cn";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, children, to, href, onClick, ...props }, ref) => {
    const navigate = useNavigate();
    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (to) {
          event.preventDefault();
          navigate(to);
        }
        onClick?.(event);
      },
      [to, navigate, onClick]
    );
    return (
      <a
        ref={ref}
        href={to ?? href}
        onClick={handleClick}
        className={cn(
          "inline text-pink font-medium transition-colors hover:underline underline-offset-4 focus-visible:underline focus-visible:ring-2 focus-visible:ring-pink rounded-sm px-1",
          className
        )}
        {...props}
      >
        {children}
      </a>
    );
  }
);
Link.displayName = "Link";