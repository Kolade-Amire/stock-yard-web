import {
  analystHistoryResponseSchema,
  analystSummaryResponseSchema,
  chatResponseSchema,
  compareResponseSchema,
  earningsEstimatesResponseSchema,
  earningsHistoryResponseSchema,
  financialSummaryResponseSchema,
  financialTrendsResponseSchema,
  historyResponseSchema,
  newsResponseSchema,
  optionsChainResponseSchema,
  optionsExpirationsResponseSchema,
  ownershipResponseSchema,
  searchResponseSchema,
} from "@/lib/stock-yard/schemas";
import { fetchStockYardBrowser } from "@/lib/stock-yard/fetch";

export const stockYardClient = {
  searchTickers(query: string) {
    return fetchStockYardBrowser(`/tickers/search?q=${encodeURIComponent(query)}`, searchResponseSchema);
  },
  getTickerHistory(symbol: string, period: string, interval: string) {
    return fetchStockYardBrowser(
      `/tickers/${symbol}/history?period=${encodeURIComponent(period)}&interval=${encodeURIComponent(interval)}`,
      historyResponseSchema,
    );
  },
  getTickerNews(symbol: string, limit = 10) {
    return fetchStockYardBrowser(`/tickers/${symbol}/news?limit=${limit}`, newsResponseSchema);
  },
  getFinancialSummary(symbol: string) {
    return fetchStockYardBrowser(`/tickers/${symbol}/financial-summary`, financialSummaryResponseSchema);
  },
  getFinancialTrends(symbol: string) {
    return fetchStockYardBrowser(`/tickers/${symbol}/financials/trends`, financialTrendsResponseSchema);
  },
  getEarningsHistory(symbol: string) {
    return fetchStockYardBrowser(`/tickers/${symbol}/earnings/history`, earningsHistoryResponseSchema);
  },
  getEarningsEstimates(symbol: string) {
    return fetchStockYardBrowser(`/tickers/${symbol}/earnings/estimates`, earningsEstimatesResponseSchema);
  },
  getAnalystSummary(symbol: string) {
    return fetchStockYardBrowser(`/tickers/${symbol}/analyst/summary`, analystSummaryResponseSchema);
  },
  getAnalystHistory(symbol: string) {
    return fetchStockYardBrowser(`/tickers/${symbol}/analyst/history`, analystHistoryResponseSchema);
  },
  getOwnership(symbol: string, section = "all", limit = 5, offset = 0) {
    return fetchStockYardBrowser(
      `/tickers/${symbol}/ownership?section=${section}&limit=${limit}&offset=${offset}`,
      ownershipResponseSchema,
    );
  },
  getOptionExpirations(symbol: string) {
    return fetchStockYardBrowser(`/tickers/${symbol}/options/expirations`, optionsExpirationsResponseSchema);
  },
  getOptionChain(symbol: string, expiration: string) {
    return fetchStockYardBrowser(
      `/tickers/${symbol}/options/chain?expiration=${encodeURIComponent(expiration)}`,
      optionsChainResponseSchema,
    );
  },
  compareTickers(symbols: string[], period: string, interval: string) {
    return fetchStockYardBrowser(
      `/tickers/compare?symbols=${encodeURIComponent(symbols.join(","))}&period=${encodeURIComponent(period)}&interval=${encodeURIComponent(interval)}`,
      compareResponseSchema,
    );
  },
  sendChatMessage(payload: {
    symbol: string;
    sessionId?: string;
    message: string;
    conversation: { role: "user" | "assistant"; content: string }[];
  }) {
    return fetchStockYardBrowser("/chat", chatResponseSchema, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "content-type": "application/json",
      },
    });
  },
};
