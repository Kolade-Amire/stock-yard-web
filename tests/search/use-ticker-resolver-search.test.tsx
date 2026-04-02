import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getOptionId, useTickerResolverSearch } from "@/components/search/use-ticker-resolver-search";
import { stockYardClient } from "@/lib/stock-yard/client";
import type { SearchResult } from "@/lib/stock-yard/schemas";

vi.mock("@/lib/stock-yard/client", () => ({
  stockYardClient: {
    searchTickers: vi.fn(),
  },
}));

const SEARCH_RESULTS: SearchResult[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NMS",
    quoteType: "EQUITY",
  },
  {
    symbol: "APLE",
    name: "Apple Hospitality REIT",
    exchange: "NYSE",
    quoteType: "EQUITY",
  },
];

function TestWrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function SearchHarness({ onResolve }: { onResolve: (result: SearchResult) => boolean | void }) {
  const resolver = useTickerResolverSearch({ onResolve });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        resolver.submitActiveResult();
      }}
    >
      <input
        aria-label="Search"
        role="combobox"
        value={resolver.query}
        onChange={(event) => resolver.setQuery(event.target.value)}
        onFocus={resolver.handleInputFocus}
        onKeyDown={resolver.handleInputKeyDown}
        aria-haspopup="listbox"
        aria-controls={resolver.listboxId}
        aria-activedescendant={resolver.activeDescendantId}
        aria-expanded={resolver.shouldShowResults}
      />
      <button type="submit" disabled={!resolver.canSubmit}>
        Search
      </button>
      {resolver.shouldShowResults ? (
        <ul id={resolver.listboxId} role="listbox">
          {resolver.results.map((result, index) => (
            <li key={result.symbol}>
              <button
                id={getOptionId(resolver.listboxId, index)}
                type="button"
                onMouseEnter={() => resolver.handleResultMouseEnter(index)}
                onClick={() => resolver.handleResultSelect(result)}
              >
                {result.name} / {result.symbol}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}

describe("useTickerResolverSearch", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does not query the resolver for one-character input", async () => {
    const searchTickers = vi.mocked(stockYardClient.searchTickers);
    searchTickers.mockResolvedValue({ query: "A", results: SEARCH_RESULTS });

    render(<SearchHarness onResolve={vi.fn()} />, { wrapper: TestWrapper });

    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "A" } });

    await waitFor(() => {
      expect(searchTickers).not.toHaveBeenCalled();
    });
  });

  it("submits the top resolver result instead of the raw query text", async () => {
    const onResolve = vi.fn();
    const searchTickers = vi.mocked(stockYardClient.searchTickers);
    searchTickers.mockResolvedValue({ query: "Apple", results: SEARCH_RESULTS });

    render(<SearchHarness onResolve={onResolve} />, { wrapper: TestWrapper });

    const input = screen.getByLabelText("Search");
    fireEvent.change(input, { target: { value: "Apple" } });

    await screen.findByText("Apple Inc. / AAPL");

    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(onResolve).toHaveBeenCalledWith(expect.objectContaining({ symbol: "AAPL", name: "Apple Inc." }));
    });
  });

  it("uses keyboard navigation to select a non-default resolver result", async () => {
    const onResolve = vi.fn();
    const searchTickers = vi.mocked(stockYardClient.searchTickers);
    searchTickers.mockResolvedValue({ query: "Apple", results: SEARCH_RESULTS });

    render(<SearchHarness onResolve={onResolve} />, { wrapper: TestWrapper });

    const input = screen.getByLabelText("Search");
    fireEvent.change(input, { target: { value: "Apple" } });

    await screen.findByText("Apple Hospitality REIT / APLE");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(onResolve).toHaveBeenCalledWith(expect.objectContaining({ symbol: "APLE" }));
    });
  });

  it("does not fall back to raw text when the resolver returns no results", async () => {
    const onResolve = vi.fn();
    const searchTickers = vi.mocked(stockYardClient.searchTickers);
    searchTickers.mockResolvedValue({ query: "Unknown Company", results: [] });

    render(<SearchHarness onResolve={onResolve} />, { wrapper: TestWrapper });

    const input = screen.getByLabelText("Search");
    fireEvent.change(input, { target: { value: "Unknown Company" } });

    await waitFor(() => {
      expect(searchTickers).toHaveBeenCalledWith("Unknown Company");
    });

    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(onResolve).not.toHaveBeenCalled();
    });
  });
});
