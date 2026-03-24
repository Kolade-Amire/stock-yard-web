import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl border backdrop-blur-md transition-colors",
  {
    variants: {
      variant: {
        panel:
          "border-(--line) bg-(--surface) shadow-[0_4px_24px_rgba(0,0,0,0.2)]",
        band:
          "border-(--line-strong) bg-(--surface-strong) shadow-[0_4px_32px_rgba(0,0,0,0.24)]",
        rail:
          "border-(--line) bg-(--surface-float) shadow-[0_4px_20px_rgba(0,0,0,0.18)]",
        muted:
          "border-(--line) bg-(--surface-muted) shadow-[0_2px_12px_rgba(0,0,0,0.1)]",
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
