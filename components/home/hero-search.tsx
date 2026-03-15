"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useDeferredValue, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { stockYardClient } from "@/lib/stock-yard/client";
import { tickerRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";

const FEATURED_SYMBOLS = ["AAPL", "MSFT", "NVDA", "SPY", "QQQ"];

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());

  const searchQuery = useQuery({
    queryKey: ["ticker-search", deferredQuery],
    queryFn: () => stockYardClient.searchTickers(deferredQuery),
    enabled: deferredQuery.length > 0,
    staleTime: 60_000,
  });

  function handleSelect(symbol: string) {
    startTransition(() => {
      router.push(tickerRoute(symbol));
    });
  }

  return (
    <Card className="overflow-hidden px-5 py-6 md:px-8 md:py-8">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-(--line-strong) bg-(--surface-strong) px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-(--ink-soft)">
            <Sparkles className="size-3.5 text-(--accent)" />
            Stock-Yard
          </div>
          <div className="space-y-4">
            <h1 className="max-w-4xl font-(family-name:--font-display) text-5xl leading-[0.95] text-(--ink) md:text-7xl">
              A research terminal that feels quick, light, and deliberate.
            </h1>
            <p className="max-w-2xl text-base text-(--ink-muted) md:text-lg">
              Search the market, pivot into a deep ticker workspace, compare a focused basket, and keep chat anchored to the research context.
            </p>
          </div>
          <div className="relative max-w-3xl">
            <div className="flex items-center gap-3 rounded-[28px] border border-(--line-strong) bg-(--surface-strong) px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.46)]">
              <Search className="size-5 text-(--ink-soft)" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search symbols or companies"
                className="w-full bg-transparent text-lg text-(--ink) outline-none placeholder:text-(--ink-soft)"
              />
              <Button type="button" onClick={() => deferredQuery && handleSelect(deferredQuery.toUpperCase())}>
                Open
              </Button>
            </div>
            {deferredQuery ? (
              <div className="absolute inset-x-0 top-[calc(100%+12px)] z-20 rounded-[24px] border border-(--line) bg-(--surface) p-3 shadow-[0_22px_50px_rgba(56,44,18,0.14)]">
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
        </div>
        <div className="flex flex-col gap-4">
          <Card className="px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--ink-soft)">Fast paths</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {FEATURED_SYMBOLS.map((symbol) => (
                <Link
                  key={symbol}
                  href={tickerRoute(symbol)}
                  className={cn(
                    "rounded-full border border-(--line-strong) bg-(--surface-strong) px-4 py-2 text-sm font-medium text-(--ink) transition-colors hover:border-(--accent) hover:bg-(--accent-soft)",
                  )}
                >
                  {symbol}
                </Link>
              ))}
            </div>
          </Card>
          <Card className="px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--ink-soft)">Design stance</p>
            <div className="mt-4 grid gap-3">
              <p className="rounded-2xl bg-[linear-gradient(135deg,rgba(202,140,71,0.18),rgba(47,107,87,0.12))] px-4 py-3 text-sm text-(--ink-muted)">
                Warm parchment surfaces, dark-ink contrast, and restrained accent colors so charts stay readable instead of noisy.
              </p>
              <p className="rounded-2xl border border-(--line) px-4 py-3 text-sm text-(--ink-muted)">
                Above-the-fold widgets render first; deeper research sections load progressively once the page shell is already stable.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
}
