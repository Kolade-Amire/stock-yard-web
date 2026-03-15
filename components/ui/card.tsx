import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-(--line) bg-(--surface)/95 shadow-[0_20px_60px_rgba(56,44,18,0.08)] backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
