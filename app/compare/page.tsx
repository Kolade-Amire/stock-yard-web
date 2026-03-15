import { CompareWorkspace } from "@/components/compare/compare-workspace";
import { SetupPanel } from "@/components/ui/setup-panel";
import {
  DEFAULT_COMPARE_INTERVAL,
  DEFAULT_COMPARE_PERIOD,
  DEFAULT_COMPARE_SYMBOLS,
  HISTORY_INTERVALS_BY_PERIOD,
  HISTORY_PERIODS,
} from "@/lib/stock-yard/constants";
import { isStockYardConfigured } from "@/lib/stock-yard/env";
import { stockYardServer } from "@/lib/stock-yard/server";

type ComparePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const resolvedSearchParams = await searchParams;
  const configured = isStockYardConfigured();
  const rawSymbols = typeof resolvedSearchParams.symbols === "string" ? resolvedSearchParams.symbols.split(",") : [...DEFAULT_COMPARE_SYMBOLS];
  const symbols = Array.from(new Set(rawSymbols.map((item) => item.toUpperCase()).filter(Boolean))).slice(0, 5);
  const period = isHistoryPeriod(resolvedSearchParams.period) ? resolvedSearchParams.period : DEFAULT_COMPARE_PERIOD;
  const intervalCandidate = typeof resolvedSearchParams.interval === "string" ? resolvedSearchParams.interval : DEFAULT_COMPARE_INTERVAL;
  const interval = HISTORY_INTERVALS_BY_PERIOD[period].includes(intervalCandidate as "1d" | "1wk" | "1mo")
    ? (intervalCandidate as "1d" | "1wk" | "1mo")
    : HISTORY_INTERVALS_BY_PERIOD[period][0];

  const initialData = configured && symbols.length >= 2 ? await stockYardServer.compareTickers(symbols, period, interval).catch(() => null) : null;

  return (
    <>
      {!configured ? <SetupPanel /> : null}
      <CompareWorkspace
        configured={configured}
        initialData={initialData}
        initialSymbols={symbols.length >= 2 ? symbols : [...DEFAULT_COMPARE_SYMBOLS]}
        initialPeriod={period}
        initialInterval={interval}
      />
    </>
  );
}

function isHistoryPeriod(value: string | string[] | undefined): value is (typeof HISTORY_PERIODS)[number] {
  return typeof value === "string" && HISTORY_PERIODS.includes(value as (typeof HISTORY_PERIODS)[number]);
}
