import { formatPercent } from "@/lib/stock-yard/format";
import type { SectorPulseResponse } from "@/lib/stock-yard/schemas";

type SectorPulseRowProps = {
  data: SectorPulseResponse | null;
};

export function SectorPulseRow({ data }: SectorPulseRowProps) {
  const sectors = (data?.sectors ?? []).slice(0, 8);
  if (!sectors.length) return null;

  const maxWeight = Math.max(...sectors.map((s) => s.overview.marketWeight ?? 0), 1);

  return (
    <div className="flex border-b border-(--line) overflow-x-auto" role="list" aria-label="Sector weights">
      {sectors.map((sector) => {
        const weight = sector.overview.marketWeight ?? 0;
        const barWidth = Math.round((weight / maxWeight) * 100);

        return (
          <div
            key={sector.key}
            role="listitem"
            className="flex-1 min-w-[90px] px-3.5 py-4 border-r border-(--line) last:border-r-0 hover:bg-(--surface-muted) transition-colors cursor-default"
          >
            <p className="text-[11px] font-medium text-(--ink) mb-1 truncate">{sector.name}</p>
            <div className="mt-2 h-[2px] w-full rounded-full bg-(--surface-strong)">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${barWidth}%`,
                  background: "rgba(200,169,110,0.5)",
                }}
              />
            </div>
            <p
              className="text-[9px] text-(--ink-soft) mt-1.5"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {weight > 0 ? `${formatPercent(weight, 1)} mkt wt` : "—"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
