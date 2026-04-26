import Link from "next/link";

import { DataLimitations } from "@/components/ui/data-limitations";
import { formatCurrency, formatPercent } from "@/lib/stock-yard/format";
import { tickerRoute } from "@/lib/routes";
import type { BenchmarksResponse } from "@/lib/stock-yard/schemas";

// Colored dots per benchmark position (matches reference design)
const BENCHMARK_DOTS = ["#2d6a4f", "#6a8eae", "#9b7eb8", "#c8a96e", "#8a8680"];

type BenchmarkGridProps = {
  data: BenchmarksResponse | null;
};

export function HeroBenchmarks({ data }: BenchmarkGridProps) {
  return (
    <div>
      <p
        className="text-[9px] tracking-[0.12em] uppercase text-(--ink-soft) mb-2.5"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Benchmarks · Live
      </p>
      {data?.funds.length ? (
        <>
          {data.funds.map((fund, i) => (
            <Link
              key={fund.symbol}
              href={tickerRoute(fund.symbol)}
              className="flex items-center justify-between py-[9px] border-b border-(--line) last:border-b-0 hover:bg-(--surface-muted) transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: BENCHMARK_DOTS[i % BENCHMARK_DOTS.length] }}
                />
                <div className="min-w-0">
                  <p
                    className="text-[12px] font-medium text-(--ink)"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {fund.symbol}
                  </p>
                  <p className="text-[10px] text-(--ink-soft)">{fund.displayName}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p
                  className="text-[12px] text-(--ink)"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatCurrency(fund.currentPrice)}
                </p>
                <p
                  className={`text-[10px] ${fund.dayChangePercent !== null && fund.dayChangePercent >= 0 ? "text-(--positive)" : "text-(--negative)"}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {fund.dayChangePercent !== null && fund.dayChangePercent >= 0 ? "+" : ""}
                  {formatPercent(fund.dayChangePercent, 2)}
                </p>
              </div>
            </Link>
          ))}
          <DataLimitations items={data.dataLimitations} />
        </>
      ) : (
        <p className="text-[13px] text-(--ink-muted)">Benchmark data will appear here once the API is connected.</p>
      )}
    </div>
  );
}

// Keep old export for backwards compat with any other usage
export { HeroBenchmarks as BenchmarkGrid };
