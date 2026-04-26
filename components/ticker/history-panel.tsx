"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTickerHistoryChartDirection, getTickerHistoryChartTokens } from "@/components/ticker/history-chart-colors";
import { HISTORY_INTERVALS_BY_PERIOD, HISTORY_PERIODS } from "@/lib/stock-yard/constants";
import { stockYardClient } from "@/lib/stock-yard/client";
import { formatCurrency, formatNumber } from "@/lib/stock-yard/format";
import type { HistoryResponse } from "@/lib/stock-yard/schemas";

const TimeSeriesChart = dynamic(
  () => import("@/components/charts/time-series-chart").then((module) => module.TimeSeriesChart),
  {
    ssr: false,
    loading: () => <div className="h-[320px] animate-pulse rounded-lg bg-(--surface-strong)" />,
  },
);

const GLASS_SEGMENTED_BUTTON_CLASS =
  "border-transparent bg-transparent text-(--ink-muted) shadow-none hover:border-transparent hover:bg-(--glass-active-wash) hover:text-(--ink)";

type HistoryPanelProps = {
  symbol: string;
  currency: string;
  initialData: HistoryResponse | null;
};

export function HistoryPanel({ symbol, currency, initialData }: HistoryPanelProps) {
  const [period, setPeriod] = useState<(typeof HISTORY_PERIODS)[number]>((initialData?.period as (typeof HISTORY_PERIODS)[number]) ?? "6mo");
  const [interval, setInterval] = useState<(typeof HISTORY_INTERVALS_BY_PERIOD)[(typeof HISTORY_PERIODS)[number]][number]>(
    (initialData?.interval as (typeof HISTORY_INTERVALS_BY_PERIOD)[(typeof HISTORY_PERIODS)[number]][number]) ?? "1d",
  );
  const activeInterval = HISTORY_INTERVALS_BY_PERIOD[period].includes(interval)
    ? interval
    : HISTORY_INTERVALS_BY_PERIOD[period][0];

  const historyQuery = useQuery({
    queryKey: ["ticker-history", symbol, period, activeInterval],
    queryFn: () => stockYardClient.getTickerHistory(symbol, period, activeInterval),
    initialData: initialData && initialData.period === period && initialData.interval === activeInterval ? initialData : undefined,
  });

  const bars = historyQuery.data?.bars ?? [];
  const latestBar = bars[bars.length - 1] ?? null;
  const chartDirection = getTickerHistoryChartDirection(bars);
  const chartTokens = getTickerHistoryChartTokens(chartDirection);

  return (
    <Card variant="band" className="px-5 py-5">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-(--ink-soft)">Price action</p>
          <div className="flex flex-wrap items-end gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-(--ink-strong)">History</h2>
            <p className="text-sm text-(--ink-muted)">{formatCurrency(latestBar?.close ?? null, currency)} latest close</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="glass-pill-nav touch-scroll-row p-1.5 md:flex-wrap md:overflow-visible">
            {HISTORY_PERIODS.map((item) => (
              <Button
                key={item}
                variant={item === period ? "primary" : "secondary"}
                size="compact"
                className={item === period ? "shrink-0 shadow-none" : `shrink-0 ${GLASS_SEGMENTED_BUTTON_CLASS}`}
                onClick={() => {
                  const nextInterval = HISTORY_INTERVALS_BY_PERIOD[item].includes(activeInterval)
                    ? activeInterval
                    : HISTORY_INTERVALS_BY_PERIOD[item][0];

                  setPeriod(item);
                  setInterval(nextInterval);
                }}
              >
                {item}
              </Button>
            ))}
          </div>
          <div className="glass-pill-nav touch-scroll-row p-1.5 md:flex-wrap md:overflow-visible">
            {HISTORY_INTERVALS_BY_PERIOD[period].map((item) => (
              <Button
                key={item}
                variant={item === activeInterval ? "primary" : "ghost"}
                size="compact"
                className={item === activeInterval ? "shrink-0 shadow-none" : `shrink-0 ${GLASS_SEGMENTED_BUTTON_CLASS}`}
                onClick={() => setInterval(item)}
              >
                {item}
              </Button>
            ))}
          </div>
        </div>
      </div>
      {bars.length ? (
        <>
          <div className="rounded-[1.35rem] border border-(--line) bg-[linear-gradient(180deg,rgba(255,255,255,0.2),transparent_100%)] px-3 py-3">
            <TimeSeriesChart
              height={320}
              series={[
                {
                  key: symbol,
                  label: symbol,
                  color: chartTokens.line,
                  fill: chartTokens.fill,
                  points: bars.map((bar) => ({
                    timestamp: bar.timestamp,
                    value: bar.close,
                  })),
                },
              ]}
            />
          </div>
          <div className="mt-4 grid gap-px overflow-hidden rounded-[1.1rem] border border-(--line) bg-(--line) sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Last close" value={formatCurrency(latestBar?.close ?? null, currency)} />
            <Stat label="Open" value={formatCurrency(latestBar?.open ?? null, currency)} />
            <Stat label="Volume" value={formatNumber(latestBar?.volume ?? null)} />
            <Stat label="Bars" value={formatNumber(bars.length)} />
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-(--line-strong) px-4 py-10 text-center text-sm text-(--ink-muted)">
          Chart data is unavailable for the selected controls.
        </div>
      )}
      {historyQuery.error instanceof Error ? (
        <p className="mt-4 text-sm text-(--negative)">{historyQuery.error.message}</p>
      ) : null}
    </Card>
  );
}

type StatProps = {
  label: string;
  value: string;
};

function Stat({ label, value }: StatProps) {
  return (
    <div className="bg-(--surface) px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-(--ink-soft)">{label}</p>
      <p className="mt-1 text-sm font-medium text-(--ink)">{value}</p>
    </div>
  );
}
