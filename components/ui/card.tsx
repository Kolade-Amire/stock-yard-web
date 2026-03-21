import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-[30px] border backdrop-blur-[18px] transition-colors",
  {
    variants: {
      variant: {
        panel:
          "border-(--line) bg-(--surface) shadow-[0_18px_48px_rgba(56,44,18,0.08)]",
        band:
          "border-(--line-strong) bg-[linear-gradient(180deg,rgba(255,250,241,0.8),rgba(247,239,224,0.9))] shadow-[0_22px_60px_rgba(56,44,18,0.09)]",
        rail:
          "border-(--line) bg-(--surface-float) shadow-[0_16px_42px_rgba(56,44,18,0.08)]",
        muted:
          "border-(--line) bg-(--surface-muted) shadow-[0_12px_32px_rgba(56,44,18,0.05)]",
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
