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
});
