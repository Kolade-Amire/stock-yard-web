"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

import { TickerResolverResults } from "@/components/search/ticker-resolver-results";
import { getOptionId, useTickerResolverSearch } from "@/components/search/use-ticker-resolver-search";
import { HeroBenchmarks } from "@/components/home/benchmark-grid";
import { tickerRoute } from "@/lib/routes";
import { pushRecentSymbol } from "@/lib/recent-symbols";
import type { BenchmarksResponse } from "@/lib/stock-yard/schemas";

const HINT_SYMBOLS = ["AAPL", "NVDA", "TSLA", "SPY", "MSFT", "QQQ"];

type HeroSearchProps = {
  benchmarks: BenchmarksResponse | null;
};

export function HeroSearch({ benchmarks }: HeroSearchProps) {
  const router = useRouter();
  const resolver = useTickerResolverSearch({
    maxResults: 6,
    onResolveAction(result) {
      pushRecentSymbol(result.symbol);
      startTransition(() => {
        router.push(tickerRoute(result.symbol));
      });
    },
  });

  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <section className="border-b border-(--line) px-4 py-12 md:px-6 xl:px-8">
      <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <p
            className="text-[10px] font-medium tracking-[0.14em] uppercase mb-3.5"
            style={{ fontFamily: "var(--font-mono)", color: "var(--gold)" }}
          >
            Market Intelligence · {today}
          </p>
          <h1
            className="text-[36px] leading-[1.1] tracking-[-0.03em] text-(--ink-strong) mb-4 font-normal sm:text-[44px]"
            style={{ fontFamily: "var(--font-serif), serif" }}
          >
            Your edge starts<br />
            with <em className="italic" style={{ color: "var(--gold)" }}>the right data</em>
          </h1>
          <p className="text-[13px] leading-[1.7] text-(--ink-muted) max-w-[460px] mb-7">
            Search any US equity or ETF. Get grounded AI analysis, earnings context, analyst consensus, and ownership data — all from one place.
          </p>

          <div className="relative z-20 max-w-[480px] mb-5">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                resolver.submitActiveResult();
              }}
              className="flex items-center bg-(--surface-muted) border border-(--line-strong) rounded-xl overflow-hidden"
            >
              <input
                role="combobox"
                value={resolver.query}
                onChange={(event) => resolver.setQuery(event.target.value)}
                onFocus={resolver.handleInputFocus}
                onKeyDown={resolver.handleInputKeyDown}
                placeholder="Search ticker or company name…"
                aria-autocomplete="list"
                aria-haspopup="listbox"
                aria-controls={resolver.listboxId}
                aria-activedescendant={resolver.activeDescendantId}
                aria-expanded={resolver.shouldShowResults}
                className="flex-1 px-4 py-3 text-[13px] text-(--ink) bg-transparent outline-none placeholder:text-(--ink-soft)"
              />
              <button
                type="submit"
                className="px-5 py-3 text-[11px] font-medium tracking-[0.06em] text-(--canvas) shrink-0 cursor-pointer border-0"
                style={{ background: "var(--ink)", fontFamily: "var(--font-mono)" }}
              >
                SEARCH
              </button>
            </form>
            <TickerResolverResults
              activeIndex={resolver.activeIndex}
              className="top-[calc(100%+8px)]"
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

          <div className="flex flex-wrap gap-1.5">
            {HINT_SYMBOLS.map((sym) => (
              <Link
                key={sym}
                href={tickerRoute(sym)}
                onClick={() => pushRecentSymbol(sym)}
                className="text-[10px] border border-(--line-strong) rounded-full px-2.5 py-1 text-(--ink-muted) hover:bg-(--surface-muted) transition-colors"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {sym}
              </Link>
            ))}
          </div>
        </div>

        <div className="min-w-0 pt-1">
          <HeroBenchmarks data={benchmarks} />
        </div>
      </div>
    </section>
  );
}
