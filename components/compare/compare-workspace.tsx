"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useDeferredValue, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { stockYardClient } from "@/lib/stock-yard/client";
import { HISTORY_INTERVALS_BY_PERIOD, HISTORY_PERIODS } from "@/lib/stock-yard/constants";
import { formatCurrency, formatSignedPercent } from "@/lib/stock-yard/format";
import { compareRouteWithQuery, tickerRoute } from "@/lib/routes";
import type { CompareResponse } from "@/lib/stock-yard/schemas";

const TimeSeriesChart = dynamic(
  () => import("@/components/charts/time-series-chart").then((module) => module.TimeSeriesChart),
  {
    ssr: false,
    loading: () => <div className="h-[380px] animate-pulse rounded-[24px] bg-(--surface-strong)" />,
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
    <div className="space-y-6">
      <Card className="px-5 py-5">
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-(--ink-soft)">Compare</p>
              <h1 className="mt-2 font-(family-name:--font-display) text-5xl text-(--ink)">Relative performance</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {symbols.map((symbol) => (
                <div key={symbol} className="inline-flex items-center gap-2 rounded-full border border-(--line-strong) bg-(--surface-strong) px-3 py-2 text-sm font-medium text-(--ink)">
                  {symbol}
                  <button type="button" onClick={() => removeSymbol(symbol)} className="rounded-full p-0.5 text-(--ink-soft) hover:text-(--ink)">
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="relative">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Add a symbol"
                className="w-full rounded-[24px] border border-(--line-strong) bg-(--surface-strong) px-4 py-3 text-(--ink) outline-none placeholder:text-(--ink-soft)"
              />
              {deferredQuery ? (
                <div className="absolute inset-x-0 top-[calc(100%+8px)] z-20 rounded-[24px] border border-(--line) bg-(--surface) p-2 shadow-[0_18px_40px_rgba(56,44,18,0.12)]">
                  {searchQuery.data?.results.slice(0, 5).map((item) => (
                    <button
                      key={item.symbol}
                      type="button"
                      onMouseEnter={() => router.prefetch(tickerRoute(item.symbol))}
                      onClick={() => addSymbol(item.symbol)}
                      className="flex w-full items-center justify-between rounded-[18px] px-3 py-3 text-left transition-colors hover:bg-(--surface-strong)"
                    >
                      <div>
                        <p className="font-medium text-(--ink)">{item.symbol}</p>
                        <p className="text-sm text-(--ink-muted)">{item.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {HISTORY_PERIODS.map((item) => (
                <Button key={item} variant={period === item ? "primary" : "secondary"} size="compact" onClick={() => choosePeriod(item)}>
                  {item}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {HISTORY_INTERVALS_BY_PERIOD[period].map((item) => (
                <Button key={item} variant={interval === item ? "primary" : "ghost"} size="compact" onClick={() => chooseInterval(item)}>
                  {item}
                </Button>
              ))}
            </div>
            <p className="text-sm text-(--ink-muted)">
              Keep the basket to 2-5 symbols so the comparison stays readable and quick.
            </p>
          </div>
        </div>
      </Card>

      <Card className="px-5 py-5">
        {compareQuery.data?.series.length ? (
          <>
            <TimeSeriesChart
              mode="line"
              height={380}
              series={compareQuery.data.series.map((series, index) => ({
                key: series.symbol,
                label: series.symbol,
                color: index === 0 ? "var(--chart-1)" : index === 1 ? "var(--chart-2)" : "var(--chart-3)",
                points: series.bars.map((bar) => ({
                  timestamp: bar.timestamp,
                  value: bar.close,
                })),
              }))}
            />
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {compareQuery.data.series.map((series) => (
                <div key={series.symbol} className="rounded-[22px] border border-(--line) bg-(--surface-strong) px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-(--ink-soft)">{series.symbol}</p>
                  <p className="mt-2 text-lg font-semibold text-(--ink)">{formatCurrency(series.currentPrice)}</p>
                  <p className={series.changePercent !== null && series.changePercent >= 0 ? "text-sm text-(--positive)" : "text-sm text-(--negative)"}>
                    {formatSignedPercent(series.changePercent, 1)}
                  </p>
                </div>
              ))}
            </div>
          </>
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
