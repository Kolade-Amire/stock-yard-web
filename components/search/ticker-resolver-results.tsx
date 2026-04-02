"use client";

import { ArrowUpRight } from "lucide-react";

import { TickerLogo } from "@/components/ui/ticker-logo";
import type { SearchResult } from "@/lib/stock-yard/schemas";
import { cn } from "@/lib/utils";

type TickerResolverResultsProps = {
  activeIndex: number;
  className?: string;
  compact?: boolean;
  displayMode?: "overlay" | "inline";
  emptyMessage: string;
  errorMessage?: string | null;
  getOptionId: (index: number) => string;
  isPending: boolean;
  isOpen: boolean;
  listboxId: string;
  onHover: (index: number) => void;
  onPrefetchSymbol?: (symbol: string) => void;
  onSelect: (result: SearchResult) => void;
  results: SearchResult[];
};

export function TickerResolverResults({
  activeIndex,
  className,
  compact = false,
  displayMode = "overlay",
  emptyMessage,
  errorMessage,
  getOptionId,
  isPending,
  isOpen,
  listboxId,
  onHover,
  onPrefetchSymbol,
  onSelect,
  results,
}: TickerResolverResultsProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      id={listboxId}
      role="listbox"
      className={cn(
        "rounded-xl border border-(--line) bg-(--surface-overlay) p-2 backdrop-blur-xl",
        displayMode === "overlay"
          ? "absolute inset-x-0 z-20 shadow-[var(--shadow-popover)]"
          : "mt-2 w-full shadow-[var(--shadow-panel)]",
        className,
      )}
    >
      {isPending ? (
        <p className="px-3 py-3 text-sm text-(--ink-muted)">Searching…</p>
      ) : errorMessage ? (
        <p className="px-3 py-3 text-sm text-(--negative)">{errorMessage}</p>
      ) : results.length ? (
        <ul className="space-y-0.5">
          {results.map((result, index) => (
            <li key={result.symbol}>
              <button
                id={getOptionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                type="button"
                onMouseEnter={() => {
                  onHover(index);
                  onPrefetchSymbol?.(result.symbol);
                }}
                onClick={() => onSelect(result)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg text-left transition-colors",
                  compact ? "px-3 py-2" : "px-3 py-2.5",
                  index === activeIndex ? "bg-(--surface-strong)" : "hover:bg-(--surface-strong)",
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <TickerLogo
                    symbol={result.symbol}
                    variant="search"
                  />
                  <div className="min-w-0">
                    <p className={cn("truncate font-medium text-(--ink-strong)", compact ? "text-sm" : "text-base")}>
                      {result.name}
                    </p>
                    <p className="truncate text-xs text-(--ink-muted)">
                      {result.symbol}
                      {result.exchange ? ` · ${result.exchange}` : ""}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-(--ink-soft)" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-3 py-3 text-sm text-(--ink-muted)">{emptyMessage}</p>
      )}
    </div>
  );
}
