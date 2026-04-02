import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MicroBarChart, buildBarChartScale } from "@/components/charts/micro-bar-chart";

describe("MicroBarChart", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not emit duplicate-key warnings when labels collide but ids differ", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MicroBarChart
        items={[
          { id: "consumer-cyclical", label: "Cons", value: 12, meta: "FY 2024" },
          { id: "consumer-defensive", label: "Cons", value: 18, meta: "FY 2025" },
        ]}
      />,
    );

    const duplicateKeyWarningLogged = consoleError.mock.calls.some((args) =>
      args.some((value) => String(value).includes("Encountered two children with the same key")),
    );

    expect(duplicateKeyWarningLogged).toBe(false);
    expect(screen.getAllByText("Cons")).toHaveLength(2);
  });

  it("builds a mixed-sign scale with a zero baseline inside the chart", () => {
    const scale = buildBarChartScale([-18, 42]);

    expect(scale.min).toBeLessThan(0);
    expect(scale.max).toBeGreaterThan(0);
    expect(scale.ticks).toContain(0);
    expect(scale.zeroRatio).toBeGreaterThan(0);
    expect(scale.zeroRatio).toBeLessThan(1);
  });

  it("shows compact temporal detail by default and exact values on focus", () => {
    render(
      <MicroBarChart
        variant="temporal"
        items={[
          { id: "fy24", label: "2024", meta: "Fiscal year 2024", value: 120_000_000 },
          { id: "fy25", label: "2025", meta: "Fiscal year 2025", value: 160_000_000 },
        ]}
        valueFormat={{ style: "currency", currency: "USD", digits: 1 }}
        tickFormat={{ style: "currency", currency: "USD", digits: 0 }}
      />,
    );

    expect(screen.getByText("Fiscal year 2025")).toBeInTheDocument();
    expect(screen.getByText("$160M")).toBeInTheDocument();

    fireEvent.focus(screen.getByRole("button", { name: "Fiscal year 2024: $120,000,000" }));

    expect(screen.getByText("Fiscal year 2024")).toBeInTheDocument();
    expect(screen.getByText("$120,000,000")).toBeInTheDocument();
  });

  it("renders ranked rows with inline metadata and values", () => {
    render(
      <MicroBarChart
        variant="ranked"
        items={[
          { id: "tech", label: "Technology", meta: "AAPL · MSFT · NVDA", value: 0.21 },
          { id: "health", label: "Healthcare", meta: "LLY · UNH · JNJ", value: 0.12 },
        ]}
        valueFormat={{ style: "percent", digits: 1 }}
      />,
    );

    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("AAPL · MSFT · NVDA")).toBeInTheDocument();
    expect(screen.getByText("21.0%")).toBeInTheDocument();
    expect(screen.getByText("Healthcare")).toBeInTheDocument();
  });
});
