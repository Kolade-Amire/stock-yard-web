import { Card } from "@/components/ui/card";
import { MicroBarChart } from "@/components/charts/micro-bar-chart";
import { DataLimitations } from "@/components/ui/data-limitations";
import { formatPercent } from "@/lib/stock-yard/format";
import type { SectorPulseResponse } from "@/lib/stock-yard/schemas";

type SectorPulseGridProps = {
  data: SectorPulseResponse | null;
};

export function SectorPulseGrid({ data }: SectorPulseGridProps) {
  const topSectors = data?.sectors.slice(0, 6) ?? [];

  return (
    <Card variant="rail" className="px-4 py-4">
      <div className="mb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-(--ink-soft)">Sectors</p>
        <h3 className="mt-1 text-lg font-semibold text-(--ink-strong)">Market breadth</h3>
      </div>
      {topSectors.length ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-3">
            <MicroBarChart
              height={120}
              items={topSectors.map((sector) => ({
                id: sector.key,
                label: sector.name.slice(0, 4),
                value: sector.overview.marketWeight,
              }))}
            />
          </div>
          <div className="space-y-1.5">
            {topSectors.slice(0, 5).map((sector) => (
              <div key={sector.key} className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2.5">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-sm font-medium text-(--ink)">{sector.name}</h4>
                  <p className="text-xs font-medium text-(--accent)">{formatPercent(sector.overview.marketWeight, 1)}</p>
                </div>
                <p className="mt-1 text-xs text-(--ink-muted)">
                  {sector.topCompanies.slice(0, 3).map((company) => company.symbol).join(" · ")}
                </p>
              </div>
            ))}
          </div>
          <DataLimitations items={data?.dataLimitations ?? []} />
        </div>
      ) : (
        <p className="text-sm text-(--ink-muted)">Sector data will appear here once the API responds.</p>
      )}
    </Card>
  );
}
