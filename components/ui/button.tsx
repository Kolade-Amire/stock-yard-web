import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full border text-sm font-medium transition-[color,background-color,border-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-(--ink) bg-(--ink) px-4 py-2 text-(--surface) shadow-[0_10px_24px_rgba(35,27,21,0.14)] hover:bg-(--ink-strong)",
        secondary:
          "border-(--line-strong) bg-(--surface-float) px-4 py-2 text-(--ink) hover:border-(--line-heavy) hover:bg-(--surface-strong)",
        ghost:
          "border-transparent bg-transparent px-3 py-2 text-(--ink-muted) hover:border-(--line) hover:bg-(--surface) hover:text-(--ink)",
      },
      size: {
        default: "",
        compact: "px-3 py-1.5 text-xs uppercase tracking-[0.16em]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, size, variant, ...props },
  ref,
) {
  return <button ref={ref} className={cn(buttonVariants({ size, variant }), className)} {...props} />;
});
