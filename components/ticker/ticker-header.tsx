import { ArrowUpRight, Building2, Globe2, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { DataLimitations } from "@/components/ui/data-limitations";
import { formatCurrency, formatNumber, formatPercent, formatRange } from "@/lib/stock-yard/format";
import type { TickerOverviewResponse } from "@/lib/stock-yard/schemas";

type TickerHeaderProps = {
  data: TickerOverviewResponse;
};

export function TickerHeader({ data }: TickerHeaderProps) {
  const overview = data.overview;

  return (
    <Card className="px-5 py-6 md:px-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="rounded-full border border-(--line-strong) bg-(--surface-strong) px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-(--ink-soft)">
              {overview.quote_type}
            </p>
            {overview.is_etf ? (
              <p className="rounded-full bg-[color:rgba(47,107,87,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-(--positive)">
                ETF-aware
              </p>
            ) : null}
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <h1 className="font-(family-name:--font-display) text-5xl leading-none text-(--ink) md:text-6xl">
                  {data.symbol}
                </h1>
                <p className="mt-2 max-w-3xl text-base text-(--ink-muted)">{overview.display_name}</p>
              </div>
              <div className="rounded-[24px] border border-(--line) bg-(--surface-strong) px-4 py-3">
                <p className="text-xs uppercase tracking-[0.24em] text-(--ink-soft)">Spot</p>
                <p className="mt-1 text-2xl font-semibold text-(--ink)">{formatCurrency(overview.current_price, overview.currency ?? "USD")}</p>
              </div>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-(--ink-muted)">{overview.summary ?? "Summary unavailable from the data provider."}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <InfoChip icon={<TrendingUp className="size-4" />} label="Day range" value={formatRange(overview.day_low, overview.day_high, overview.currency ?? "USD")} />
            <InfoChip icon={<TrendingUp className="size-4" />} label="52W range" value={formatRange(overview.fifty_two_week_low, overview.fifty_two_week_high, overview.currency ?? "USD")} />
            <InfoChip icon={<Building2 className="size-4" />} label="Market cap" value={formatCurrency(overview.market_cap, overview.currency ?? "USD")} />
            <InfoChip icon={<TrendingUp className="size-4" />} label="Dividend yield" value={formatPercent(overview.dividend_yield, 2)} />
          </div>
        </div>
        <div className="space-y-4">
          <Card className="px-4 py-4">
            <div className="grid gap-3 text-sm text-(--ink-muted)">
              <MetaRow label="Exchange" value={overview.exchange ?? "Unavailable"} />
              <MetaRow label="Sector" value={overview.sector ?? "Unavailable"} />
              <MetaRow label="Industry" value={overview.industry ?? "Unavailable"} />
              <MetaRow label="Trailing PE" value={formatNumber(overview.trailing_pe, 2)} />
              <MetaRow label="Forward PE" value={formatNumber(overview.forward_pe, 2)} />
              <MetaRow label="Volume" value={formatNumber(overview.volume)} />
            </div>
          </Card>
          {overview.website ? (
            <a
              href={overview.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-[24px] border border-(--line) bg-(--surface-strong) px-4 py-4 text-sm text-(--ink) transition-colors hover:border-(--accent)"
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
  icon: React.ReactNode;
  label: string;
  value: string;
};

function InfoChip({ icon, label, value }: InfoChipProps) {
  return (
    <div className="rounded-[24px] border border-(--line) bg-(--surface-strong) px-4 py-4">
      <div className="mb-2 flex items-center gap-2 text-(--ink-soft)">{icon}</div>
      <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">{label}</p>
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
