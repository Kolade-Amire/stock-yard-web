"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useDeferredValue, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { compareRoute, tickerRoute } from "@/lib/routes";
import { stockYardClient } from "@/lib/stock-yard/client";
import {
  pushRecentSymbol,
  readRecentSymbols,
  readRecentSymbolsServerSnapshot,
  subscribeRecentSymbols,
} from "@/lib/recent-symbols";
import { cn } from "@/lib/utils";

const FEATURED_SYMBOLS = ["AAPL", "MSFT", "NVDA", "SPY", "QQQ"];

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const recentSymbols = useSyncExternalStore(subscribeRecentSymbols, readRecentSymbols, readRecentSymbolsServerSnapshot);

  const searchQuery = useQuery({
    queryKey: ["ticker-search", deferredQuery],
    queryFn: () => stockYardClient.searchTickers(deferredQuery),
    enabled: deferredQuery.length > 0,
    staleTime: 60_000,
  });

  function handleSelect(symbol: string) {
    pushRecentSymbol(symbol);

    startTransition(() => {
      router.push(tickerRoute(symbol));
    });
  }

  function submitSearch() {
    const symbol = (deferredQuery || query.trim()).toUpperCase();

    if (!symbol) {
      return;
    }

    handleSelect(symbol);
  }

  return (
    <Card variant="band" className="overflow-visible px-5 py-5 md:px-7 md:py-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_340px]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-(--line-strong) bg-(--surface-float) px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-(--ink-soft)">
              <Sparkles className="size-3.5 text-(--accent)" />
              Command Deck
            </div>
            <div className="inline-flex items-center rounded-full border border-(--line) px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-(--ink-soft)">
              Search-first workflow
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="max-w-4xl font-(family-name:--font-display) text-5xl leading-[0.92] text-(--ink) md:text-7xl">
              Search first. Research fast.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-(--ink-muted) md:text-base">
              Start with a symbol, land in a dedicated research workspace, compare a tight basket when needed, and keep chat scoped to the active ticker.
            </p>
          </div>
          <div className="relative max-w-4xl">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitSearch();
              }}
              className="flex items-center gap-3 rounded-[30px] border border-(--line-strong) bg-(--surface-float) px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.52)]"
            >
              <Search className="size-5 text-(--ink-soft)" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search symbols or companies"
                className="w-full bg-transparent text-lg text-(--ink) outline-none placeholder:text-(--ink-soft)"
              />
              <Button type="submit">
                Open
              </Button>
            </form>
            {deferredQuery ? (
              <div className="absolute inset-x-0 top-[calc(100%+12px)] z-20 rounded-[24px] border border-(--line) bg-(--surface-float) p-3 shadow-[0_22px_50px_rgba(56,44,18,0.14)]">
                {searchQuery.isPending ? (
                  <p className="px-3 py-3 text-sm text-(--ink-muted)">Searching symbols…</p>
                ) : searchQuery.data?.results.length ? (
                  <ul className="space-y-1">
                    {searchQuery.data.results.slice(0, 6).map((result) => (
                      <li key={result.symbol}>
                        <button
                          type="button"
                          onMouseEnter={() => router.prefetch(tickerRoute(result.symbol))}
                          onClick={() => handleSelect(result.symbol)}
                          className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition-colors hover:bg-(--surface-strong)"
                        >
                          <div>
                            <p className="font-semibold text-(--ink)">{result.symbol}</p>
                            <p className="text-sm text-(--ink-muted)">{result.name}</p>
                          </div>
                          <ArrowUpRight className="size-4 text-(--ink-soft)" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 py-3 text-sm text-(--ink-muted)">No symbol matches yet.</p>
                )}
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <SymbolCluster
              label="Pinned"
              description="Fast lanes into the most commonly referenced symbols."
              symbols={FEATURED_SYMBOLS}
            />
            <SymbolCluster
              label="Recent"
              description="Last ticker workspaces opened in this browser."
              symbols={recentSymbols}
              emptyMessage="No recent symbols yet."
            />
          </div>
        </div>
        <div className="grid gap-3 content-start">
          <div className="rounded-[28px] border border-(--line) bg-(--surface-float) px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-(--ink-soft)">Workflow</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-[20px] border border-(--line) bg-(--surface) px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-(--ink-soft)">1. Open a symbol</p>
                <p className="mt-2 text-sm leading-6 text-(--ink-muted)">Search from here or the header command bar to jump directly into ticker research.</p>
              </div>
              <div className="rounded-[20px] border border-(--line) bg-(--surface) px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-(--ink-soft)">2. Read the workspace</p>
                <p className="mt-2 text-sm leading-6 text-(--ink-muted)">Chart, news, research tabs, and chat all stay centered on the active symbol.</p>
              </div>
            </div>
          </div>
          <Link href={compareRoute}>
            <div className="rounded-[28px] border border-(--line-strong) bg-[linear-gradient(145deg,rgba(202,140,71,0.18),rgba(255,250,238,0.76))] px-5 py-5 transition-transform duration-150 hover:-translate-y-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-(--ink-soft)">Compare</p>
              <h2 className="mt-3 font-(family-name:--font-display) text-3xl text-(--ink)">Basket view</h2>
              <p className="mt-2 text-sm leading-6 text-(--ink-muted)">Move from one name into a focused 2 to 5 symbol comparison without leaving the product rhythm.</p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-(--ink)">
                Open compare <ArrowUpRight className="size-4" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </Card>
  );
}

type SymbolClusterProps = {
  label: string;
  description: string;
  symbols: string[];
  emptyMessage?: string;
};

function SymbolCluster({ label, description, symbols, emptyMessage }: SymbolClusterProps) {
  return (
    <div className="rounded-[26px] border border-(--line) bg-(--surface-float) px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-(--ink-soft)">{label}</p>
      <p className="mt-2 text-sm leading-6 text-(--ink-muted)">{description}</p>
      {symbols.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {symbols.map((symbol) => (
            <Link
              key={symbol}
              href={tickerRoute(symbol)}
              onClick={() => pushRecentSymbol(symbol)}
              className={cn(
                "rounded-full border border-(--line-strong) bg-(--surface) px-3 py-2 text-sm font-medium text-(--ink) transition-colors hover:border-(--accent) hover:bg-(--accent-soft)",
              )}
            >
              {symbol}
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-(--ink-soft)">{emptyMessage}</p>
      )}
    </div>
  );
}
