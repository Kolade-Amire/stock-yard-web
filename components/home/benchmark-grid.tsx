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
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-(--ink-soft)">Benchmarks</p>
        <h3 className="mt-2 font-(family-name:--font-display) text-[2rem] text-(--ink)">Context funds</h3>
      </div>
      {data?.funds.length ? (
        <div className="space-y-2.5">
          {data.funds.map((fund) => (
            <Link
              key={fund.symbol}
              href={tickerRoute(fund.symbol)}
              className="block rounded-[22px] border border-(--line) bg-(--surface) px-4 py-3 transition-colors hover:border-(--line-heavy) hover:bg-(--surface-float)"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-(--ink-soft)">{fund.benchmarkName}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <h4 className="font-(family-name:--font-display) text-[1.5rem] text-(--ink)">{fund.symbol}</h4>
                    <p className="text-sm text-(--ink-muted)">{fund.displayName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-(--ink)">{formatCurrency(fund.currentPrice)}</p>
                  <p className={fund.dayChangePercent !== null && fund.dayChangePercent >= 0 ? "text-xs text-(--positive)" : "text-xs text-(--negative)"}>
                    {formatPercent(fund.dayChangePercent, 2)}
                  </p>
                </div>
              </div>
              <div className="mt-3 grid gap-1 text-sm text-(--ink-muted)">
                <p>Expense ratio: {formatPercent(fund.expenseRatio, 2)}</p>
                <p>Yield: {formatPercent(fund.yield, 2)}</p>
                <p>Top holding: {fund.topHoldings[0] ? `${fund.topHoldings[0].symbol} • ${fund.topHoldings[0].name}` : "Unavailable"}</p>
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
