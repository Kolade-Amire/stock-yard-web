"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

import { TickerResolverResults } from "@/components/search/ticker-resolver-results";
import { getOptionId, useTickerResolverSearch } from "@/components/search/use-ticker-resolver-search";
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
    <div className="relative w-[290px] shrink-0 lg:w-[320px]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          resolver.submitActiveResult();
        }}
        className="glass-shell glass-input-shell flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
      >
        <Search className="size-4 shrink-0 text-(--ink-soft)" />
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
      </form>
      <TickerResolverResults
        activeIndex={resolver.activeIndex}
        className="top-[calc(100%+6px)]"
        compact
        displayMode="overlay"
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
