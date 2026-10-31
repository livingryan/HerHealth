import * as React from "react";
import { cn } from "./cn";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 40, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-white text-ink",
        { w: size, h: size },
        className
      )}
      {...props}
    />
  )
);
Avatar.displayName = "Avatar";