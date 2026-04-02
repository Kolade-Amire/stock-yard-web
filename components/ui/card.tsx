import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl border backdrop-blur-md transition-colors",
  {
    variants: {
      variant: {
        panel:
          "border-(--line) bg-(--surface) shadow-[var(--shadow-panel)]",
        band:
          "border-(--line-strong) bg-(--surface-strong) shadow-[var(--shadow-band)]",
        rail:
          "border-(--line) bg-(--surface-float) shadow-[var(--shadow-rail)]",
        muted:
          "border-(--line) bg-(--surface-muted) shadow-[var(--shadow-muted)]",
        ghost: "border-transparent bg-transparent shadow-none backdrop-blur-0",
      },
    },
    defaultVariants: {
      variant: "panel",
    },
  },
);

type CardProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>;

export function Card({ className, variant, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  );
}
