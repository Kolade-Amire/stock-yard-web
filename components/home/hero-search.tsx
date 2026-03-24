"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Search } from "lucide-react";
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
    <Card variant="band" className="px-5 py-5 md:px-6 md:py-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_320px]">
        <div className="space-y-5">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-(--ink-strong) md:text-4xl">
              Market Intelligence
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-(--ink-muted)">
              Search any symbol to open a research workspace with charts, news, financials, and AI-powered chat.
            </p>
          </div>
          <div className="relative max-w-3xl">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitSearch();
              }}
              className="flex items-center gap-3 rounded-xl border border-(--line-strong) bg-(--surface) px-4 py-3"
            >
              <Search className="size-5 text-(--ink-soft)" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search symbols or companies…"
                className="w-full bg-transparent text-base text-(--ink) outline-none placeholder:text-(--ink-soft)"
              />
              <Button type="submit">
                Search
              </Button>
            </form>
            {deferredQuery ? (
              <div className="absolute inset-x-0 top-[calc(100%+8px)] z-20 rounded-xl border border-(--line) bg-[rgba(15,18,25,0.96)] p-2 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                {searchQuery.isPending ? (
                  <p className="px-3 py-3 text-sm text-(--ink-muted)">Searching…</p>
                ) : searchQuery.data?.results.length ? (
                  <ul className="space-y-0.5">
                    {searchQuery.data.results.slice(0, 6).map((result) => (
                      <li key={result.symbol}>
                        <button
                          type="button"
                          onMouseEnter={() => router.prefetch(tickerRoute(result.symbol))}
                          onClick={() => handleSelect(result.symbol)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-(--surface-strong)"
                        >
                          <div>
                            <p className="font-semibold text-(--ink-strong)">{result.symbol}</p>
                            <p className="text-sm text-(--ink-muted)">{result.name}</p>
                          </div>
                          <ArrowUpRight className="size-4 text-(--ink-soft)" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 py-3 text-sm text-(--ink-muted)">No matches found.</p>
                )}
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <SymbolCluster
              label="Pinned"
              description="Commonly referenced symbols."
              symbols={FEATURED_SYMBOLS}
            />
            <SymbolCluster
              label="Recent"
              description="Last opened in this browser."
              symbols={recentSymbols}
              emptyMessage="No recent symbols yet."
            />
          </div>
        </div>
        <div className="grid gap-3 content-start">
          <Link href={compareRoute}>
            <div className="rounded-xl border border-(--line-strong) bg-gradient-to-br from-(--accent-soft) to-transparent px-5 py-5 transition-transform duration-150 hover:-translate-y-0.5">
              <p className="text-xs font-medium uppercase tracking-wider text-(--ink-soft)">Compare</p>
              <h2 className="mt-2 text-xl font-bold text-(--ink-strong)">Basket view</h2>
              <p className="mt-2 text-sm leading-relaxed text-(--ink-muted)">Compare 2–5 symbols side-by-side with multi-line charts and key metrics.</p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-(--accent)">
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
    <div className="rounded-xl border border-(--line) bg-(--surface-float) px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-wider text-(--ink-soft)">{label}</p>
      <p className="mt-1.5 text-sm text-(--ink-muted)">{description}</p>
      {symbols.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {symbols.map((symbol) => (
            <Link
              key={symbol}
              href={tickerRoute(symbol)}
              onClick={() => pushRecentSymbol(symbol)}
              className={cn(
                "rounded-lg border border-(--line-strong) bg-(--surface) px-3 py-1.5 text-sm font-medium text-(--ink) transition-colors hover:border-(--accent) hover:bg-(--accent-soft)",
              )}
            >
              {symbol}
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-(--ink-soft)">{emptyMessage}</p>
      )}
    </div>
  );
}
