import Link from "next/link";

import { Card } from "@/components/ui/card";
import { DataLimitations } from "@/components/ui/data-limitations";
import { formatCurrency, formatNumber, formatSignedPercent } from "@/lib/stock-yard/format";
import { tickerRoute } from "@/lib/routes";
import type { MoversResponse } from "@/lib/stock-yard/schemas";

type MoversBoardProps = {
  data: MoversResponse | null;
  label: string;
};

export function MoversBoard({ data, label }: MoversBoardProps) {
  return (
    <Card variant="panel" className="px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-(family-name:--font-display) text-[1.7rem] text-(--ink)">{label}</h3>
        <p className="text-[11px] uppercase tracking-[0.28em] text-(--ink-soft)">Movers</p>
      </div>
      {data ? (
        <div className="space-y-2.5">
          {data.results.slice(0, 6).map((item) => (
            <Link
              key={item.symbol}
              href={tickerRoute(item.symbol)}
              className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-[22px] border border-(--line) bg-(--surface-muted) px-4 py-3 transition-colors hover:border-(--line-heavy) hover:bg-(--surface-float)"
            >
              <div>
                <p className="font-semibold text-(--ink)">{item.symbol}</p>
                <p className="truncate text-sm text-(--ink-muted)">{item.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-(--ink)">{formatCurrency(item.currentPrice)}</p>
                <p className={item.percentChange !== null && item.percentChange >= 0 ? "text-sm text-(--positive)" : "text-sm text-(--negative)"}>
                  {formatSignedPercent(item.percentChange)}
                </p>
                <p className="text-xs text-(--ink-soft)">{formatNumber(item.volume)}</p>
              </div>
            </Link>
          ))}
          <DataLimitations items={data.dataLimitations} />
        </div>
      ) : (
        <p className="text-sm text-(--ink-muted)">Mover data will appear here when the API is configured.</p>
      )}
    </Card>
  );
}
