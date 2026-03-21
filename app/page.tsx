import { BenchmarkGrid } from "@/components/home/benchmark-grid";
import { EarningsCalendarTable } from "@/components/home/earnings-calendar-table";
import { HeroSearch } from "@/components/home/hero-search";
import { MoversBoard } from "@/components/home/movers-board";
import { SectorPulseGrid } from "@/components/home/sector-pulse-grid";
import { SetupPanel } from "@/components/ui/setup-panel";
import { HOME_MOVER_SCREENS } from "@/lib/stock-yard/constants";
import { isStockYardConfigured } from "@/lib/stock-yard/env";
import { stockYardServer } from "@/lib/stock-yard/server";

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

  return (
    <>
      <HeroSearch />
      {!configured ? <SetupPanel /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
        <div className="space-y-6">
          <section className="grid gap-4 xl:grid-cols-3">
            {HOME_MOVER_SCREENS.map((screen, index) => (
              <MoversBoard
                key={screen.key}
                label={screen.label}
                data={Array.isArray(moversResults) && moversResults[index]?.status === "fulfilled" ? moversResults[index].value : null}
              />
            ))}
          </section>
          <EarningsCalendarTable data={earnings} />
        </div>
        <aside className="space-y-6">
          <BenchmarkGrid data={benchmarks} />
          <SectorPulseGrid data={sectorPulse} />
        </aside>
      </div>
    </>
  );
}
