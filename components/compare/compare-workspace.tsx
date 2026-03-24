"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useDeferredValue, useState } from "react";

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
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());

  const searchQuery = useQuery({
    queryKey: ["compare-search", deferredQuery],
    queryFn: () => stockYardClient.searchTickers(deferredQuery),
    enabled: deferredQuery.length > 0,
    staleTime: 60_000,
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
      return;
    }

    const nextSymbols = [...symbols, symbol];
    setSymbols(nextSymbols);
    setQuery("");
    syncUrl(nextSymbols, period, interval);
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
    <div className="space-y-4">
      <Card variant="band" className="px-5 py-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-(--ink-strong)">Compare</h1>
              <p className="mt-1 text-sm text-(--ink-muted)">
                Side-by-side performance for 2–5 symbols.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {symbols.map((symbol) => (
                <div key={symbol} className="inline-flex items-center gap-1.5 rounded-lg border border-(--line-strong) bg-(--surface-float) px-3 py-1.5 text-sm font-medium text-(--ink)">
                  {symbol}
                  <button type="button" onClick={() => removeSymbol(symbol)} className="rounded p-0.5 text-(--ink-soft) hover:text-(--ink)">
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="relative">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Add a symbol…"
                className="w-full rounded-lg border border-(--line-strong) bg-(--surface) px-4 py-2.5 text-sm text-(--ink) outline-none placeholder:text-(--ink-soft)"
              />
              {deferredQuery ? (
                <div className="absolute inset-x-0 top-[calc(100%+6px)] z-20 rounded-lg border border-(--line) bg-[rgba(15,18,25,0.96)] p-2 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                  {searchQuery.isPending ? (
                    <p className="px-3 py-2 text-sm text-(--ink-muted)">Searching…</p>
                  ) : searchQuery.data?.results.length ? (
                    searchQuery.data.results.slice(0, 5).map((item) => (
                      <button
                        key={item.symbol}
                        type="button"
                        onMouseEnter={() => router.prefetch(tickerRoute(item.symbol))}
                        onClick={() => addSymbol(item.symbol)}
                        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors hover:bg-(--surface-strong)"
                      >
                        <div>
                          <p className="font-medium text-(--ink-strong)">{item.symbol}</p>
                          <p className="text-xs text-(--ink-muted)">{item.name}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-(--ink-muted)">No matching symbols.</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
          <div className="space-y-3 rounded-xl border border-(--line) bg-(--surface-float) px-4 py-4">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-(--ink-soft)">Period</p>
              <div className="flex flex-wrap gap-1.5">
                {HISTORY_PERIODS.map((item) => (
                  <Button key={item} variant={period === item ? "primary" : "secondary"} size="compact" onClick={() => choosePeriod(item)}>
                    {item}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-(--ink-soft)">Interval</p>
              <div className="flex flex-wrap gap-1.5">
                {HISTORY_INTERVALS_BY_PERIOD[period].map((item) => (
                  <Button key={item} variant={interval === item ? "primary" : "ghost"} size="compact" onClick={() => chooseInterval(item)}>
                    {item}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="panel" className="px-5 py-5">
        {compareQuery.data?.series.length ? (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-(--ink-strong)">Performance</h2>
            </div>
            <div className="rounded-lg border border-(--line) bg-(--surface-muted) px-3 py-3">
            <TimeSeriesChart
              mode="line"
              height={420}
              series={compareQuery.data.series.map((series, index) => ({
                key: series.symbol,
                label: series.symbol,
                color: index === 0 ? "var(--chart-1)" : index === 1 ? "var(--chart-2)" : index === 2 ? "var(--chart-3)" : index === 3 ? "var(--chart-4)" : "var(--chart-5)",
                points: series.bars.map((bar) => ({
                  timestamp: bar.timestamp,
                  value: bar.close,
                })),
              }))}
            />
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {compareQuery.data.series.map((series) => (
                <div key={series.symbol} className="rounded-lg border border-(--line) bg-(--surface-muted) px-3 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-(--ink-soft)">{series.symbol}</p>
                  <p className="mt-0.5 text-xs text-(--ink-muted)">{series.displayName}</p>
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
