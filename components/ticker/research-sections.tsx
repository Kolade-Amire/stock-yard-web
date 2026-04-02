"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState } from "react";

import { MicroBarChart, type BarDatum } from "@/components/charts/micro-bar-chart";
import { Card } from "@/components/ui/card";
import { DataLimitations } from "@/components/ui/data-limitations";
import { stockYardClient } from "@/lib/stock-yard/client";
import { formatCurrency, formatDate, formatDateTime, formatNumber, formatPercent, formatSignedPercent } from "@/lib/stock-yard/format";
import { isStockYardApiError } from "@/lib/stock-yard/fetch";

type ResearchSectionsProps = {
  symbol: string;
  nextEarningsDate: string | null;
};

const RESEARCH_TABS = [
  { key: "financials", label: "Financials" },
  { key: "earnings", label: "Earnings" },
  { key: "analyst", label: "Analyst" },
  { key: "ownership", label: "Ownership" },
  { key: "options", label: "Options" },
] as const;

const OPTION_TABS = [
  { key: "calls", label: "Calls" },
  { key: "puts", label: "Puts" },
] as const;

const OWNERSHIP_TABS = [
  { key: "institutional", label: "Institutional" },
  { key: "mutual_funds", label: "Mutual funds" },
  { key: "insider_roster", label: "Insider roster" },
] as const;

type ResearchTab = (typeof RESEARCH_TABS)[number]["key"];

