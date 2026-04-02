"use client";

import { useMemo, useState } from "react";

import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

type TickerLogoProps = {
  symbol: string;
  variant: "ticker" | "search";
  className?: string;
};

const VARIANT_CLASSES = {
  ticker: "size-16",
  search: "size-9",
} as const;

export function TickerLogo({ symbol, variant, className }: TickerLogoProps) {
  const { resolvedTheme } = useTheme();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const src = useMemo(() => {
    const params = new URLSearchParams({
      variant,
      theme: resolvedTheme,
    });

    return `/api/logo/ticker/${encodeURIComponent(symbol.trim().toUpperCase())}?${params.toString()}`;
  }, [resolvedTheme, symbol, variant]);

  if (failedSrc === src) {
    return null;
  }

  return (
    <span
      className={cn(
        "shrink-0 overflow-hidden",
        VARIANT_CLASSES[variant],
        className,
      )}
      aria-hidden="true"
    >
      {/* The app proxy returns the final image variant, so a plain img keeps failure handling simple. */}
      <img
        src={src}
        alt=""
        className="size-full object-contain"
        loading="lazy"
        decoding="async"
        onError={() => setFailedSrc(src)}
      />
    </span>
  );
}
