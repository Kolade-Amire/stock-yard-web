import { Card } from "@/components/ui/card";
import { MicroBarChart } from "@/components/charts/micro-bar-chart";
import { formatPercent } from "@/lib/stock-yard/format";
import type { SectorPulseResponse } from "@/lib/stock-yard/schemas";

type SectorPulseGridProps = {
  data: SectorPulseResponse | null;
};

export function SectorPulseGrid({ data }: SectorPulseGridProps) {
  const topSectors = data?.sectors.slice(0, 6) ?? [];

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
      <Card className="px-5 py-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-(family-name:--font-display) text-2xl text-(--ink)">Sector pulse</h3>
            <p className="text-sm text-(--ink-muted)">Compact sector breadth for fast market orientation.</p>
          </div>
        </div>
        <MicroBarChart
          items={topSectors.map((sector) => ({
            label: sector.name.slice(0, 4),
            value: sector.overview.marketWeight,
          }))}
        />
      </Card>
      <div className="grid gap-4">
        {topSectors.slice(0, 3).map((sector) => (
          <Card key={sector.key} className="px-5 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="font-(family-name:--font-display) text-xl text-(--ink)">{sector.name}</h4>
                <p className="mt-1 text-sm text-(--ink-muted)">{sector.topCompanies.map((company) => company.symbol).join(" · ")}</p>
              </div>
              <p className="text-sm font-medium text-(--ink)">{formatPercent(sector.overview.marketWeight, 1)}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
