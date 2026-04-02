import { describe, expect, it } from "vitest";

import { getTickerHistoryChartDirection, getTickerHistoryChartTokens } from "@/components/ticker/history-chart-colors";

describe("ticker history chart colors", () => {
  it("marks the chart positive when the selected range closes above the first bar", () => {
    expect(
      getTickerHistoryChartDirection([
        { timestamp: "2026-01-01T00:00:00Z", open: 100, high: 101, low: 99, close: 100, adj_close: 100, volume: 1 },
        { timestamp: "2026-01-02T00:00:00Z", open: 104, high: 106, low: 103, close: 105, adj_close: 105, volume: 1 },
      ]),
    ).toBe("positive");
  });

  it("marks the chart negative when the selected range closes below the first bar", () => {
    expect(
      getTickerHistoryChartDirection([
        { timestamp: "2026-01-01T00:00:00Z", open: 100, high: 101, low: 99, close: 100, adj_close: 100, volume: 1 },
        { timestamp: "2026-01-02T00:00:00Z", open: 94, high: 96, low: 93, close: 95, adj_close: 95, volume: 1 },
      ]),
    ).toBe("negative");
  });

  it("marks the chart neutral when the selected range is flat or insufficient", () => {
    expect(
      getTickerHistoryChartDirection([
        { timestamp: "2026-01-01T00:00:00Z", open: 100, high: 101, low: 99, close: 100, adj_close: 100, volume: 1 },
        { timestamp: "2026-01-02T00:00:00Z", open: 100, high: 102, low: 98, close: 100, adj_close: 100, volume: 1 },
      ]),
    ).toBe("neutral");

    expect(
      getTickerHistoryChartDirection([
        { timestamp: "2026-01-01T00:00:00Z", open: 100, high: 101, low: 99, close: 100, adj_close: 100, volume: 1 },
      ]),
    ).toBe("neutral");
  });

  it("maps each direction to the expected chart tokens", () => {
    expect(getTickerHistoryChartTokens("positive")).toEqual({
      line: "var(--chart-price-positive)",
      fill: "var(--chart-price-positive-fill)",
    });
    expect(getTickerHistoryChartTokens("negative")).toEqual({
      line: "var(--chart-price-negative)",
      fill: "var(--chart-price-negative-fill)",
    });
    expect(getTickerHistoryChartTokens("neutral")).toEqual({
      line: "var(--chart-price-neutral)",
      fill: "var(--chart-price-neutral-fill)",
    });
  });
});
