import { describe, expect, it } from "vitest";

import { getCompareSeriesColor } from "@/components/compare/series-colors";

describe("getCompareSeriesColor", () => {
  it("maps the first five compare slots to stable chart tokens", () => {
    expect(getCompareSeriesColor(0)).toBe("var(--chart-1)");
    expect(getCompareSeriesColor(1)).toBe("var(--chart-2)");
    expect(getCompareSeriesColor(2)).toBe("var(--chart-3)");
    expect(getCompareSeriesColor(3)).toBe("var(--chart-4)");
    expect(getCompareSeriesColor(4)).toBe("var(--chart-5)");
  });

  it("falls back to the last token beyond the supported compare range", () => {
    expect(getCompareSeriesColor(8)).toBe("var(--chart-5)");
  });
});
