import { BenchmarkGrid } from "@/components/home/benchmark-grid";
import { EarningsCalendarTable } from "@/components/home/earnings-calendar-table";
import { HeroSearch } from "@/components/home/hero-search";
import { MoversBoard } from "@/components/home/movers-board";
import { SectorPulseGrid } from "@/components/home/sector-pulse-grid";
import { DataLimitations } from "@/components/ui/data-limitations";
import { SectionHeading } from "@/components/ui/section-heading";
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

      <section className="space-y-5">
        <SectionHeading
          eyebrow="Discovery"
          title="Market movers"
          description="Three quick cuts of the tape so the landing page stays useful even before you dive into a ticker."
        />
        <div className="grid gap-4 xl:grid-cols-3">
          {HOME_MOVER_SCREENS.map((screen, index) => (
            <MoversBoard
              key={screen.key}
              label={screen.label}
              data={Array.isArray(moversResults) && moversResults[index]?.status === "fulfilled" ? moversResults[index].value : null}
            />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeading
          eyebrow="Benchmarks"
          title="Context funds"
          description="Curated reference funds to anchor broad market, sector, and bond context."
        />
        <BenchmarkGrid data={benchmarks} />
        <DataLimitations items={benchmarks?.dataLimitations ?? []} />
      </section>

      <section className="space-y-5">
        <SectionHeading
          eyebrow="Calendar"
          title="Upcoming catalysts"
          description="A clean earnings tape with just enough information to spot what matters next."
        />
        <EarningsCalendarTable data={earnings} />
        <DataLimitations items={earnings?.dataLimitations ?? []} />
      </section>

      <section className="space-y-5">
        <SectionHeading
          eyebrow="Pulse"
          title="Sector orientation"
          description="Sector cards stay informational in V1 and help the landing page feel alive without turning into a cluttered screener."
        />
        <SectorPulseGrid data={sectorPulse} />
        <DataLimitations items={sectorPulse?.dataLimitations ?? []} />
      </section>
    </>
  );
}
