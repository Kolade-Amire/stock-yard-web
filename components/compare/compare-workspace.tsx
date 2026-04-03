"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { TickerResolverResults } from "@/components/search/ticker-resolver-results";
import { getOptionId, useTickerResolverSearch } from "@/components/search/use-ticker-resolver-search";
import { getCompareSeriesColor } from "@/components/compare/series-colors";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataLimitations } from "@/components/ui/data-limitations";
import { stockYardClient } from "@/lib/stock-yard/client";
import { HISTORY_INTERVALS_BY_PERIOD, HISTORY_PERIODS } from "@/lib/stock-yard/constants";
import { formatCurrency, formatSignedPercent } from "@/lib/stock-yard/format";
import { compareRouteWithQuery, tickerRoute } from "@/lib/routes";
import type { CompareResponse } from "@/lib/stock-yard/schemas";

const TimeSeriesChart = dynamic(
  () => import("@/components/charts/time-series-chart").then((module) => module.TimeSeriesChart),
  {
    ssr: false,
    loading: () => <div className="h-[380px] animate-pulse rounded-lg bg-(--surface-strong)" />,
  },
);

type CompareWorkspaceProps = {
  configured: boolean;
  initialData: CompareResponse | null;
  initialSymbols: string[];
  initialPeriod: (typeof HISTORY_PERIODS)[number];
  initialInterval: "1d" | "1wk" | "1mo";
};

