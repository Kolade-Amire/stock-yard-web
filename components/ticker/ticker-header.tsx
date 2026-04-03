import { ArrowUpRight, Globe2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { DataLimitations } from "@/components/ui/data-limitations";
import { TickerLogo } from "@/components/ui/ticker-logo";
import { formatCurrency, formatNumber, formatPercent, formatRange } from "@/lib/stock-yard/format";
import type { TickerOverviewResponse } from "@/lib/stock-yard/schemas";

type TickerHeaderProps = {
  data: TickerOverviewResponse;
};

export function TickerHeader({ data }: TickerHeaderProps) {
  const overview = data.overview;
  const identityTags = [
    overview.quote_type,
    overview.exchange,
    overview.currency,
    overview.sector,
    overview.industry,
  ].filter(Boolean);

  const priceChange = overview.current_price !== null && overview.previous_close !== null
    ? overview.current_price - overview.previous_close
    : null;
  const priceChangePercent = priceChange !== null && overview.previous_close !== null && overview.previous_close !== 0
    ? (priceChange / overview.previous_close) * 100
    : null;
  const isPositive = priceChange !== null && priceChange >= 0;

  return (
    <Card variant="band" material="glass" className="px-5 py-5 md:px-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_340px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {identityTags.map((tag) => (
              <span
                key={tag}
                className="glass-micro-pill rounded-md px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-(--ink-soft)"
              >
                {tag}
              </span>
            ))}
            {overview.is_etf ? (
              <span className="rounded-md border border-(--positive-soft) bg-(--positive-soft) px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-(--positive)">
                ETF
              </span>
            ) : null}
          </div>
          <div className="space-y-1">
            <div className="flex items-start gap-4 md:gap-5">
              <TickerLogo
                symbol={data.symbol}
                variant="ticker"
                className="mt-1"
              />
              <div className="min-w-0 pt-0.5">
                <h1 className="text-3xl font-bold tracking-tight text-(--ink-strong) md:text-4xl">{data.symbol}</h1>
                <p className="mt-1 text-sm text-(--ink-muted)">{overview.display_name}</p>
              </div>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-(--ink-muted)">{overview.summary ?? "Summary unavailable from the data provider."}</p>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <InfoChip label="Day range" value={formatRange(overview.day_low, overview.day_high, overview.currency ?? "USD")} />
            <InfoChip label="52W range" value={formatRange(overview.fifty_two_week_low, overview.fifty_two_week_high, overview.currency ?? "USD")} />
            <InfoChip label="Market cap" value={formatCurrency(overview.market_cap, overview.currency ?? "USD")} />
            <InfoChip label="Dividend yield" value={formatPercent(overview.dividend_yield, 2)} />
          </div>
        </div>
        <div className="space-y-3">
          <div className="glass-subcard rounded-xl px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-(--ink-soft)">Current price</p>
            <p className="mt-2 text-3xl font-bold text-(--ink-strong)">{formatCurrency(overview.current_price, overview.currency ?? "USD")}</p>
            {priceChange !== null ? (
              <p className={`mt-1 text-sm font-medium ${isPositive ? "text-(--positive)" : "text-(--negative)"}`}>
                {isPositive ? "+" : ""}{priceChange.toFixed(2)} ({priceChangePercent !== null ? `${isPositive ? "+" : ""}${priceChangePercent.toFixed(2)}%` : ""})
              </p>
            ) : null}
            <div className="mt-4 grid gap-2 text-sm text-(--ink-muted)">
              <MetaRow label="Previous close" value={formatCurrency(overview.previous_close, overview.currency ?? "USD")} />
              <MetaRow label="Open" value={formatCurrency(overview.open_price, overview.currency ?? "USD")} />
              <MetaRow label="Volume" value={formatNumber(overview.volume)} />
              <MetaRow label="Avg volume" value={formatNumber(overview.average_volume)} />
              <MetaRow label="Trailing PE" value={formatNumber(overview.trailing_pe, 2)} />
              <MetaRow label="Forward PE" value={formatNumber(overview.forward_pe, 2)} />
              <MetaRow label="Analyst target" value={formatCurrency(overview.analyst_target_mean, overview.currency ?? "USD")} />
            </div>
          </div>
          {overview.website ? (
            <a
              href={overview.website}
              target="_blank"
              rel="noreferrer"
              className="glass-control flex items-center justify-between rounded-xl px-4 py-3 text-sm text-(--ink) transition-colors hover:border-(--accent)"
            >
              <div className="flex items-center gap-3">
                <Globe2 className="size-4 text-(--accent)" />
                Company website
              </div>
              <ArrowUpRight className="size-4" />
            </a>
          ) : null}
          <DataLimitations items={data.dataLimitations} />
        </div>
      </div>
    </Card>
  );
}

type InfoChipProps = {
  label: string;
  value: string;
};

function InfoChip({ label, value }: InfoChipProps) {
  return (
    <div className="glass-subcard rounded-lg px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-(--ink-soft)">{label}</p>
      <p className="mt-1.5 text-sm font-medium text-(--ink)">{value}</p>
    </div>
  );
}

type MetaRowProps = {
  label: string;
  value: string;
};

function MetaRow({ label, value }: MetaRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-(--ink-soft)">{label}</span>
      <span className="text-right text-(--ink)">{value}</span>
    </div>
  );
}
