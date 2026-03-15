import { notFound } from "next/navigation";

import { ChatPanel } from "@/components/ticker/chat-panel";
import { HistoryPanel } from "@/components/ticker/history-panel";
import { NewsPanel } from "@/components/ticker/news-panel";
import { ResearchSections } from "@/components/ticker/research-sections";
import { TickerHeader } from "@/components/ticker/ticker-header";
import { SetupPanel } from "@/components/ui/setup-panel";
import {
  DEFAULT_TICKER_HISTORY_INTERVAL,
  DEFAULT_TICKER_HISTORY_PERIOD,
} from "@/lib/stock-yard/constants";
import { isStockYardConfigured } from "@/lib/stock-yard/env";
import { isStockYardApiError } from "@/lib/stock-yard/fetch";
import { stockYardServer } from "@/lib/stock-yard/server";

type TickerPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TickerPage({ params }: TickerPageProps) {
  const { symbol } = await params;
  const normalizedSymbol = symbol.toUpperCase();

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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <TickerHeader data={overview} />
        <HistoryPanel
          symbol={normalizedSymbol}
          currency={overview.overview.currency ?? "USD"}
          initialData={historyResult.status === "fulfilled" ? historyResult.value : null}
        />
        <NewsPanel data={newsResult.status === "fulfilled" ? newsResult.value : null} />
        <ResearchSections symbol={normalizedSymbol} nextEarningsDate={overview.overview.earnings_date} />
      </div>
      <div>
        <ChatPanel symbol={normalizedSymbol} />
      </div>
    </div>
  );
}
