import { describe, expect, it } from "vitest";

import { formatCurrency, formatDate, formatPercent, formatSignedPercent } from "@/lib/stock-yard/format";
import { compareRouteWithQuery, compareRoute, homeRoute, tickerRoute } from "@/lib/routes";

describe("stock-yard format helpers", () => {
  it("formats currencies and percentages predictably", () => {
    expect(formatCurrency(1250, "USD", 0)).toContain("$1,250");
    expect(formatPercent(0.1234, 1)).toBe("12.3%");
    expect(formatSignedPercent(-0.84, 1)).toBe("-0.8%");
  });

  it("handles missing values gracefully", () => {
    expect(formatCurrency(null)).toBe("Unavailable");
    expect(formatDate(null)).toBe("Unavailable");
  });
});

describe("route helpers", () => {
  it("builds typed internal routes", () => {
    expect(homeRoute).toBe("/");
    expect(compareRoute).toBe("/compare");
    expect(tickerRoute("AAPL")).toBe("/ticker/AAPL");
    expect(compareRouteWithQuery("symbols=AAPL,MSFT&period=6mo&interval=1d")).toBe("/compare?symbols=AAPL,MSFT&period=6mo&interval=1d");
  });
});
