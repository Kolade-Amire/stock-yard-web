import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OwnershipDonutChart } from "@/components/charts/ownership-donut-chart";

describe("OwnershipDonutChart", () => {
  it("renders the chart copy and shows the first holder by default", () => {
    render(
      <OwnershipDonutChart
        items={[
          { id: "vanguard", label: "Vanguard", rawValue: 0.5841, normalizedValue: 0.4, color: "var(--ownership-1)" },
          { id: "blackrock", label: "Blackrock", rawValue: 0.5009, normalizedValue: 0.34, color: "var(--ownership-2)" },
          { id: "fidelity", label: "Fidelity", rawValue: 0.3573, normalizedValue: 0.26, color: "var(--ownership-3)" },
        ]}
      />,
    );

    expect(screen.getByText("Holder mix")).toBeInTheDocument();
    expect(screen.getByText("Breakdown of displayed holders")).toBeInTheDocument();
    expect(screen.getByText("58.41%")).toBeInTheDocument();
    expect(screen.getByText("Vanguard")).toBeInTheDocument();
  });

  it("updates the center detail when a slice receives focus", () => {
    render(
      <OwnershipDonutChart
        items={[
          { id: "vanguard", label: "Vanguard", rawValue: 0.5841, normalizedValue: 0.4, color: "var(--ownership-1)" },
          { id: "blackrock", label: "Blackrock", rawValue: 0.5009, normalizedValue: 0.34, color: "var(--ownership-2)" },
          { id: "fidelity", label: "Fidelity", rawValue: 0.3573, normalizedValue: 0.26, color: "var(--ownership-3)" },
        ]}
      />,
    );

    fireEvent.focus(screen.getByRole("button", { name: "Blackrock: 50.09% reported held" }));

    expect(screen.getByText("50.09%")).toBeInTheDocument();
    expect(screen.getByText("Blackrock")).toBeInTheDocument();
  });

  it("can show normalized displayed-total percentages for share-based charts", () => {
    render(
      <OwnershipDonutChart
        valueMode="normalized_percent"
        valueLabel="Share of displayed total"
        subtitle="Normalized from displayed insider share totals"
        items={[
          { id: "andreessen", label: "Andreessen", rawValue: 69_170, normalizedValue: 0.63, color: "var(--ownership-1)" },
          { id: "bosworth", label: "Bosworth", rawValue: 24_000, normalizedValue: 0.22, color: "var(--ownership-2)" },
          { id: "killefer", label: "Killefer", rawValue: 16_500, normalizedValue: 0.15, color: "var(--ownership-3)" },
        ]}
      />,
    );

    expect(screen.getByText("Share of displayed total")).toBeInTheDocument();
    expect(screen.getByText("63.00%")).toBeInTheDocument();

    fireEvent.focus(screen.getByRole("button", { name: "Bosworth: 22.00% of displayed insider total" }));

    expect(screen.getByText("22.00%")).toBeInTheDocument();
    expect(screen.getByText("Bosworth")).toBeInTheDocument();
  });
});
