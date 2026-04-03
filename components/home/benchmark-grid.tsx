import Link from "next/link";

import { Card } from "@/components/ui/card";
import { DataLimitations } from "@/components/ui/data-limitations";
import { formatCurrency, formatPercent } from "@/lib/stock-yard/format";
import { tickerRoute } from "@/lib/routes";
import type { BenchmarksResponse } from "@/lib/stock-yard/schemas";

type BenchmarkGridProps = {
  data: BenchmarksResponse | null;
};

export function BenchmarkGrid({ data }: BenchmarkGridProps) {
  return (
    <Card variant="rail" className="px-4 py-4">
      <div className="mb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-(--ink-soft)">Benchmarks</p>
        <h3 className="mt-1 text-lg font-semibold text-(--ink-strong)">Market indices</h3>
      </div>
      {data?.funds.length ? (
        <div className="space-y-2">
          {data.funds.map((fund) => (
            <Link
              key={fund.symbol}
              href={tickerRoute(fund.symbol)}
              className="block rounded-lg border border-(--line) bg-(--surface) px-3 py-3 transition-colors hover:border-(--line-heavy) hover:bg-(--surface-float)"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-(--ink-soft)">{fund.benchmarkName}</p>
                  <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
                    <h4 className="text-base font-bold text-(--ink-strong)">{fund.symbol}</h4>
                    <p className="min-w-0 text-xs text-(--ink-muted)">{fund.displayName}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold text-(--ink)">{formatCurrency(fund.currentPrice)}</p>
                  <p className={fund.dayChangePercent !== null && fund.dayChangePercent >= 0 ? "text-xs font-medium text-(--positive)" : "text-xs font-medium text-(--negative)"}>
                    {formatPercent(fund.dayChangePercent, 2)}
                  </p>
                </div>
              </div>
              <div className="mt-2 grid gap-0.5 text-xs text-(--ink-muted)">
                <p>Expense: {formatPercent(fund.expenseRatio, 2)} · Yield: {formatPercent(fund.yield, 2)}</p>
                <p>Top: {fund.topHoldings[0] ? `${fund.topHoldings[0].symbol} • ${fund.topHoldings[0].name}` : "Unavailable"}</p>
              </div>
            </Link>
          ))}
          <DataLimitations items={data.dataLimitations} />
        </div>
      ) : (
        <p className="text-sm text-(--ink-muted)">Benchmark context will appear here once the API is connected.</p>
      )}
    </Card>
  );
}
