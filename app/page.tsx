import { EarningsCalendarTable } from "@/components/home/earnings-calendar-table";
import { HeroSearch } from "@/components/home/hero-search";
import { MostActivePanel } from "@/components/home/most-active-panel";
import { MoversPanel } from "@/components/home/movers-panel";
import { NewsHeadlines } from "@/components/home/news-headlines";
import { SectorPulseRow } from "@/components/home/sector-pulse-row";
import { TickerTape } from "@/components/home/ticker-tape";
import { TrendingPanel } from "@/components/home/trending-panel";
import { SetupPanel } from "@/components/ui/setup-panel";
import { HOME_MOVER_SCREENS } from "@/lib/stock-yard/constants";
import { isStockYardConfigured } from "@/lib/stock-yard/env";
import { stockYardServer } from "@/lib/stock-yard/server";
import type { NewsResponse } from "@/lib/stock-yard/schemas";

export default async function HomePage() {
  const configured = isStockYardConfigured();

  const moversPromises = configured
    ? HOME_MOVER_SCREENS.map((screen) => stockYardServer.getMovers(screen.key, 6))
    : [];

  const [moversResults, benchmarksResult, earningsResult, sectorPulseResult] = configured
    ? await Promise.all([
        Promise.allSettled(moversPromises),
        stockYardServer.getBenchmarks().then(
          (value) => ({ status: "fulfilled" as const, value }),
          (reason) => ({ status: "rejected" as const, reason }),
        ),
        stockYardServer.getEarningsCalendar(8).then(
          (value) => ({ status: "fulfilled" as const, value }),
          (reason) => ({ status: "rejected" as const, reason }),
        ),
        stockYardServer.getSectorPulse().then(
          (value) => ({ status: "fulfilled" as const, value }),
          (reason) => ({ status: "rejected" as const, reason }),
        ),
      ])
    : [[], null, null, null] as const;

  const benchmarks = benchmarksResult && benchmarksResult.status === "fulfilled" ? benchmarksResult.value : null;
  const earnings = earningsResult && earningsResult.status === "fulfilled" ? earningsResult.value : null;
  const sectorPulse = sectorPulseResult && sectorPulseResult.status === "fulfilled" ? sectorPulseResult.value : null;

  // most_active is index 2 in HOME_MOVER_SCREENS
  const mostActive = Array.isArray(moversResults) && moversResults[2]?.status === "fulfilled"
    ? moversResults[2].value
    : null;

  // gainers is index 0, losers is index 1
  const gainers = Array.isArray(moversResults) && moversResults[0]?.status === "fulfilled"
    ? moversResults[0].value
    : null;
  const losers = Array.isArray(moversResults) && moversResults[1]?.status === "fulfilled"
    ? moversResults[1].value
    : null;

  // Fetch one news item per top-5 most-active symbol
  const top5Symbols = mostActive?.results.slice(0, 5).map((r) => r.symbol) ?? [];
  const newsResults: Array<{ symbol: string; item: NewsResponse["news"][number] }> = [];

  if (configured && top5Symbols.length) {
    const fetched = await Promise.allSettled(
      top5Symbols.map((sym) => stockYardServer.getTickerNews(sym, 1)),
    );
    for (let i = 0; i < fetched.length; i++) {
      const result = fetched[i];
      if (result.status === "fulfilled" && result.value.news[0]) {
        newsResults.push({ symbol: top5Symbols[i], item: result.value.news[0] });
      }
    }
  }

  return (
    <>
      {!configured ? <SetupPanel /> : null}
      <TickerTape data={mostActive} />
      <HeroSearch benchmarks={benchmarks} />
      <SectorPulseRow data={sectorPulse} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_300px] border-b border-(--line)">
        <MoversPanel gainers={gainers} losers={losers} mostActive={mostActive} />
        <TrendingPanel data={mostActive} />
        <MostActivePanel data={mostActive} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <EarningsCalendarTable data={earnings} />
        <NewsHeadlines news={newsResults} />
      </div>
    </>
  );
}
