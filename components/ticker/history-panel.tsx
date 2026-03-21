"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HISTORY_INTERVALS_BY_PERIOD, HISTORY_PERIODS } from "@/lib/stock-yard/constants";
import { stockYardClient } from "@/lib/stock-yard/client";
import { formatCurrency, formatNumber } from "@/lib/stock-yard/format";
import type { HistoryResponse } from "@/lib/stock-yard/schemas";

const TimeSeriesChart = dynamic(
  () => import("@/components/charts/time-series-chart").then((module) => module.TimeSeriesChart),
  {
    ssr: false,
    loading: () => <div className="h-[320px] animate-pulse rounded-[24px] bg-(--surface-strong)" />,
  },
);

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

  return (
    <Card variant="panel" className="px-5 py-5">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-(--ink-soft)">Price context</p>
          <div className="flex flex-wrap items-end gap-4">
            <h2 className="font-(family-name:--font-display) text-[2.4rem] leading-none text-(--ink)">Chart deck</h2>
            <p className="text-sm text-(--ink-muted)">{formatCurrency(latestBar?.close ?? null, currency)} latest close</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {HISTORY_PERIODS.map((item) => (
              <Button
                key={item}
                variant={item === period ? "primary" : "secondary"}
                size="compact"
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
          <div className="flex flex-wrap gap-2">
            {HISTORY_INTERVALS_BY_PERIOD[period].map((item) => (
              <Button key={item} variant={item === activeInterval ? "primary" : "ghost"} size="compact" onClick={() => setInterval(item)}>
                {item}
              </Button>
            ))}
          </div>
        </div>
      </div>
      {bars.length ? (
        <>
          <div className="rounded-[28px] border border-(--line) bg-(--surface-muted) px-3 py-4">
            <TimeSeriesChart
              height={360}
              series={[
                {
                  key: symbol,
                  label: symbol,
                  color: "var(--chart-1)",
                  fill: "rgba(47, 107, 87, 0.18)",
                  points: bars.map((bar) => ({
                    timestamp: bar.timestamp,
                    value: bar.close,
                  })),
                },
              ]}
            />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <Stat label="Last close" value={formatCurrency(latestBar?.close ?? null, currency)} />
            <Stat label="Open" value={formatCurrency(latestBar?.open ?? null, currency)} />
            <Stat label="Volume" value={formatNumber(latestBar?.volume ?? null)} />
            <Stat label="Bars" value={formatNumber(bars.length)} />
          </div>
        </>
      ) : (
        <div className="rounded-[24px] border border-dashed border-(--line-strong) px-4 py-10 text-center text-sm text-(--ink-muted)">
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
    <div className="rounded-[20px] border border-(--line) bg-(--surface-muted) px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-(--ink-soft)">{label}</p>
      <p className="mt-2 text-sm font-medium text-(--ink)">{value}</p>
    </div>
  );
}
