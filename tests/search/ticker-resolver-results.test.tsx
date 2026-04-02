import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TickerResolverResults } from "@/components/search/ticker-resolver-results";

vi.mock("@/components/ui/ticker-logo", () => ({
  TickerLogo: () => <div data-testid="ticker-logo" />,
}));

const RESULTS = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NMS",
    quoteType: "EQUITY",
  },
];

describe("TickerResolverResults", () => {
  it("renders overlay mode with absolute positioning", () => {
    render(
      <TickerResolverResults
        activeIndex={0}
        displayMode="overlay"
        emptyMessage="No matches found."
        getOptionId={(index) => `option-${index}`}
        isPending={false}
        isOpen
        listboxId="results"
        onHover={vi.fn()}
        onSelect={vi.fn()}
        results={RESULTS}
      />,
    );

    expect(screen.getByRole("listbox")).toHaveClass("absolute");
  });

  it("renders inline mode in normal flow", () => {
    render(
      <TickerResolverResults
        activeIndex={0}
        displayMode="inline"
        emptyMessage="No matches found."
        getOptionId={(index) => `option-${index}`}
        isPending={false}
        isOpen
        listboxId="results"
        onHover={vi.fn()}
        onSelect={vi.fn()}
        results={RESULTS}
      />,
    );

    expect(screen.getByRole("listbox")).not.toHaveClass("absolute");
    expect(screen.getByRole("listbox")).toHaveClass("mt-2");
  });
});
