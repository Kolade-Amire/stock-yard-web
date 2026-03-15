"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState } from "react";

import { MicroBarChart } from "@/components/charts/micro-bar-chart";
import { Card } from "@/components/ui/card";
import { DataLimitations } from "@/components/ui/data-limitations";
import { stockYardClient } from "@/lib/stock-yard/client";
import { formatCurrency, formatDate, formatDateTime, formatNumber, formatPercent, formatSignedPercent } from "@/lib/stock-yard/format";
import { isStockYardApiError } from "@/lib/stock-yard/fetch";

type ResearchSectionsProps = {
  symbol: string;
  nextEarningsDate: string | null;
};

const OPTION_TABS = [
  { key: "calls", label: "Calls" },
  { key: "puts", label: "Puts" },
] as const;

const OWNERSHIP_TABS = [
  { key: "institutional", label: "Institutional" },
  { key: "mutual_funds", label: "Mutual funds" },
  { key: "insider_roster", label: "Insider roster" },
] as const;

export function ResearchSections({ symbol, nextEarningsDate }: ResearchSectionsProps) {
  const financialSummary = useQuery({
    queryKey: ["financial-summary", symbol],
    queryFn: () => stockYardClient.getFinancialSummary(symbol),
  });
  const financialTrends = useQuery({
    queryKey: ["financial-trends", symbol],
    queryFn: () => stockYardClient.getFinancialTrends(symbol),
  });
  const earningsHistory = useQuery({
    queryKey: ["earnings-history", symbol],
    queryFn: () => stockYardClient.getEarningsHistory(symbol),
  });
  const earningsEstimates = useQuery({
    queryKey: ["earnings-estimates", symbol],
    queryFn: () => stockYardClient.getEarningsEstimates(symbol),
  });
  const analystSummary = useQuery({
    queryKey: ["analyst-summary", symbol],
    queryFn: () => stockYardClient.getAnalystSummary(symbol),
  });
  const analystHistory = useQuery({
    queryKey: ["analyst-history", symbol],
    queryFn: () => stockYardClient.getAnalystHistory(symbol),
  });
  const ownership = useQuery({
    queryKey: ["ownership", symbol],
    queryFn: () => stockYardClient.getOwnership(symbol, "all", 5, 0),
  });
  const expirations = useQuery({
    queryKey: ["option-expirations", symbol],
    queryFn: () => stockYardClient.getOptionExpirations(symbol),
  });
  const [selectedExpiration, setSelectedExpiration] = useState<string | null>(null);

  const expiration = selectedExpiration ?? expirations.data?.expirations[0] ?? null;

  const optionChain = useQuery({
    queryKey: ["option-chain", symbol, expiration],
    queryFn: () => stockYardClient.getOptionChain(symbol, expiration!),
    enabled: Boolean(expiration),
  });

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="px-5 py-5">
          <SectionTitle title="Financials" subtitle="Summary and trends" />
          {financialSummary.data ? (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <MetricCard label="Revenue TTM" value={formatCurrency(financialSummary.data.financialSummary.revenue_ttm)} />
                <MetricCard label="Net income TTM" value={formatCurrency(financialSummary.data.financialSummary.net_income_ttm)} />
                <MetricCard label="Free cash flow" value={formatCurrency(financialSummary.data.financialSummary.free_cash_flow)} />
                <MetricCard label="Gross margin" value={formatPercent(financialSummary.data.financialSummary.gross_margins, 1)} />
                <MetricCard label="Operating margin" value={formatPercent(financialSummary.data.financialSummary.operating_margins, 1)} />
                <MetricCard label="Debt / equity" value={formatNumber(financialSummary.data.financialSummary.debt_to_equity, 1)} />
              </div>
              <div className="mt-4">
                <DataLimitations items={financialSummary.data.dataLimitations} />
              </div>
            </>
          ) : (
            <SectionFallback query={financialSummary} emptyMessage="Financial statements are not materially available for this symbol." />
          )}
        </Card>
        <Card className="px-5 py-5">
          <SectionTitle title="Financial trend" subtitle="Annual revenue pulse" />
          {financialTrends.data?.annual.length ? (
            <>
              <MicroBarChart
                items={financialTrends.data.annual.slice(-6).map((point) => ({
                  label: point.periodEnd.slice(2, 4),
                  value: point.revenue,
                }))}
              />
              <div className="mt-4">
                <DataLimitations items={financialTrends.data.dataLimitations} />
              </div>
            </>
          ) : (
            <SectionFallback query={financialTrends} emptyMessage="Trend data is limited or unavailable for this symbol." />
          )}
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="px-5 py-5">
          <SectionTitle title="Earnings" subtitle="History plus estimates" />
          <div className="mb-4 rounded-[22px] bg-(--surface-strong) px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-(--ink-soft)">Next known date</p>
            <p className="mt-2 text-lg font-semibold text-(--ink)">{formatDate(nextEarningsDate)}</p>
          </div>
          {earningsHistory.data?.events.length ? (
            <div className="space-y-3">
              {earningsHistory.data.events.slice(-4).reverse().map((event) => (
                <div key={event.reportDate} className="flex items-center justify-between gap-4 rounded-[20px] border border-(--line) px-4 py-3">
                  <div>
                    <p className="font-medium text-(--ink)">{event.quarter}</p>
                    <p className="text-sm text-(--ink-muted)">{formatDate(event.reportDate)}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-(--ink)">Actual: {event.epsActual ?? "—"}</p>
                    <p className="text-(--ink-muted)">Est: {event.epsEstimate ?? "—"}</p>
                    <p className={event.surprisePercent !== null && event.surprisePercent >= 0 ? "text-(--positive)" : "text-(--negative)"}>
                      {formatSignedPercent(event.surprisePercent, 1)}
                    </p>
                  </div>
                </div>
              ))}
              <DataLimitations items={[...(earningsHistory.data.dataLimitations ?? []), ...(earningsEstimates.data?.dataLimitations ?? [])]} />
            </div>
          ) : (
            <SectionFallback query={earningsHistory} emptyMessage="Earnings data is limited or unavailable for this symbol." />
          )}
        </Card>
        <Card className="px-5 py-5">
          <SectionTitle title="Analyst view" subtitle="Targets and actions" />
          {analystSummary.data ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <MetricCard label="Target mean" value={formatCurrency(analystSummary.data.analystSummary.targetMean)} />
                <MetricCard label="Recent actions" value={formatNumber(analystSummary.data.analystSummary.recentActionCount)} />
              </div>
              <div className="space-y-3">
                {analystHistory.data?.actions.slice(0, 4).map((action) => (
                  <div key={`${action.gradedAt}-${action.priceTargetAction}`} className="rounded-[20px] border border-(--line) px-4 py-3">
                    <p className="font-medium text-(--ink)">{action.priceTargetAction ?? action.toGrade ?? "Analyst update"}</p>
                    <p className="mt-1 text-sm text-(--ink-muted)">{formatDateTime(action.gradedAt)}</p>
                  </div>
                ))}
              </div>
              <DataLimitations items={[...(analystSummary.data.dataLimitations ?? []), ...(analystHistory.data?.dataLimitations ?? [])]} />
            </div>
          ) : (
            <SectionFallback query={analystSummary} emptyMessage="Analyst coverage is limited for this symbol." />
          )}
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="px-5 py-5">
          <SectionTitle title="Ownership" subtitle="Major holders and section tabs" />
          {ownership.data ? (
            <Tabs.Root defaultValue="institutional" className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                {ownership.data.majorHolders.slice(0, 4).map((holder) => (
                  <MetricCard key={holder.key} label={holder.label} value={formatPercent(holder.value, 2)} />
                ))}
              </div>
              <Tabs.List className="flex flex-wrap gap-2">
                {OWNERSHIP_TABS.map((tab) => (
                  <Tabs.Trigger
                    key={tab.key}
                    value={tab.key}
                    className="rounded-full border border-(--line) px-3 py-1.5 text-sm text-(--ink-muted) data-[state=active]:border-(--ink) data-[state=active]:bg-(--ink) data-[state=active]:text-(--surface)"
                  >
                    {tab.label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
              <Tabs.Content value="institutional" className="space-y-3">
                {ownership.data.institutionalHolders.map((holder) => (
                  <HolderRow key={`${holder.holder}-${holder.dateReported}`} label={holder.holder} meta={formatDate(holder.dateReported)} value={formatPercent(holder.pctHeld, 2)} />
                ))}
              </Tabs.Content>
              <Tabs.Content value="mutual_funds" className="space-y-3">
                {ownership.data.mutualFundHolders.map((holder) => (
                  <HolderRow key={`${holder.holder}-${holder.dateReported}`} label={holder.holder} meta={formatDate(holder.dateReported)} value={formatPercent(holder.pctHeld, 2)} />
                ))}
              </Tabs.Content>
              <Tabs.Content value="insider_roster" className="space-y-3">
                {ownership.data.insiderRoster.map((holder, index) => (
                  <HolderRow key={`${holder.name}-${index}`} label={holder.name} meta={holder.relation ?? "Insider"} value={formatNumber(holder.sharesOwnedDirectly)} />
                ))}
              </Tabs.Content>
              <DataLimitations items={ownership.data.dataLimitations} />
            </Tabs.Root>
          ) : (
            <SectionFallback query={ownership} emptyMessage="Ownership data is limited or unavailable for this symbol." />
          )}
        </Card>
        <Card className="px-5 py-5">
          <SectionTitle title="Options" subtitle="Nearest chain with virtual rows" />
          {expirations.data?.expirations.length ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {expirations.data.expirations.slice(0, 6).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSelectedExpiration(item)}
                    className="rounded-full border border-(--line) px-3 py-1.5 text-sm text-(--ink-muted) transition-colors hover:border-(--accent) data-[active=true]:border-(--ink) data-[active=true]:bg-(--ink) data-[active=true]:text-(--surface)"
                    data-active={item === expiration}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <Tabs.Root defaultValue="calls" className="space-y-4">
                <Tabs.List className="flex gap-2">
                  {OPTION_TABS.map((tab) => (
                    <Tabs.Trigger
                      key={tab.key}
                      value={tab.key}
                      className="rounded-full border border-(--line) px-3 py-1.5 text-sm text-(--ink-muted) data-[state=active]:border-(--ink) data-[state=active]:bg-(--ink) data-[state=active]:text-(--surface)"
                    >
                      {tab.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
                <Tabs.Content value="calls">
                  <VirtualOptionsTable rows={optionChain.data?.calls ?? []} />
                </Tabs.Content>
                <Tabs.Content value="puts">
                  <VirtualOptionsTable rows={optionChain.data?.puts ?? []} />
                </Tabs.Content>
              </Tabs.Root>
              <DataLimitations items={[...(expirations.data?.expirations.length ? [] : []), ...(optionChain.data?.dataLimitations ?? [])]} />
            </div>
          ) : (
            <SectionFallback query={expirations} emptyMessage="Options data is limited or unavailable for this symbol." />
          )}
        </Card>
      </section>
    </div>
  );
}

type SectionTitleProps = {
  title: string;
  subtitle: string;
};

function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-4">
      <h2 className="font-(family-name:--font-display) text-3xl text-(--ink)">{title}</h2>
      <p className="mt-1 text-sm text-(--ink-muted)">{subtitle}</p>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-[22px] border border-(--line) bg-(--surface-strong) px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-(--ink-soft)">{label}</p>
      <p className="mt-2 text-sm font-medium text-(--ink)">{value}</p>
    </div>
  );
}

type HolderRowProps = {
  label: string;
  meta: string;
  value: string;
};

function HolderRow({ label, meta, value }: HolderRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[20px] border border-(--line) px-4 py-3">
      <div>
        <p className="font-medium text-(--ink)">{label}</p>
        <p className="text-sm text-(--ink-muted)">{meta}</p>
      </div>
      <p className="text-sm text-(--ink)">{value}</p>
    </div>
  );
}

type SectionFallbackProps = {
  query: { error: unknown; isPending: boolean };
  emptyMessage: string;
};

function SectionFallback({ query, emptyMessage }: SectionFallbackProps) {
  if (query.isPending) {
    return <p className="text-sm text-(--ink-muted)">Loading section…</p>;
  }

  if (isStockYardApiError(query.error) && query.error.code === "DATA_UNAVAILABLE") {
    return <p className="text-sm text-(--ink-muted)">{emptyMessage}</p>;
  }

  if (query.error instanceof Error) {
    return <p className="text-sm text-(--negative)">{query.error.message}</p>;
  }

  return <p className="text-sm text-(--ink-muted)">{emptyMessage}</p>;
}

type VirtualOptionsTableProps = {
  rows: Array<{
    contractSymbol: string;
    strike: number | null;
    lastPrice: number | null;
    bid: number | null;
    ask: number | null;
    impliedVolatility: number | null;
    volume: number | null;
  }>;
};

function VirtualOptionsTable({ rows }: VirtualOptionsTableProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 8,
  });

  return (
    <div>
      <div className="grid grid-cols-6 gap-2 border-b border-(--line) pb-3 text-xs uppercase tracking-[0.18em] text-(--ink-soft)">
        <span>Strike</span>
        <span>Last</span>
        <span>Bid</span>
        <span>Ask</span>
        <span>IV</span>
        <span>Volume</span>
      </div>
      <div ref={parentRef} className="mt-2 h-[280px] overflow-auto">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((item) => {
            const row = rows[item.index];

            return (
              <div
                key={row.contractSymbol}
                className="absolute inset-x-0 grid grid-cols-6 gap-2 rounded-2xl border border-(--line) bg-(--surface-strong) px-3 py-3 text-sm text-(--ink)"
                style={{ transform: `translateY(${item.start}px)` }}
              >
                <span>{row.strike ?? "—"}</span>
                <span>{row.lastPrice ?? "—"}</span>
                <span>{row.bid ?? "—"}</span>
                <span>{row.ask ?? "—"}</span>
                <span>{formatPercent(row.impliedVolatility, 1)}</span>
                <span>{formatNumber(row.volume)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
