import { ArrowUpRight, Globe2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { DataLimitations } from "@/components/ui/data-limitations";
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

  return (
    <Card variant="band" className="px-5 py-5 md:px-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_340px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {identityTags.map((tag) => (
              <p
                key={tag}
                className="rounded-full border border-(--line-strong) bg-(--surface-float) px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-(--ink-soft)"
              >
                {tag}
              </p>
            ))}
            {overview.is_etf ? (
              <p className="rounded-full border border-[rgba(47,107,87,0.24)] bg-[rgba(47,107,87,0.1)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-(--positive)">
                ETF-aware
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <h1 className="font-(family-name:--font-display) text-5xl leading-none text-(--ink) md:text-6xl">{data.symbol}</h1>
                <p className="mt-2 text-base text-(--ink-muted)">{overview.display_name}</p>
              </div>
            </div>
            <p className="max-w-4xl text-sm leading-6 text-(--ink-muted)">{overview.summary ?? "Summary unavailable from the data provider."}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <InfoChip label="Day range" value={formatRange(overview.day_low, overview.day_high, overview.currency ?? "USD")} />
            <InfoChip label="52W range" value={formatRange(overview.fifty_two_week_low, overview.fifty_two_week_high, overview.currency ?? "USD")} />
            <InfoChip label="Market cap" value={formatCurrency(overview.market_cap, overview.currency ?? "USD")} />
            <InfoChip label="Dividend yield" value={formatPercent(overview.dividend_yield, 2)} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[26px] border border-(--line) bg-(--surface-float) px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-(--ink-soft)">Spot</p>
            <p className="mt-2 text-3xl font-semibold text-(--ink)">{formatCurrency(overview.current_price, overview.currency ?? "USD")}</p>
            <div className="mt-4 grid gap-3 text-sm text-(--ink-muted)">
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
              className="flex items-center justify-between rounded-[24px] border border-(--line) bg-(--surface-float) px-4 py-4 text-sm text-(--ink) transition-colors hover:border-(--accent)"
            >
              <div className="flex items-center gap-3">
                <Globe2 className="size-4 text-(--accent)" />
                Visit company website
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
    <div className="rounded-[24px] border border-(--line) bg-(--surface-float) px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-(--ink-soft)">{label}</p>
      <p className="mt-2 text-sm font-medium text-(--ink)">{value}</p>
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
