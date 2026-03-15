import { Card } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/stock-yard/format";
import type { BenchmarksResponse } from "@/lib/stock-yard/schemas";

type BenchmarkGridProps = {
  data: BenchmarksResponse | null;
};

export function BenchmarkGrid({ data }: BenchmarkGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data?.funds.map((fund) => (
        <Card key={fund.symbol} className="px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--ink-soft)">{fund.benchmarkName}</p>
              <h3 className="mt-2 font-(family-name:--font-display) text-2xl text-(--ink)">{fund.symbol}</h3>
              <p className="mt-1 text-sm text-(--ink-muted)">{fund.displayName}</p>
            </div>
            <div className="rounded-2xl bg-(--surface-strong) px-3 py-2 text-right">
              <p className="text-sm font-semibold text-(--ink)">{formatCurrency(fund.currentPrice)}</p>
              <p className="text-xs text-(--ink-soft)">{formatPercent(fund.dayChangePercent)}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-2 text-sm text-(--ink-muted)">
            <p>Expense ratio: {formatPercent(fund.expenseRatio, 2)}</p>
            <p>Yield: {formatPercent(fund.yield, 2)}</p>
            <p>Top holding: {fund.topHoldings[0] ? `${fund.topHoldings[0].symbol} • ${fund.topHoldings[0].name}` : "Unavailable"}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
