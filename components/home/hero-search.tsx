"use client";

import { ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useSyncExternalStore } from "react";

import { TickerResolverResults } from "@/components/search/ticker-resolver-results";
import { getOptionId, useTickerResolverSearch } from "@/components/search/use-ticker-resolver-search";
import { Card } from "@/components/ui/card";
import { compareRoute, tickerRoute } from "@/lib/routes";
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
  const recentSymbols = useSyncExternalStore(subscribeRecentSymbols, readRecentSymbols, readRecentSymbolsServerSnapshot);
  const resolver = useTickerResolverSearch({
    maxResults: 6,
    onResolveAction(result) {
      pushRecentSymbol(result.symbol);

      startTransition(() => {
        router.push(tickerRoute(result.symbol));
      });
    },
  });

  return (
    <Card variant="band" className="relative z-20 px-5 py-5 md:px-6 md:py-6">
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
          <div className="relative z-20 max-w-[430px]">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                resolver.submitActiveResult();
              }}
              className="glass-shell glass-input-shell flex items-center gap-3 rounded-[1.35rem] px-4 py-3.5"
            >
              <Search className="size-5 shrink-0 text-(--ink-soft)" />
              <input
                role="combobox"
                value={resolver.query}
                onChange={(event) => resolver.setQuery(event.target.value)}
                onFocus={resolver.handleInputFocus}
                onKeyDown={resolver.handleInputKeyDown}
                placeholder="Search symbols or companies…"
                aria-autocomplete="list"
                aria-haspopup="listbox"
                aria-controls={resolver.listboxId}
                aria-activedescendant={resolver.activeDescendantId}
                aria-expanded={resolver.shouldShowResults}
                className="w-full bg-transparent text-base text-(--ink) outline-none placeholder:text-(--ink-soft)"
              />
            </form>
            <TickerResolverResults
              activeIndex={resolver.activeIndex}
              className="top-[calc(100%+10px)]"
              displayMode="overlay"
              emptyMessage="No matches found."
              errorMessage={resolver.errorMessage}
              getOptionId={(index) => getOptionId(resolver.listboxId, index)}
              isPending={resolver.isPending}
              isOpen={resolver.shouldShowResults}
              listboxId={resolver.listboxId}
              onHover={resolver.handleResultMouseEnter}
              onPrefetchSymbol={(symbol) => router.prefetch(tickerRoute(symbol))}
              onSelect={resolver.handleResultSelect}
              results={resolver.results}
            />
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
