import {
  analystHistoryResponseSchema,
  analystSummaryResponseSchema,
  benchmarksResponseSchema,
  chatResponseSchema,
  compareResponseSchema,
  earningsCalendarResponseSchema,
  earningsEstimatesResponseSchema,
  earningsHistoryResponseSchema,
  financialSummaryResponseSchema,
  financialTrendsResponseSchema,
  historyResponseSchema,
  moversResponseSchema,
  newsResponseSchema,
  optionsChainResponseSchema,
  optionsExpirationsResponseSchema,
  ownershipResponseSchema,
  searchResponseSchema,
  sectorPulseResponseSchema,
  tickerOverviewSchema,
} from "@/lib/stock-yard/schemas";
import { fetchStockYardServer } from "@/lib/stock-yard/fetch";

export const stockYardServer = {
  searchTickers(query: string) {
    return fetchStockYardServer(`/tickers/search?q=${encodeURIComponent(query)}`, searchResponseSchema, {
      revalidate: 60,
    });
  },
  getTickerOverview(symbol: string) {
    return fetchStockYardServer(`/tickers/${symbol}`, tickerOverviewSchema, {
      revalidate: 60,
    });
  },
  getTickerHistory(symbol: string, period: string, interval: string) {
    return fetchStockYardServer(
      `/tickers/${symbol}/history?period=${encodeURIComponent(period)}&interval=${encodeURIComponent(interval)}`,
      historyResponseSchema,
      {
        revalidate: 60,
      },
    );
  },
  getTickerNews(symbol: string, limit = 10) {
    return fetchStockYardServer(`/tickers/${symbol}/news?limit=${limit}`, newsResponseSchema, {
      revalidate: 120,
    });
  },
  getFinancialSummary(symbol: string) {
    return fetchStockYardServer(`/tickers/${symbol}/financial-summary`, financialSummaryResponseSchema, {
      revalidate: 300,
    });
  },
  getFinancialTrends(symbol: string) {
    return fetchStockYardServer(`/tickers/${symbol}/financials/trends`, financialTrendsResponseSchema, {
      revalidate: 300,
    });
  },
  getEarningsHistory(symbol: string) {
    return fetchStockYardServer(`/tickers/${symbol}/earnings/history`, earningsHistoryResponseSchema, {
      revalidate: 300,
    });
  },
  getEarningsEstimates(symbol: string) {
    return fetchStockYardServer(`/tickers/${symbol}/earnings/estimates`, earningsEstimatesResponseSchema, {
      revalidate: 300,
    });
  },
  getAnalystSummary(symbol: string) {
    return fetchStockYardServer(`/tickers/${symbol}/analyst/summary`, analystSummaryResponseSchema, {
      revalidate: 300,
    });
  },
  getAnalystHistory(symbol: string) {
    return fetchStockYardServer(`/tickers/${symbol}/analyst/history`, analystHistoryResponseSchema, {
      revalidate: 300,
    });
  },
  getOwnership(symbol: string, section = "all", limit = 5, offset = 0) {
    return fetchStockYardServer(
      `/tickers/${symbol}/ownership?section=${section}&limit=${limit}&offset=${offset}`,
      ownershipResponseSchema,
      {
        revalidate: 300,
      },
    );
  },
  getOptionExpirations(symbol: string) {
    return fetchStockYardServer(`/tickers/${symbol}/options/expirations`, optionsExpirationsResponseSchema, {
      revalidate: 300,
    });
  },
  getOptionChain(symbol: string, expiration: string) {
    return fetchStockYardServer(
      `/tickers/${symbol}/options/chain?expiration=${encodeURIComponent(expiration)}`,
      optionsChainResponseSchema,
      {
        revalidate: 60,
      },
    );
  },
  compareTickers(symbols: string[], period: string, interval: string) {
    return fetchStockYardServer(
      `/tickers/compare?symbols=${encodeURIComponent(symbols.join(","))}&period=${encodeURIComponent(period)}&interval=${encodeURIComponent(interval)}`,
      compareResponseSchema,
      {
        revalidate: 60,
      },
    );
  },
  getMovers(screen: "gainers" | "losers" | "most_active", limit = 8) {
    return fetchStockYardServer(`/market/movers?screen=${screen}&limit=${limit}`, moversResponseSchema, {
      revalidate: 60,
    });
  },
  getBenchmarks() {
    return fetchStockYardServer("/market/benchmarks", benchmarksResponseSchema, {
      revalidate: 300,
    });
  },
  getEarningsCalendar(limit = 8) {
    return fetchStockYardServer(`/market/earnings-calendar?limit=${limit}&offset=0&activeOnly=true`, earningsCalendarResponseSchema, {
      revalidate: 300,
    });
  },
  getSectorPulse() {
    return fetchStockYardServer("/market/sectors/pulse", sectorPulseResponseSchema, {
      revalidate: 300,
    });
  },
  sendChatMessage(payload: {
    symbol: string;
    sessionId?: string;
    message: string;
    conversation: { role: "user" | "assistant"; content: string }[];
  }) {
    return fetchStockYardServer("/chat", chatResponseSchema, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
