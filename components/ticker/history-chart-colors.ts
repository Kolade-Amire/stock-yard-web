import type { HistoryResponse } from "@/lib/stock-yard/schemas";

export type TickerHistoryChartDirection = "positive" | "negative" | "neutral";

type HistoryBar = HistoryResponse["bars"][number];

export function getTickerHistoryChartDirection(bars: HistoryBar[]): TickerHistoryChartDirection {
  if (bars.length < 2) {
    return "neutral";
  }

  const firstClose = bars[0]?.close;
  const latestClose = bars[bars.length - 1]?.close;

  if (latestClose > firstClose) {
    return "positive";
  }

  if (latestClose < firstClose) {
    return "negative";
  }

  return "neutral";
}

export function getTickerHistoryChartTokens(direction: TickerHistoryChartDirection) {
  switch (direction) {
    case "positive":
      return {
        line: "var(--chart-price-positive)",
        fill: "var(--chart-price-positive-fill)",
      };
    case "negative":
      return {
        line: "var(--chart-price-negative)",
        fill: "var(--chart-price-negative-fill)",
      };
    default:
      return {
        line: "var(--chart-price-neutral)",
        fill: "var(--chart-price-neutral-fill)",
      };
  }
}
