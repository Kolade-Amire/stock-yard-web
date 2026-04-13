import { notFound } from "next/navigation";

import { RecentSymbolTracker } from "@/components/ticker/recent-symbol-tracker";
import { TickerHeader } from "@/components/ticker/ticker-header";
import { TickerWorkspace } from "@/components/ticker/ticker-workspace";
import { SetupPanel } from "@/components/ui/setup-panel";
import {
  DEFAULT_TICKER_HISTORY_INTERVAL,
  DEFAULT_TICKER_HISTORY_PERIOD,
} from "@/lib/stock-yard/constants";
import { isStockYardConfigured } from "@/lib/stock-yard/env";
import { isStockYardApiError } from "@/lib/stock-yard/fetch";
import { stockYardServer } from "@/lib/stock-yard/server";
import { DEFAULT_TICKER_TAB, isTickerWorkspaceTab } from "@/lib/ticker-tabs";

type TickerPageProps = {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TickerPage({ params, searchParams }: TickerPageProps) {
  const { symbol } = await params;
  const resolvedSearchParams = await searchParams;
  const normalizedSymbol = symbol.toUpperCase();
  const initialTab = isTickerWorkspaceTab(resolvedSearchParams.tab) ? resolvedSearchParams.tab : DEFAULT_TICKER_TAB;

  if (!isStockYardConfigured()) {
    return <SetupPanel />;
  }

  const overview = await stockYardServer.getTickerOverview(normalizedSymbol).catch((error) => {
    if (isStockYardApiError(error) && ["INVALID_SYMBOL", "NOT_FOUND"].includes(error.code)) {
      notFound();
    }

    throw error;
  });

  const [historyResult, newsResult] = await Promise.allSettled([
    stockYardServer.getTickerHistory(normalizedSymbol, DEFAULT_TICKER_HISTORY_PERIOD, DEFAULT_TICKER_HISTORY_INTERVAL),
    stockYardServer.getTickerNews(normalizedSymbol, 10),
  ]);

  return (
    <div className="space-y-6">
      <RecentSymbolTracker symbol={normalizedSymbol} />
      <TickerHeader data={overview} />
      <TickerWorkspace
        symbol={normalizedSymbol}
        currency={overview.overview.currency ?? "USD"}
        nextEarningsDate={overview.overview.earnings_date}
        initialHistoryData={historyResult.status === "fulfilled" ? historyResult.value : null}
        initialNewsData={newsResult.status === "fulfilled" ? newsResult.value : null}
        initialTab={initialTab}
      />
    </div>
  );
}
