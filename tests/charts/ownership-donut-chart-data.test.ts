import { describe, expect, it } from "vitest";

import { buildOwnershipDonutChartItems, getOwnershipChartColor } from "@/components/charts/ownership-donut-chart-data";

describe("ownership donut chart data", () => {
  it("normalizes the visible weighted rows and assigns stable colors", () => {
    const items = buildOwnershipDonutChartItems([
      { id: "vanguard", label: "Vanguard", value: 0.5841 },
      { id: "blackrock", label: "Blackrock", value: 0.5009 },
      { id: "fidelity", label: "Fidelity", value: 0.3573 },
    ]);

    expect(items).toHaveLength(3);
    expect(items[0]?.color).toBe("var(--ownership-1)");
    expect(items[1]?.color).toBe("var(--ownership-2)");
    expect(items[2]?.color).toBe("var(--ownership-3)");

    const normalizedTotal = items.reduce((sum, item) => sum + item.normalizedValue, 0);
    expect(normalizedTotal).toBeCloseTo(1, 6);
  });

  it("filters invalid weighted rows and suppresses the chart when fewer than two remain", () => {
    expect(
      buildOwnershipDonutChartItems([
        { id: "only", label: "Only holder", value: 0.22 },
        { id: "zero", label: "Zero holder", value: 0 },
        { id: "null", label: "Null holder", value: null },
      ]),
    ).toEqual([]);
  });

  it("caps the palette to five items and limits the chart input to five visible rows", () => {
    const items = buildOwnershipDonutChartItems([
      { id: "1", label: "1", value: 0.2 },
      { id: "2", label: "2", value: 0.18 },
      { id: "3", label: "3", value: 0.16 },
      { id: "4", label: "4", value: 0.14 },
      { id: "5", label: "5", value: 0.12 },
      { id: "6", label: "6", value: 0.1 },
    ]);

    expect(items).toHaveLength(5);
    expect(items[4]?.color).toBe("var(--ownership-5)");
    expect(getOwnershipChartColor(9)).toBe("var(--ownership-5)");
  });
});