export function ResearchSections({ symbol, nextEarningsDate }: ResearchSectionsProps) {
  const [activeTab, setActiveTab] = useState<ResearchTab>("financials");
  const [selectedExpiration, setSelectedExpiration] = useState<string | null>(null);

  const financialSummary = useQuery({
    queryKey: ["financial-summary", symbol],
    queryFn: () => stockYardClient.getFinancialSummary(symbol),
    enabled: activeTab === "financials",
  });
  const financialTrends = useQuery({
    queryKey: ["financial-trends", symbol],
    queryFn: () => stockYardClient.getFinancialTrends(symbol),
    enabled: activeTab === "financials",
  });
  const earningsHistory = useQuery({
    queryKey: ["earnings-history", symbol],
    queryFn: () => stockYardClient.getEarningsHistory(symbol),
    enabled: activeTab === "earnings",
  });
  const earningsEstimates = useQuery({
    queryKey: ["earnings-estimates", symbol],
    queryFn: () => stockYardClient.getEarningsEstimates(symbol),
    enabled: activeTab === "earnings",
  });
  const analystSummary = useQuery({
    queryKey: ["analyst-summary", symbol],
    queryFn: () => stockYardClient.getAnalystSummary(symbol),
    enabled: activeTab === "analyst",
  });
  const analystHistory = useQuery({
    queryKey: ["analyst-history", symbol],
    queryFn: () => stockYardClient.getAnalystHistory(symbol),
    enabled: activeTab === "analyst",
  });
  const ownership = useQuery({
    queryKey: ["ownership", symbol],
    queryFn: () => stockYardClient.getOwnership(symbol, "all", 5, 0),
    enabled: activeTab === "ownership",
  });
  const expirations = useQuery({
    queryKey: ["option-expirations", symbol],
    queryFn: () => stockYardClient.getOptionExpirations(symbol),
    enabled: activeTab === "options",
  });

  const expiration = selectedExpiration ?? expirations.data?.expirations[0] ?? null;

  const optionChain = useQuery({
    queryKey: ["option-chain", symbol, expiration],
    queryFn: () => stockYardClient.getOptionChain(symbol, expiration!),
    enabled: activeTab === "options" && Boolean(expiration),
  });

  return (
    <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as ResearchTab)} className="space-y-4">
      <Card variant="band" className="px-5 py-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-bold text-(--ink-strong)">Research</h2>
            <p className="mt-1 text-sm text-(--ink-muted)">Financials, earnings, analyst sentiment, ownership, and options data.</p>
          </div>
          <Tabs.List className="flex flex-wrap gap-1.5">
            {RESEARCH_TABS.map((tab) => (
              <Tabs.Trigger
                key={tab.key}
                value={tab.key}
                className="rounded-lg border border-(--line) bg-(--surface-float) px-3 py-1.5 text-sm text-(--ink-muted) transition-colors data-[state=active]:border-(--accent) data-[state=active]:bg-(--accent) data-[state=active]:text-(--accent-contrast)"
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </div>
      </Card>

      <Tabs.Content value="financials">
        <div className="grid gap-3 xl:grid-cols-[0.95fr_1.05fr]">
          <Card variant="panel" className="px-5 py-4">
            <ResearchPanelHeader title="Summary" subtitle="TTM and capital structure" />
            {financialSummary.data ? (
              <>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  <MetricCard label="Revenue TTM" value={formatCurrency(financialSummary.data.financialSummary.revenue_ttm)} />
                  <MetricCard label="Net income TTM" value={formatCurrency(financialSummary.data.financialSummary.net_income_ttm)} />
                  <MetricCard label="Free cash flow" value={formatCurrency(financialSummary.data.financialSummary.free_cash_flow)} />
                  <MetricCard label="EBITDA" value={formatCurrency(financialSummary.data.financialSummary.ebitda)} />
                  <MetricCard label="ROE" value={formatPercent(financialSummary.data.financialSummary.return_on_equity, 1)} />
                  <MetricCard label="Debt / equity" value={formatNumber(financialSummary.data.financialSummary.debt_to_equity, 1)} />
                </div>
                <div className="mt-3">
                  <DataLimitations items={financialSummary.data.dataLimitations} />
                </div>
              </>
            ) : (
              <SectionFallback query={financialSummary} emptyMessage="Financial statements are not materially available for this symbol." />
            )}
          </Card>
          <Card variant="panel" className="px-5 py-4">
            <ResearchPanelHeader title="Trend" subtitle="Annual and quarterly revenue" layout="inline" />
            {financialTrends.data?.annual.length || financialTrends.data?.quarterly.length ? (
              <>
                <div className="grid gap-2.5 lg:grid-cols-2">
                  <TrendCard
                    label="Annual"
                    items={(financialTrends.data?.annual ?? []).slice(-6).map((point) => formatAnnualTrendDatum(point.periodEnd, point.revenue))}
                  />
                  <TrendCard
                    label="Quarterly"
                    items={(financialTrends.data?.quarterly ?? []).slice(-6).map((point) => formatQuarterlyTrendDatum(point.periodEnd, point.revenue))}
                  />
                </div>
                <div className="mt-3">
                  <DataLimitations items={financialTrends.data.dataLimitations} />
                </div>
              </>
            ) : (
              <SectionFallback query={financialTrends} emptyMessage="Trend data is limited or unavailable for this symbol." />
            )}
          </Card>
        </div>
      </Tabs.Content>

      <Tabs.Content value="earnings">
        <div className="grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
          <Card variant="panel" className="px-5 py-4">
            <ResearchPanelHeader title="History" subtitle="Surprise cadence" />
            <div className="mb-3 rounded-lg border border-(--line) bg-(--surface-muted) px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-(--ink-soft)">Next earnings date</p>
              <p className="mt-1 text-base font-semibold text-(--ink-strong)">{formatDate(nextEarningsDate)}</p>
            </div>
            {earningsHistory.data?.events.length ? (
              <div className="space-y-2">
                {earningsHistory.data.events.slice(-4).reverse().map((event) => (
                  <div key={event.reportDate} className="flex items-center justify-between gap-4 rounded-lg border border-(--line) bg-(--surface-muted) px-3 py-2.5">
                    <div>
                      <p className="font-medium text-(--ink)">{event.quarter}</p>
                      <p className="text-xs text-(--ink-muted)">{formatDate(event.reportDate)}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-(--ink)">Actual: {event.epsActual ?? "—"}</p>
                      <p className="text-(--ink-muted)">Est: {event.epsEstimate ?? "—"}</p>
                      <p className={event.surprisePercent !== null && event.surprisePercent >= 0 ? "font-medium text-(--positive)" : "font-medium text-(--negative)"}>
                        {formatSignedPercent(event.surprisePercent, 1)}
                      </p>
                    </div>
                  </div>
                ))}
                <DataLimitations items={combineLimitations(earningsHistory.data.dataLimitations, earningsEstimates.data?.dataLimitations ?? [])} />
              </div>
            ) : (
              <SectionFallback query={earningsHistory} emptyMessage="Earnings history is limited or unavailable for this symbol." />
            )}
          </Card>
          <Card variant="panel" className="px-5 py-4">
            <ResearchPanelHeader title="Estimates" subtitle="Forward EPS and revenue" />
            {earningsEstimates.data?.epsEstimates.length || earningsEstimates.data?.revenueEstimates.length ? (
              <>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                  {(earningsEstimates.data?.epsEstimates ?? []).slice(0, 4).map((estimate) => (
                    <MetricCard
                      key={estimate.period}
                      label={estimate.period}
                      value={estimate.avg !== null ? `${estimate.avg} EPS` : "EPS unavailable"}
                      meta={`${formatPercent(estimate.growth, 1)} growth · ${formatNumber(estimate.numberOfAnalysts)} analysts`}
                    />
                  ))}
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {(earningsEstimates.data?.revenueEstimates ?? []).slice(0, 2).map((estimate) => (
                    <MetricCard
                      key={`rev-${estimate.period}`}
                      label={`${estimate.period} revenue`}
                      value={formatCurrency(estimate.avg)}
                      meta={`${formatPercent(estimate.growth, 1)} growth`}
                    />
                  ))}
                  {(earningsEstimates.data?.growthEstimates ?? []).slice(0, 2).map((estimate) => (
                    <MetricCard
                      key={`growth-${estimate.period}`}
                      label={`${estimate.period} trend`}
                      value={formatPercent(estimate.stockTrend, 1)}
                      meta={`Index ${formatPercent(estimate.indexTrend, 1)}`}
                    />
                  ))}
                </div>
                <div className="mt-3">
                  <DataLimitations items={earningsEstimates.data.dataLimitations} />
                </div>
              </>
            ) : (
              <SectionFallback query={earningsEstimates} emptyMessage="Estimate data is limited or unavailable for this symbol." />
            )}
          </Card>
        </div>
      </Tabs.Content>

      <Tabs.Content value="analyst">
        <div className="grid gap-3 xl:grid-cols-[0.95fr_1.05fr]">
          <Card variant="panel" className="px-5 py-4">
            <ResearchPanelHeader title="Summary" subtitle="Targets and recommendations" />
            {analystSummary.data ? (
              <>
                <div className="grid gap-2 md:grid-cols-2">
                  <MetricCard label="Target mean" value={formatCurrency(analystSummary.data.analystSummary.targetMean)} />
                  <MetricCard label="Current target" value={formatCurrency(analystSummary.data.analystSummary.currentPriceTarget)} />
                  <MetricCard label="Target low" value={formatCurrency(analystSummary.data.analystSummary.targetLow)} />
                  <MetricCard label="Target high" value={formatCurrency(analystSummary.data.analystSummary.targetHigh)} />
                </div>
                <div className="mt-3 grid gap-1.5 md:grid-cols-2 xl:grid-cols-5">
                  <MetricCard label="Strong buy" value={formatNumber(analystSummary.data.analystSummary.recommendationSummary.strongBuy)} />
                  <MetricCard label="Buy" value={formatNumber(analystSummary.data.analystSummary.recommendationSummary.buy)} />
                  <MetricCard label="Hold" value={formatNumber(analystSummary.data.analystSummary.recommendationSummary.hold)} />
                  <MetricCard label="Sell" value={formatNumber(analystSummary.data.analystSummary.recommendationSummary.sell)} />
                  <MetricCard label="Strong sell" value={formatNumber(analystSummary.data.analystSummary.recommendationSummary.strongSell)} />
                </div>
                <div className="mt-3">
                  <DataLimitations items={combineLimitations(analystSummary.data.dataLimitations, analystHistory.data?.dataLimitations ?? [])} />
                </div>
              </>
            ) : (
              <SectionFallback query={analystSummary} emptyMessage="Analyst coverage is limited for this symbol." />
            )}
          </Card>
          <Card variant="panel" className="px-5 py-4">
            <ResearchPanelHeader title="Recent actions" subtitle="Firm activity and target changes" />
            {analystHistory.data?.actions.length ? (
              <div className="space-y-2">
                {analystHistory.data.actions.slice(0, 5).map((action) => (
                  <div key={`${action.gradedAt}-${action.firm ?? action.toGrade ?? "action"}`} className="rounded-lg border border-(--line) bg-(--surface-muted) px-3 py-2.5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-(--ink)">{action.firm ?? "Research firm"}</p>
                        <p className="mt-0.5 text-xs text-(--ink-muted)">{formatDateTime(action.gradedAt)}</p>
                      </div>
                      <p className="text-sm font-medium text-(--accent)">{action.priceTargetAction ?? action.action ?? "Update"}</p>
                    </div>
                    <p className="mt-1.5 text-xs text-(--ink-muted)">
                      {action.fromGrade ?? "—"} → {action.toGrade ?? "—"} · target {formatCurrency(action.currentPriceTarget)} from {formatCurrency(action.priorPriceTarget)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <SectionFallback query={analystHistory} emptyMessage="Recent analyst actions are not materially available for this symbol." />
            )}
          </Card>
        </div>
      </Tabs.Content>

      <Tabs.Content value="ownership">
        <Card variant="panel" className="px-5 py-4">
          <ResearchPanelHeader title="Ownership" subtitle="Major holders and roster" />
          {ownership.data ? (
            <Tabs.Root defaultValue="institutional" className="space-y-3">
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                {ownership.data.majorHolders.slice(0, 4).map((holder) => (
                  <MetricCard key={holder.key} label={holder.label} value={formatPercent(holder.value, 2)} />
                ))}
              </div>
              <Tabs.List className="flex flex-wrap gap-1.5">
                {OWNERSHIP_TABS.map((tab) => (
                  <Tabs.Trigger
                    key={tab.key}
                    value={tab.key}
                    className="rounded-lg border border-(--line) bg-(--surface-float) px-3 py-1.5 text-sm text-(--ink-muted) data-[state=active]:border-(--accent) data-[state=active]:bg-(--accent) data-[state=active]:text-(--accent-contrast)"
                  >
                    {tab.label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
              <Tabs.Content value="institutional" className="space-y-2">
                {ownership.data.institutionalHolders.length ? (
                  ownership.data.institutionalHolders.map((holder) => (
                    <HolderRow
                      key={`${holder.holder}-${holder.dateReported}`}
                      label={holder.holder}
                      meta={`${formatDate(holder.dateReported)} · ${formatNumber(holder.shares)} shares`}
                      value={formatPercent(holder.pctHeld, 2)}
                    />
                  ))
                ) : (
                  <EmptyInline message="No institutional holder rows returned." />
                )}
              </Tabs.Content>
              <Tabs.Content value="mutual_funds" className="space-y-2">
                {ownership.data.mutualFundHolders.length ? (
                  ownership.data.mutualFundHolders.map((holder) => (
                    <HolderRow
                      key={`${holder.holder}-${holder.dateReported}`}
                      label={holder.holder}
                      meta={`${formatDate(holder.dateReported)} · ${formatNumber(holder.shares)} shares`}
                      value={formatPercent(holder.pctHeld, 2)}
                    />
                  ))
                ) : (
                  <EmptyInline message="No mutual fund holder rows returned." />
                )}
              </Tabs.Content>
              <Tabs.Content value="insider_roster" className="space-y-2">
                {ownership.data.insiderRoster.length ? (
                  ownership.data.insiderRoster.map((holder, index) => (
                    <HolderRow
                      key={`${holder.name}-${index}`}
                      label={holder.name}
                      meta={holder.relation ?? "Insider"}
                      value={formatNumber(holder.sharesOwnedDirectly)}
                    />
                  ))
                ) : (
                  <EmptyInline message="No insider roster rows returned." />
                )}
              </Tabs.Content>
              <DataLimitations items={ownership.data.dataLimitations} />
            </Tabs.Root>
          ) : (
            <SectionFallback query={ownership} emptyMessage="Ownership data is limited or unavailable for this symbol." />
          )}
        </Card>
      </Tabs.Content>

      <Tabs.Content value="options">
        <Card variant="panel" className="px-5 py-4">
          <ResearchPanelHeader title="Options" subtitle="Chain and expiration deck" />
          {expirations.data?.expirations.length ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="rounded-lg border border-(--line) bg-(--surface-muted) px-3 py-1.5 text-xs text-(--ink-soft)">
                  Underlying {formatCurrency(optionChain.data?.underlyingPrice ?? null)}
                </div>
                {expirations.data.expirations.slice(0, 6).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSelectedExpiration(item)}
                    className="rounded-lg border border-(--line) bg-(--surface-float) px-3 py-1.5 text-sm text-(--ink-muted) transition-colors hover:border-(--accent) data-[active=true]:border-(--accent) data-[active=true]:bg-(--accent) data-[active=true]:text-(--accent-contrast)"
                    data-active={item === expiration}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <Tabs.Root defaultValue="calls" className="space-y-3">
                <Tabs.List className="flex gap-1.5">
                  {OPTION_TABS.map((tab) => (
                    <Tabs.Trigger
                      key={tab.key}
                      value={tab.key}
                      className="rounded-lg border border-(--line) bg-(--surface-float) px-3 py-1.5 text-sm text-(--ink-muted) data-[state=active]:border-(--accent) data-[state=active]:bg-(--accent) data-[state=active]:text-(--accent-contrast)"
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
              <DataLimitations items={optionChain.data?.dataLimitations ?? []} />
            </div>
          ) : (
            <SectionFallback query={expirations} emptyMessage="Options data is limited or unavailable for this symbol." />
          )}
        </Card>
      </Tabs.Content>
    </Tabs.Root>
  );
}

type ResearchPanelHeaderProps = {
  title: string;
  subtitle: string;
  layout?: "stacked" | "inline";
};

function ResearchPanelHeader({ title, subtitle, layout = "stacked" }: ResearchPanelHeaderProps) {
  if (layout === "inline") {
    return (
      <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="text-xl font-bold text-(--ink-strong)">{title}</h3>
        <span aria-hidden="true" className="text-[15px] text-(--ink-soft)">•</span>
        <p className="text-[15px] font-normal text-(--ink-muted)">{subtitle}</p>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <h3 className="text-lg font-bold text-(--ink-strong)">{title}</h3>
      <p className="mt-0.5 text-sm text-(--ink-muted)">{subtitle}</p>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  meta?: string;
};

function MetricCard({ label, value, meta }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-(--line) bg-(--surface-muted) px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-(--ink-soft)">{label}</p>
      <p className="mt-1 text-sm font-medium text-(--ink)">{value}</p>
      {meta ? <p className="mt-1 text-xs text-(--ink-muted)">{meta}</p> : null}
    </div>
  );
}

type TrendCardProps = {
  label: string;
  items: BarDatum[];
};

function TrendCard({ label, items }: TrendCardProps) {
  return (
    <div className="rounded-lg border border-(--line) bg-(--surface-muted) px-3 py-2.5">
      <p className="text-sm font-medium uppercase tracking-[0.12em] text-(--ink-soft)">{label}</p>
      {items.length ? (
        <MicroBarChart
          variant="temporal"
          items={items}
          height={228}
          tickFormat={{ style: "currency", currency: "USD", digits: 0 }}
          valueFormat={{ style: "currency", currency: "USD", digits: 1 }}
        />
      ) : (
        <p className="mt-2 text-sm text-(--ink-muted)">No chart rows available.</p>
      )}
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
    <div className="flex items-center justify-between gap-4 rounded-lg border border-(--line) bg-(--surface-muted) px-3 py-2.5">
      <div>
        <p className="font-medium text-(--ink)">{label}</p>
        <p className="text-xs text-(--ink-muted)">{meta}</p>
      </div>
      <p className="text-sm font-medium text-(--ink)">{value}</p>
    </div>
  );
}

function EmptyInline({ message }: { message: string }) {
  return <p className="rounded-lg border border-dashed border-(--line-strong) px-4 py-4 text-sm text-(--ink-muted)">{message}</p>;
}

type SectionFallbackProps = {
  query: { error: unknown; isPending: boolean };
  emptyMessage: string;
};

function SectionFallback({ query, emptyMessage }: SectionFallbackProps) {
  if (query.isPending) {
    return <EmptyInline message="Loading…" />;
  }

  if (isStockYardApiError(query.error) && query.error.code === "DATA_UNAVAILABLE") {
    return <EmptyInline message={emptyMessage} />;
  }

  if (query.error instanceof Error) {
    return <p className="text-sm text-(--negative)">{query.error.message}</p>;
  }

  return <EmptyInline message={emptyMessage} />;
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
    estimateSize: () => 44,
    overscan: 8,
  });

  if (rows.length === 0) {
    return <EmptyInline message="No contracts returned for this expiration." />;
  }

  return (
    <div>
      <div className="grid grid-cols-6 gap-2 border-b border-(--line) pb-2 text-[11px] font-medium uppercase tracking-wider text-(--ink-soft)">
        <span>Strike</span>
        <span>Last</span>
        <span>Bid</span>
        <span>Ask</span>
        <span>IV</span>
        <span>Volume</span>
      </div>
      <div ref={parentRef} className="mt-1.5 h-[280px] overflow-auto">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((item) => {
            const row = rows[item.index];

            return (
              <div
                key={row.contractSymbol}
                className="absolute inset-x-0 grid grid-cols-6 gap-2 rounded-lg border border-(--line) bg-(--surface-muted) px-3 py-2.5 text-sm text-(--ink)"
                style={{ transform: `translateY(${item.start}px)` }}
              >
                <span>{formatNumber(row.strike, 2)}</span>
                <span>{formatNumber(row.lastPrice, 2)}</span>
                <span>{formatNumber(row.bid, 2)}</span>
                <span>{formatNumber(row.ask, 2)}</span>
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

function combineLimitations(...groups: string[][]) {
  return Array.from(new Set(groups.flat().filter(Boolean)));
}

function formatAnnualTrendDatum(periodEnd: string, revenue: number | null): BarDatum {
  const year = periodEnd.slice(0, 4);

  return {
    id: periodEnd,
    label: year,
    meta: `Fiscal year ${year}`,
    value: revenue,
    a11yLabel: `Fiscal year ${year}: ${formatCurrency(revenue, "USD", 0)}`,
  };
}

function formatQuarterlyTrendDatum(periodEnd: string, revenue: number | null): BarDatum {
  const date = new Date(periodEnd);
  const month = date.getUTCMonth();
  const quarter = `Q${Math.floor(month / 3) + 1}`;
  const meta = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  return {
    id: periodEnd,
    label: quarter,
    meta,
    value: revenue,
    a11yLabel: `${quarter} ${meta}: ${formatCurrency(revenue, "USD", 0)}`,
  };
}
