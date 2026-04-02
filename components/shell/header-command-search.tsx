"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

import { TickerResolverResults } from "@/components/search/ticker-resolver-results";
import { getOptionId, useTickerResolverSearch } from "@/components/search/use-ticker-resolver-search";
import { Button } from "@/components/ui/button";
import { pushRecentSymbol } from "@/lib/recent-symbols";
import { tickerRoute } from "@/lib/routes";

export function HeaderCommandSearch() {
  const router = useRouter();
  const resolver = useTickerResolverSearch({
    maxResults: 5,
    onResolve(result) {
      pushRecentSymbol(result.symbol);

      startTransition(() => {
        router.push(tickerRoute(result.symbol));
      });
    },
  });

  return (
    <div className="relative min-w-[260px]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          resolver.submitActiveResult();
        }}
        className="flex items-center gap-2 rounded-lg border border-(--line) bg-(--surface) px-3 py-2"
      >
        <Search className="size-4 text-(--ink-soft)" />
        <input
          role="combobox"
          value={resolver.query}
          onChange={(event) => resolver.setQuery(event.target.value)}
          onFocus={resolver.handleInputFocus}
          onKeyDown={resolver.handleInputKeyDown}
          placeholder="Search symbols or companies…"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-controls={resolver.listboxId}
          aria-activedescendant={resolver.activeDescendantId}
          aria-expanded={resolver.shouldShowResults}
          className="w-full bg-transparent text-sm text-(--ink) outline-none placeholder:text-(--ink-soft)"
        />
        <Button type="submit" variant="secondary" size="compact" disabled={!resolver.canSubmit}>
          Go
        </Button>
      </form>
      <TickerResolverResults
        activeIndex={resolver.activeIndex}
        className="top-[calc(100%+6px)]"
        compact
        emptyMessage="No matches found."
        errorMessage={resolver.errorMessage}
        getOptionId={(index) => getOptionId(resolver.listboxId, index)}
        isPending={resolver.isPending}
        isOpen={resolver.shouldShowResults}
        listboxId={resolver.listboxId}
        onHover={resolver.handleResultMouseEnter}
        onPrefetchSymbol={(symbol) => router.prefetch(tickerRoute(symbol))}
        onSelect={resolver.handleResultSelect}
        results={resolver.results}
      />
    </div>
  );
}
