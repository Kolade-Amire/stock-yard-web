import { describe, expect, it } from "vitest";

import { resolveChartColor, withChartAlpha } from "@/components/charts/time-series-chart";

describe("time-series-chart color helpers", () => {
  it("resolves css variable colors from the root theme", () => {
    document.documentElement.style.setProperty("--chart-2", "#336699");

    expect(resolveChartColor("var(--chart-2)")).toBe("#336699");
  });

  it("passes through concrete color strings unchanged", () => {
    expect(resolveChartColor("#112233")).toBe("#112233");
    expect(resolveChartColor("rgb(10, 20, 30)")).toBe("rgb(10, 20, 30)");
  });

  it("creates a transparent fill color from resolved rgb values", () => {
    document.documentElement.style.setProperty("--chart-3", "rgb(120, 130, 140)");

    expect(withChartAlpha("var(--chart-3)", 0.2)).toBe("rgba(120, 130, 140, 0.2)");
  });

  it("creates a transparent fill color from hex values", () => {
    expect(withChartAlpha("#336699", 0.2)).toBe("#33669933");
  });
});