export function CompareWorkspace({ configured, initialData, initialSymbols, initialPeriod, initialInterval }: CompareWorkspaceProps) {
  const router = useRouter();
  const [symbols, setSymbols] = useState(initialSymbols);
  const [period, setPeriod] = useState(initialPeriod);
  const [interval, setInterval] = useState(initialInterval);
  const resolver = useTickerResolverSearch({
    maxResults: 5,
    onResolveAction(result) {
      return addSymbol(result.symbol);
    },
  });

  const compareQuery = useQuery({
    queryKey: ["compare", symbols, period, interval],
    queryFn: () => stockYardClient.compareTickers(symbols, period, interval),
    enabled: configured && symbols.length >= 2,
    initialData: initialData && arraysEqual(initialSymbols, symbols) && initialPeriod === period && initialInterval === interval ? initialData : undefined,
  });

  function syncUrl(nextSymbols: string[], nextPeriod: string, nextInterval: string) {
    const params = new URLSearchParams({
      symbols: nextSymbols.join(","),
      period: nextPeriod,
      interval: nextInterval,
    });

    startTransition(() => {
      router.replace(compareRouteWithQuery(params.toString()));
    });
  }

  function addSymbol(symbol: string) {
    if (symbols.includes(symbol) || symbols.length >= 5) {
      return false;
    }

    const nextSymbols = [...symbols, symbol];
    setSymbols(nextSymbols);
    syncUrl(nextSymbols, period, interval);
    return true;
  }

  function removeSymbol(symbol: string) {
    const nextSymbols = symbols.filter((item) => item !== symbol);

    if (nextSymbols.length < 2) {
      return;
    }

    setSymbols(nextSymbols);
    syncUrl(nextSymbols, period, interval);
  }

  function choosePeriod(nextPeriod: (typeof HISTORY_PERIODS)[number]) {
    const allowedIntervals = HISTORY_INTERVALS_BY_PERIOD[nextPeriod];
    const nextInterval = allowedIntervals.includes(interval) ? interval : allowedIntervals[0];

    setPeriod(nextPeriod);
    setInterval(nextInterval);
    syncUrl(symbols, nextPeriod, nextInterval);
  }

  function chooseInterval(nextInterval: "1d" | "1wk" | "1mo") {
    setInterval(nextInterval);
    syncUrl(symbols, period, nextInterval);
  }

  return (
    <div className="relative isolate space-y-4">
      <Card variant="band" material="glass" className="relative z-30 overflow-visible px-4 py-4 sm:px-5 sm:py-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-(--ink-strong)">Compare</h1>
              <p className="mt-1 text-sm text-(--ink-muted)">
                Side-by-side performance for 2–5 symbols.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {symbols.map((symbol) => (
                <div key={symbol} className="glass-micro-pill inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-(--ink)">
                  {symbol}
                  <button
                    type="button"
                    onClick={() => removeSymbol(symbol)}
                    className="rounded p-0.5 text-(--ink-soft) transition-colors hover:text-(--ink)"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="relative z-40 w-full max-w-none sm:max-w-[430px]">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  resolver.submitActiveResult();
                }}
              >
                <div className="glass-shell glass-input-shell flex items-center gap-3 rounded-[1.35rem] px-4 py-3.5">
                  <Search className="size-5 shrink-0 text-(--ink-soft)" />
                  <input
                    role="combobox"
                    value={resolver.query}
                    onChange={(event) => resolver.setQuery(event.target.value)}
                    onFocus={resolver.handleInputFocus}
                    onKeyDown={resolver.handleInputKeyDown}
                    aria-label="Compare symbol search"
                    placeholder="Add a symbol or company…"
                    aria-autocomplete="list"
                    aria-haspopup="listbox"
                    aria-controls={resolver.listboxId}
                    aria-activedescendant={resolver.activeDescendantId}
                    aria-expanded={resolver.shouldShowResults}
                    className="w-full bg-transparent text-base text-(--ink) outline-none placeholder:text-(--ink-soft)"
                  />
                </div>
              </form>
              <TickerResolverResults
                activeIndex={resolver.activeIndex}
                className="top-[calc(100%+10px)]"
                displayMode="overlay"
                emptyMessage="No matching symbols."
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
          </div>
          <div className="glass-subcard min-w-0 space-y-3 rounded-xl px-4 py-4">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-(--ink-soft)">Period</p>
              <div className="glass-pill-nav touch-scroll-row md:flex-wrap md:overflow-visible p-1.5">
                {HISTORY_PERIODS.map((item) => (
                  <Button key={item} variant={period === item ? "primary" : "secondary"} size="compact" className="shrink-0" onClick={() => choosePeriod(item)}>
                    {item}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-(--ink-soft)">Interval</p>
              <div className="glass-pill-nav touch-scroll-row md:flex-wrap md:overflow-visible p-1.5">
                {HISTORY_INTERVALS_BY_PERIOD[period].map((item) => (
                  <Button key={item} variant={interval === item ? "primary" : "ghost"} size="compact" className="shrink-0" onClick={() => chooseInterval(item)}>
                    {item}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="panel" material="glass" className="relative z-10 px-4 py-4 sm:px-5 sm:py-5">
        {compareQuery.data?.series.length ? (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-(--ink-strong)">Performance</h2>
            </div>
            <div className="rounded-lg border border-(--line) bg-(--surface-muted) px-3 py-3">
              <TimeSeriesChart
                mode="line"
                height={340}
                series={compareQuery.data.series.map((series, index) => ({
                  key: series.symbol,
                  label: series.symbol,
                  color: getCompareSeriesColor(index),
                  points: series.bars.map((bar) => ({
                    timestamp: bar.timestamp,
                    value: bar.close,
                  })),
                }))}
              />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {compareQuery.data.series.map((series, index) => (
                <div key={series.symbol} className="glass-subcard rounded-lg px-3 py-3">
                  <p
                    className="text-[11px] font-medium uppercase tracking-wider"
                    style={{ color: getCompareSeriesColor(index) }}
                  >
                    {series.symbol}
                  </p>
                  <p
                    className="mt-0.5 text-xs font-medium"
                    style={{ color: getCompareSeriesColor(index) }}
                  >
                    {series.displayName}
                  </p>
                  <p className="mt-1.5 text-base font-semibold text-(--ink-strong)">{formatCurrency(series.currentPrice)}</p>
                  <p className={series.changePercent !== null && series.changePercent >= 0 ? "text-sm font-medium text-(--positive)" : "text-sm font-medium text-(--negative)"}>
                    {formatSignedPercent(series.changePercent, 1)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <DataLimitations items={compareQuery.data.dataLimitations} />
            </div>
          </>
        ) : compareQuery.isPending ? (
          <div className="h-[420px] animate-pulse rounded-lg bg-(--surface-muted)" />
        ) : compareQuery.error instanceof Error ? (
          <p className="text-sm text-(--negative)">{compareQuery.error.message}</p>
        ) : (
          <p className="text-sm text-(--ink-muted)">Comparison data will appear once the API is available and two or more valid symbols are selected.</p>
        )}
      </Card>
    </div>
  );
}

function arraysEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}
