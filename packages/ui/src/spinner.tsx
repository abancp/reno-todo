import * as React from "react";
import { cn } from "@repo/ui";

export function Spinner({
  className,
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary",
        className
      )}
    />
  );
}
