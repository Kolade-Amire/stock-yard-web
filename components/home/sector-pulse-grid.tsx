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
          <MicroBarChart
            variant="ranked"
            items={topSectors.map((sector) => ({
              id: sector.key,
              label: sector.name,
              meta: sector.topCompanies.slice(0, 3).map((company) => company.symbol).join(" · "),
              value: sector.overview.marketWeight,
              a11yLabel: `${sector.name}: ${formatPercent(sector.overview.marketWeight, 1)}`,
            }))}
            valueFormat={{ style: "percent", digits: 1 }}
          />
          <DataLimitations items={data?.dataLimitations ?? []} />
        </div>
      ) : (
        <p className="text-sm text-(--ink-muted)">Sector data will appear here once the API responds.</p>
      )}
    </Card>
  );
}
